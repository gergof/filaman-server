import Route from './Route';
import auth from '../middlewares/auth';
import { Spool, Material } from '../../models';
import { SpoolCreateInputType, SpoolGetParamsType, SpoolGetParams, SpoolType, SpoolCreateInput, SpoolPutInputType, SpoolPutInput } from '../schemas/Spool';
import notFoundHelper from '../helpers/notFoundHelper';
import forbiddenHelper from '../helpers/forbiddenHelper';
import { codeGenerator } from '../../utils';
import _ from 'lodash';

const SpoolsRoute: Route = async (fastify, ctx) => {
	fastify.get('/spools', (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const query = await ctx.authz.authorizedQuery(user, 'read', Spool);
			return await ctx.db.conn.getRepository(Spool).find({
				where: query,
				order: {
					name: 'ASC'
				}
			})
		})
	});

	fastify.get<{Params: SpoolGetParamsType, Reply: SpoolType}>('/spools/:id', {
		schema: {
			params: SpoolGetParams
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spool = await ctx.db.conn.getRepository(Spool).findOne(req.params.id);

			if(!spool || !await ctx.authz.authorize(user, 'read', spool)) {
				notFoundHelper(req, resp);
				return;
			}

			return spool;
		})
	})

	fastify.post<{Body: SpoolCreateInputType}>('/spools', {
		schema: {
			body: SpoolCreateInput
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			if(!await ctx.authz.authorize(user, 'create-spool', user)){
				forbiddenHelper(req, resp);
				return;
			}

			const material = await ctx.db.conn.getRepository(Material).findOne(req.body.materialId);

			if(!material || !await ctx.authz.authorize(user, 'read', material)) {
				resp.status(400);
				return {
					status: 400,
					error: 'Can not find material'
				}
			}

			const spool = new Spool();
			spool.user = user;
			spool.material = material;
			spool.name = req.body.name;
			spool.code = codeGenerator.generate(8);
			spool.manufacturer = req.body.manufacturer;
			spool.color = req.body.color;
			spool.diameter = req.body.diameter;
			spool.totalWeight = req.body.totalWeight;
			spool.weight = req.body.weight;
			spool.priceValue = req.body.priceValue;
			spool.priceCurrency = req.body.priceCurrency;

			await ctx.db.conn.getRepository(Spool).save(spool);

			return _.omit(spool, ['user', 'material']);
		})
	})

	fastify.put<{Params: SpoolGetParamsType, Body: SpoolPutInputType}>('/spools/:id', {
		schema: {
			params: SpoolGetParams,
			body: SpoolPutInput
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spool = await ctx.db.conn.getRepository(Spool).findOne(req.params.id);

			if(!spool || !await ctx.authz.authorize(user, 'modify', spool)) {
				forbiddenHelper(req, resp);
				return;
			}

			const patch: Record<string, string|number|null|Material> = {};
			Object.entries(req.body).forEach(([key, value]) => {
				if(['materialId'].includes(key)){
					return;
				}
				patch[key] = value;
			})

			if(req.body.materialId) {
				const material = await ctx.db.conn.getRepository(Material).findOne(req.body.materialId);

				if(!material || !await ctx.authz.authorize(user, 'read', material)){
					resp.status(400);
					return {
						status: 400,
						error: 'Can not find material'
					}
				}

				patch['material'] = material;
			}

			await ctx.db.conn.getRepository(Spool).update(spool, patch);

			return await ctx.db.conn.getRepository(Spool).findOne(req.params.id);
		})
	});

	fastify.delete<{Params: SpoolGetParamsType}>('/spools/:id', {
		schema: {
			params: SpoolGetParams
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spool = await ctx.db.conn.getRepository(Spool).findOne(req.params.id);

			if(!spool || !await ctx.authz.authorize(user, 'modify', spool)) {
				forbiddenHelper(req, resp);
				return;
			}

			await ctx.db.conn.getRepository(Spool).remove(spool);

			return {
				deleted: true
			}
		})
	})
}

export default SpoolsRoute;