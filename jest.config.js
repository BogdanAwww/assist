module.exports = {
	testEnvironment: 'node',
	preset: 'ts-jest',
	globals: {
		'ts-jest': {
			tsConfig: '<rootDir>/tests/tsconfig.json',
			isolatedModules: true,
			diagnostics: false
		}
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	transform: {
		'\\.(ts|js)$': 'babel-jest'
	},
	roots: ['<rootDir>/tests'],
	testPathIgnorePatterns: ['/node_modules/', '/lib/'],
	testMatch: ['**/*.test.(ts|js)']
};
