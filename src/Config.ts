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

export interface AwsConfig {
	region: string;
	keyId: string;
	secret: string;
	public: {
		s3: {
			bucket: string;
		};
	};
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
	_aws: AwsConfig;
	_api: ApiConfig;
	_log: LogConfig;

	constructor() {
		dotenv.config();

		this._db = {
			host: env.get('DB_HOST').required().asString(),
			port: env.get('DB_PORT').default(3306).asPortNumber(),
			user: env.get('DB_USER').required().asString(),
			password: env.get('DB_PASSWORD').required().asString(),
			name: env.get('DB_NAME').required().asString()
		};

		const oidcCount = env.get('OIDC_PROVIDERS').required().asIntPositive();
		this._oidc = {
			count: oidcCount,
			providers: _.times(oidcCount).map(i => ({
				discovery: env
					.get(`OIDC_${i + 1}_DISCOVERY`)
					.required()
					.asString()
			}))
		};

		this._smtp = {
			host: env.get('SMTP_HOST').required().asString(),
			port: env.get('SMTP_PORT').default(25).asPortNumber(),
			user: env.get('SMTP_USER').required().asString(),
			password: env.get('SMTP_PASSWORD').required().asString()
		};

		this._aws = {
			region: env.get('AWS_REGION').required().asString(),
			keyId: env.get('AWS_KEY_ID').required().asString(),
			secret: env.get('AWS_SECRET').required().asString(),
			public: {
				s3: {
					bucket: env.get('AWS_S3_BUCKET').required().asString()
				}
			}
		};

		this._api = {
			port: env.get('API_PORT').default(80).asPortNumber()
		};

		this._log = {
			level: env.get('LOG_LEVEL').default('info').asString(),
			format: env.get('LOG_FORMAT').default('json').asString(),
			transports: new Set(
				env.get('LOG_TRANSPORTS').default('console').asArray()
			)
		};
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

	public get aws(): AwsConfig {
		return _.cloneDeep(this._aws);
	}

	public get api(): ApiConfig {
		return _.cloneDeep(this._api);
	}

	public get log(): LogConfig {
		return _.cloneDeep(this._log);
	}
}

export default Config;
