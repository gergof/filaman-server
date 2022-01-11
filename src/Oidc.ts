import jwt from 'jsonwebtoken';
import JwksClient from 'jwks-rsa';
import { Issuer } from 'openid-client';
import Winston from 'winston';

import { OidcConfig } from './Config';

class Oidc {
	private config: OidcConfig;
	private logger: Winston.Logger;
	private jwksClients: Map<number, JwksClient.JwksClient> = new Map<
		number,
		JwksClient.JwksClient
	>();
	private verifiers: Map<string, string> = new Map<string, string>();

	constructor(config: OidcConfig, logger: Winston.Logger) {
		this.config = config;
		this.logger = logger;
	}

	public async init() {
		this.logger.info('Discovering OIDC providers');

		for (const [i, provider] of this.config.providers.entries()) {
			this.logger.info(
				`Discovering OIDC provider using ${provider.discovery}`
			);
			const issuer = await Issuer.discover(provider.discovery);
			this.logger.info(`Discovered ${issuer.issuer}`);
			this.logger.info('Loading JWKS');
			const jwksClient = JwksClient({
				jwksUri: issuer.metadata.jwks_uri as string,
				cacheMaxAge: 300_000
			});

			this.jwksClients.set(i + 1, jwksClient);
		}
	}

	public verifyToken(provider: number, token: string): Promise<jwt.Jwt> {
		this.logger.debug('Verifiing JWT', { provider });
		return new Promise<jwt.Jwt>((resolve, reject) => {
			const getKey = (header: any, cb: any) => {
				const client = this.jwksClients.get(provider);

				if (!client) {
					this.logger.warn('Invalid provider', { provider });
					reject(new Error('Invalid x-auth-provider'));
					return;
				}

				client.getSigningKey(header.kid, (err, key) => {
					if (err) {
						cb(err);
						return;
					}

					cb(null, key.getPublicKey());
				});
			};

			jwt.verify(token, getKey, undefined, (err, decoded) => {
				if (err || !decoded) {
					this.logger.warn('Failed to decode key', {
						exception: err
					});
					reject(new Error('Invalid auth token'));
					return;
				}

				if (
					!(decoded as any).exp ||
					((decoded as any).exp as number) * 1000 < Date.now()
				) {
					reject(new Error('Expired auth token'));
				}

				resolve(decoded);
			});
		});
	}
}

export default Oidc;
