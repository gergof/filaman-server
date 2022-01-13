import { FastifyPluginAsync } from 'fastify';
import Winston from 'winston';

import Aws from '../../Aws';
import Db from '../../Db';
import Oidc from '../../Oidc';
import Authz from '../../authz';

export type RouteCtx = {
	db: Db;
	authz: Authz;
	oidc: Oidc;
	aws: Aws;
	logger: Winston.Logger;
};
type Route = FastifyPluginAsync<RouteCtx>;

export default Route;
