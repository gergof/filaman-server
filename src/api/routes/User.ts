import authHelper from '../helpers/authHelper';

import type Route from './Route';

const UserRoutes: Route = async (fastify, ctx) => {
	fastify.get('/me', async (req, resp) => {
		const user = await authHelper(req, resp, ctx);

		if (!user) {
			return;
		}

		return user;
	});
};

export default UserRoutes;
