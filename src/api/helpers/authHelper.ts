import { FastifyRequest, FastifyReply } from 'fastify';

import { User, UserAuthMethod, AuthRealm } from '../../models';
import { RouteCtx } from '../routes/Route';

const authHelper = async (
	req: FastifyRequest,
	resp: FastifyReply,
	{ oidc, db, logger }: RouteCtx
): Promise<User | null> => {
	let authUser: User | null = null;
	try {
		const provider = parseInt(req.headers['x-auth-provider'] as string);
		const jwt = req.headers.authorization || '';
		const token = (await oidc.verifyToken(provider, jwt)) as any;
		const authMethods = await db.conn.getRepository(UserAuthMethod).find({
			relations: ['realm', 'user'],
			where: {
				realmUserId: token.sub,
				realm: {
					id: provider
				}
			}
		});

		if (!authMethods.length) {
			logger.info('Registering user', {
				email: token.email,
				puid: token.sub,
				provider: provider
			});
			// register user
			const realm = await db.conn
				.getRepository(AuthRealm)
				.findOne(provider);

			if (!realm) {
				throw new Error('Failed to get realm');
			}

			const user = new User();
			user.name = token.name;
			user.email = token.email;
			await db.conn.getRepository(User).save(user);

			const authMethod = new UserAuthMethod();
			authMethod.realmUserId = token.sub;
			authMethod.realm = realm;
			authMethod.user = user;
			await db.conn.getRepository(UserAuthMethod).save(authMethod);

			authUser = user;
		} else {
			authUser = authMethods[0].user;
		}
	} catch (e) {
		logger.warn('Failed to authenticate user', { exception: e });
		authUser = null;
	}

	if (authUser) {
		logger.debug('Authenticated request', {
			uid: authUser.id,
			rid: req.id
		});
		return authUser;
	}

	resp.status(401);
	resp.send({ status: 401, error: 'Unauthorized' });
	return null;
};

export default authHelper;
