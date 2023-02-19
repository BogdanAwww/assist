const fs = require('fs');
const path = require('path');

async function parseCities15000() {
    const cities = {};
    return new Promise((resolve) => {
        const filepath = path.join(__dirname, 'cities15000.txt');

        var lineReader = require('readline').createInterface({
            input: fs.createReadStream(filepath)
        });

        // var counter = 0;
        lineReader.on('line', function (line) {
            // console.log('Line from file:', line);
            const cells = line.split('\t')
            const city = {
                geonameid: cells[0],
                name: cells[1],
                // asciiname: cells[2],
                // alternatenames: cells[3],
                latitude: cells[4],
                longitude: cells[5],
                // feature_class: cells[6],
                // feature_code: cells[7],
                country_code: cells[8],
                // cc2: cells[9],
                // admin1_code: cells[10],
                // admin2_code: cells[11],
                // admin3_code: cells[12],
                // admin4_code: cells[13],
                // population: cells[14],
                // elevation: cells[15],
                // dem: cells[16],
                timezone: cells[17],
                // modification_date: cells[18]
            };
            cities[cells[0]] = city;
            // if (city.alternatenames) {
            //     console.log(city);
            // }

            // console.log(city);
            // counter++;
            // if (counter === 100) {
            //     process.exit();
            // }
        });

        lineReader.on('close', () => {
            // console.log(counter);
            resolve(cities);
        });
    });
}

async function parseAlternateNames(cities) {
    const results = [];
    return new Promise((resolve) => {
        const filepath = path.join(__dirname, 'alternateNames.txt');

        var lineReader = require('readline').createInterface({
            input: fs.createReadStream(filepath)
        });

        // var counter = 0;
        lineReader.on('line', function (line) {
            // console.log('Line from file:', line);
            const cells = line.split('\t');
            const city = cities[cells[1]];
            if (city && !city.names && cells[2] === 'ru') {
                city.names = {
                    ru: cells[3]
                };
                results.push(city);
                // const city = {
                //     alternateNameId: cells[0],
                //     geonameid: cells[1],
                //     isolanguage: cells[2],
                //     alternate_name: cells[3],
                //     isPreferredName: cells[4],
                //     isShortName: cells[5],
                //     isColloquial: cells[6],
                //     isHistoric: cells[7],
                //     from: cells[8],
                //     to: cells[9]
                // };
            }

            // counter++;
            // if (counter === 100) {
            //     process.exit();
            // }
        });

        lineReader.on('close', () => {
            // console.log(counter);
            resolve(results);
        });
    });
}

async function parseCountriesIds(countries) {
    return new Promise((resolve) => {
        const filepath = path.join(__dirname, 'allCountries.txt');
        var lineReader = require('readline').createInterface({
            input: fs.createReadStream(filepath)
        });

        var counter = 0;
        lineReader.on('line', function (line) {
            const cells = line.split('\t');
            const country = countries[cells[8]];
            if (country && country.name.trim() == cells[2].trim()) {
                country.id = cells[0];
            }
            // counter++;
            // if (counter > 10000) {
            //     lineReader.close();
            // }
        });

        lineReader.on('close', () => {
            resolve();
        });
    });
}

async function parseCountriesAlternateNames(cities) {
    const results = [];
    return new Promise((resolve) => {
        const filepath = path.join(__dirname, 'alternateNames.txt');
        var lineReader = require('readline').createInterface({
            input: fs.createReadStream(filepath)
        });

        lineReader.on('line', function (line) {
            const cells = line.split('\t');
            const city = cities[cells[1]];
            if (city && cells[2] === 'ru') {
                city.nameRu = cells[3];
                results.push(city);
            }
        });

        lineReader.on('close', () => {
            resolve(results);
        });
    });
}

async function parseCities() {
    const cities = await parseCities15000();
    // console.log(cities.length);
    const results = await parseAlternateNames(cities);
    const countries = JSON.parse(fs.readFileSync(path.join(__dirname, './countries.json'), 'utf8'));
    const countriesMap = {};
    countries.forEach((country) => {
        countriesMap[country.code] = country;
    });
    results.forEach((city) => {
        cityCountry = countriesMap[city.country_code];
        if (cityCountry) {
            city.fullNames = {
                ru: [cityCountry.names.ru, city.names.ru].join(', ')
            };
        }
    })
    fs.writeFileSync(path.join(__dirname, './cities.json'), JSON.stringify(results, null, '\t'));
}

async function parseCountries() {
    const countries = [];
    const cells = fs.readFileSync(path.join(__dirname, './countries.txt'), 'utf8').split('\n').map((line) => line.split('\t'));
    const ruNames = JSON.parse(fs.readFileSync(path.join(__dirname, './countries-ru.json'), 'utf8'));
    cells.forEach((cell) => {
        countries.push({
            code: cell[0],
            name: cell[4],
            names: {
                ru: ruNames[cell[0]]
            }
        });
    });

    // console.log(countries);
    fs.writeFileSync(path.join(__dirname, './countries.json'), JSON.stringify(countries, null, '\t'));
}

parseCities();
// parseCountries();