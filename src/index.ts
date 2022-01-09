import Config from './Config';
import Logger from './Logger';
import Db from './Db';
import Authz from './authz';
import Api from './api';
import Oidc from './Oidc';

const config = new Config();

const loggerFactory = new Logger(config.log);

const logger = loggerFactory.createLogger('main');
const db = new Db(config.db, loggerFactory.createLogger('db'));
const authz = new Authz(loggerFactory.createLogger('authz'), db);
const oidc = new Oidc(config.oidc, loggerFactory.createLogger('oidc'));
const api = new Api(config.api, loggerFactory.createLogger('api'), db, authz, oidc);

const main = async () => {
	try {
		await db.connect();
		await authz.init();
		await oidc.init();
		await api.start();
	}
	catch(e) {
		logger.error('Failed to start up', {exception: e});
		console.log(e) // eslint-disable-line no-console
		exit();
		return;
	}
}

const exit = async () => {
	logger.info('Shutting down');
	await api.stop().catch(() => {});
	await db.close().catch(() => {});
	logger.info('Exited');
	process.exit();
}

process.on('SIGTERM', exit);
process.on('SIGINT', exit);

main();