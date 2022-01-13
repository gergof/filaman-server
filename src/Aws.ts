import { S3Client } from '@aws-sdk/client-s3';
import _ from 'lodash';
import Winston from 'winston';

import { AwsConfig } from './Config';

class Aws {
	private config: AwsConfig;
	private logger: Winston.Logger;
	private _s3: S3Client;

	constructor(config: AwsConfig, logger: Winston.Logger) {
		this.config = config;
		this.logger = logger;
		this.logger.info('Initializing AWS clients');

		this.logger.info('Creating S3 client');
		this._s3 = new S3Client({
			region: this.config.region,
			credentials: {
				accessKeyId: this.config.keyId,
				secretAccessKey: this.config.secret
			}
		});

		this.logger.info('Initialized');
	}

	public get conf(): AwsConfig['public'] {
		return _.cloneDeep(this.config.public);
	}

	public get s3(): S3Client {
		return this._s3;
	}
}

export default Aws;
