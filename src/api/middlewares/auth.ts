import { FastifyRequest, FastifyReply } from 'fastify';

import { User } from '../../models';
import authHelper from '../helpers/authHelper';
import type { RouteCtx } from '../routes/Route';

const auth = async <
	TReq extends FastifyRequest,
	TResp extends FastifyReply,
	TReply
>(
	req: TReq,
	resp: TResp,
	ctx: RouteCtx,
	route: (user: User) => Promise<TReply>
): Promise<TReply | undefined> => {
	const user = await authHelper(req, resp, ctx);

	if (user) {
		return await route(user);
	}
};

export default auth;
