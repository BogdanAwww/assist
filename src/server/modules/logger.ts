import Winston from 'winston';
import WinstonLogStash from 'winston3-logstash-transport';

const logger = Winston.createLogger();

logger.add(
	new WinstonLogStash({
		mode: 'udp',
		host: '127.0.0.1',
		port: 28777
	})
);

logger.error('Some Error');

export default logger;
