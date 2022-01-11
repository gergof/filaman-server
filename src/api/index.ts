import Fastify from 'fastify';
import Winston from 'winston';

import { ApiConfig } from '../Config';
import Db from '../Db';
import Oidc from '../Oidc';
import Authz from '../authz';

import * as routes from './routes';

class Api {
	private config: ApiConfig;
	private logger: Winston.Logger;
	private fastify;
	private db: Db;
	private authz: Authz;
	private oidc: Oidc;

	constructor(
		config: ApiConfig,
		logger: Winston.Logger,
		db: Db,
		authz: Authz,
		oidc: Oidc
	) {
		this.config = config;
		this.logger = logger;
		this.db = db;
		this.authz = authz;
		this.oidc = oidc;

		const fastifyLogger = {
			...this.logger,
			fatal: (msg: any) => this.logger.error(`Fatal: ${msg}`),
			trace: (msg: any) => this.logger.debug(`Trace: ${msg}`),
			child: () => fastifyLogger
		};

		this.fastify = Fastify({
			logger: fastifyLogger
		});
	}

	public async start(): Promise<void> {
		this.logger.info('Starting');
		this.logger.info('Registering routes');
		for (const route of Object.values(routes)) {
			await this.fastify.register(route, {
				db: this.db,
				authz: this.authz,
				oidc: this.oidc,
				logger: this.logger
			});
		}

		await this.fastify.listen(this.config.port);
		this.logger.info(`Listening on port ${this.config.port}`);
	}

	public async stop(): Promise<void> {
		this.logger.info('Closing');
		await this.fastify.close();
	}
}

export default Api;
