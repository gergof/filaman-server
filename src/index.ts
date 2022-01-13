import Aws from './Aws';
import Config from './Config';
import Db from './Db';
import Logger from './Logger';
import Oidc from './Oidc';
import Api from './api';
import Authz from './authz';

const config = new Config();

const loggerFactory = new Logger(config.log);

const logger = loggerFactory.createLogger('main');
const db = new Db(config.db, loggerFactory.createLogger('db'));
const authz = new Authz(loggerFactory.createLogger('authz'), db);
const oidc = new Oidc(config.oidc, loggerFactory.createLogger('oidc'));
const aws = new Aws(config.aws, loggerFactory.createLogger('aws'));
const api = new Api(
	config.api,
	loggerFactory.createLogger('api'),
	db,
	authz,
	oidc,
	aws
);

const main = async () => {
	try {
		await db.connect();
		await authz.init();
		await oidc.init();
		await api.start();
	} catch (e) {
		logger.error('Failed to start up', { exception: e });
		console.log(e); // eslint-disable-line no-console
		exit();
		return;
	}
};

const exit = async () => {
	logger.info('Shutting down');
	await api.stop().catch(() => {});
	await db.close().catch(() => {});
	logger.info('Exited');
	process.exit();
};

process.on('SIGTERM', exit);
process.on('SIGINT', exit);

main();
