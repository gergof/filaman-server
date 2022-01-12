import _ from 'lodash';

import { Material } from '../../models';
import forbiddenHelper from '../helpers/forbiddenHelper';
import notFoundHelper from '../helpers/notFoundHelper';
import auth from '../middlewares/auth';
import {
	MaterialGetParamsType,
	MaterialType,
	MaterialCreateInputType,
	MaterialPutInputType,
	MaterialGetParams,
	MaterialCreateInput,
	MaterialPutInput
} from '../schemas/Material';

import Route from './Route';

const MaterialsRoute: Route = async (fastify, ctx) => {
	fastify.get('/materials', (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const query = await ctx.authz.authorizedQuery(user, 'read', Material);
			return await ctx.db.conn.getRepository(Material).find({
				where: query,
				order: {
					name: 'ASC'
				}
			});
		});
	});

	fastify.get<{ Params: MaterialGetParamsType; Reply: MaterialType }>(
		'/materials/:id',
		{
			schema: {
				params: MaterialGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const material = await ctx.db.conn
					.getRepository(Material)
					.findOne(req.params.id);

				if (
					!material ||
					!(await ctx.authz.authorize(user, 'read', material))
				) {
					notFoundHelper(req, resp);
					return;
				}

				return material;
			});
		}
	);

	fastify.post<{ Body: MaterialCreateInputType; Reply: MaterialType }>(
		'/materials',
		{
			schema: {
				body: MaterialCreateInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				if (
					!(await ctx.authz.authorize(user, 'create-material', user))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				const material = new Material();
				material.user = user;
				material.name = req.body.name;
				material.code = req.body.code;
				material.density = req.body.density;
				material.notes = req.body.notes;

				await ctx.db.conn.getRepository(Material).save(material);

				return _.omit(material, ['user']);
			});
		}
	);

	fastify.put<{
		Params: MaterialGetParamsType;
		Body: MaterialPutInputType;
		Reply: MaterialType;
	}>(
		'/materials/:id',
		{
			schema: {
				params: MaterialGetParams,
				body: MaterialPutInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const material = await ctx.db.conn
					.getRepository(Material)
					.findOne(req.params.id);

				if (
					!material ||
					!(await ctx.authz.authorize(user, 'modify', material))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				const patch: Record<string, string | number | null> = {};
				Object.entries(req.body).forEach(([key, value]) => {
					patch[key] = value;
				});

				await ctx.db.conn
					.getRepository(Material)
					.update(material, patch);

				return await ctx.db.conn
					.getRepository(Material)
					.findOne(req.params.id);
			});
		}
	);

	fastify.delete<{ Params: MaterialGetParamsType }>(
		'/materials/:id',
		{
			schema: {
				params: MaterialGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const material = await ctx.db.conn
					.getRepository(Material)
					.findOne(req.params.id);

				if (
					!material ||
					!(await ctx.authz.authorize(user, 'delete', material))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				await ctx.db.conn.getRepository(Material).remove(material);

				return {
					deleted: true
				};
			});
		}
	);
};

export default MaterialsRoute;
