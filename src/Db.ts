import 'reflect-metadata';
import { getConnectionManager, FindCondition } from 'typeorm';
import Winston from 'winston';

import { DbConfig } from './Config';
import * as models from './models';

class Db {
	private logger: Winston.Logger;
	private connection;

	constructor(config: DbConfig, logger: Winston.Logger) {
		this.logger = logger;

		const connectionManager = getConnectionManager();
		this.connection = connectionManager.create({
			type: 'mysql',
			host: config.host,
			port: config.port,
			username: config.user,
			password: config.password,
			database: config.name,
			synchronize: true,
			entities: Object.entries(models).map(entry => entry[1]),
			logging: this.logger.level == 'debug'
		});
	}

	public async connect(): Promise<void> {
		this.logger.info('Connecting to database');
		await this.connection.connect();
		this.logger.info('Connected to database');
	}

	public async close(): Promise<void> {
		this.logger.info('Closing database connection');
		try {
			await this.connection.close();
		} catch (e) {
			this.logger.warn('Exception while closing connection', {
				exception: e
			});
		}
		this.logger.info('Database connection closed');
	}

	public execFromRepo(repo: any): (q: FindCondition<any>) => Promise<any[]> {
		return (q: FindCondition<any>) => {
			return this.conn.getRepository(repo).find({ where: q });
		};
	}

	public get conn() {
		return this.connection;
	}
}

export default Db;
