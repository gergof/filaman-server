import dotenv from 'dotenv';
import env from 'env-var';
import _ from 'lodash';

export interface DbConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	name: string;
}

export interface OidcProviderConfig {
	discovery: string;
	client: string;
	secret: string;
	callback: string;
}

export interface OidcConfig {
	count: number;
	providers: OidcProviderConfig[];
}

export interface SmtpConfig {
	host: string;
	port: number;
	user: string;
	password: string;
}

export interface ApiConfig {
	port: number;
}

export interface LogConfig {
	level: string;
	format: string;
	transports: Set<string>;
}

class Config {
	_db: DbConfig;
	_oidc: OidcConfig;
	_smtp: SmtpConfig;
	_api: ApiConfig;
	_log: LogConfig;

	constructor() {
		dotenv.config();

		this._db = {
			host: env.get('DB_HOST').required().asString(),
			port: env.get('DB_PORT').default(3306).asPortNumber(),
			user: env.get('DB_USER').required().asString(),
			password: env.get('DB_PASSWORD').required().asString(),
			name: env.get('DB_NAME').required().asString(),
		};

		const oidcCount = env.get('OIDC_PROVIDERS').required().asIntPositive();
		this._oidc = {
			count: oidcCount,
			providers: _.times(oidcCount).map(i => ({
				discovery: env.get(`OIDC_${i+1}_DISCOVERY`).required().asString(),
				client: env.get(`OIDC_${i+1}_CLIENT`).required().asString(),
				secret: env.get(`OIDC_${i+1}_SECRET`).required().asString(),
				callback: env.get(`OIDC_${i+1}_CALLBACK`).required().asString()
			}))
		};

		this._smtp = {
			host: env.get('SMTP_HOST').required().asString(),
			port: env.get('SMTP_PORT').default(25).asPortNumber(),
			user: env.get('SMTP_USER').required().asString(),
			password: env.get('SMTP_PASSWORD').required().asString()
		}

		this._api = {
			port: env.get('API_PORT').default(80).asPortNumber()
		};

		this._log = {
			level: env.get('LOG_LEVEL').default('info').asString(),
			format: env.get('LOG_FORMAT').default('json').asString(),
			transports: new Set(env.get('LOG_TRANSPORTS').default('console').asArray())
		}
	}

	public get db(): DbConfig {
		return _.cloneDeep(this._db);
	}

	public get oidc(): OidcConfig {
		return _.cloneDeep(this._oidc);
	}

	public get smtp(): SmtpConfig {
		return _.cloneDeep(this._smtp);
	}

	public get api(): ApiConfig {
		return _.cloneDeep(this._api);
	}

	public get log(): LogConfig {
		return _.cloneDeep(this._log)
	}
}

export default Config;
