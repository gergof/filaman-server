import { FastifyPluginAsync } from 'fastify';
import Winston from 'winston';

import Db from '../../Db';
import Oidc from '../../Oidc';
import Authz from '../../authz';

export type RouteCtx = {
	db: Db;
	authz: Authz;
	oidc: Oidc;
	logger: Winston.Logger;
};
type Route = FastifyPluginAsync<RouteCtx>;

export default Route;
