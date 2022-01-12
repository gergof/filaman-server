import Route from './Route';
import auth from '../middlewares/auth';
import { SpoolTemplate, Material } from '../../models';
import { SpoolTemplateGetParamsType, SpoolTemplateType, SpoolTemplateGetParams, SpoolTemplateCreateInputType, SpoolTemplateCreateInput, SpoolTemplatePutInputType, SpoolTemplatePutInput } from '../schemas/SpoolTemplate';
import notFoundHelper from '../helpers/notFoundHelper';
import forbiddenHelper from '../helpers/forbiddenHelper';
import _ from 'lodash';

const SpoolTemplatesRoute: Route = async (fastify, ctx) => {
	fastify.get('/spool-templates', (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const query = await ctx.authz.authorizedQuery(user, 'read', SpoolTemplate);
			return await ctx.db.conn.getRepository(SpoolTemplate).find({
				where: query,
				order: {
					name: 'ASC'
				}
			})
		})
	})

	fastify.get<{Params: SpoolTemplateGetParamsType, Reply: SpoolTemplateType}>('/spool-templates/:id', {
		schema: {
			params: SpoolTemplateGetParams
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spoolTemplate = await ctx.db.conn.getRepository(SpoolTemplate).findOne(req.params.id);

			if(!spoolTemplate || !await ctx.authz.authorize(user, 'read', spoolTemplate)) {
				notFoundHelper(req, resp);
				return;
			}

			return spoolTemplate;
		})
	})

	fastify.post<{Body: SpoolTemplateCreateInputType}>('/spool-templates', {
		schema: {
			body: SpoolTemplateCreateInput
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			if(!await ctx.authz.authorize(user, 'create-spooltemplate', user)) {
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

			const spoolTemplate = new SpoolTemplate();
			spoolTemplate.user = user;
			spoolTemplate.material = material;
			spoolTemplate.name = req.body.name;
			spoolTemplate.manufacturer = req.body.manufacturer;
			spoolTemplate.color = req.body.color;
			spoolTemplate.diameter = req.body.diameter;
			spoolTemplate.totalWeight = req.body.totalWeight;
			spoolTemplate.weight = req.body.weight;
			spoolTemplate.priceValue = req.body.priceValue;
			spoolTemplate.priceCurrency = req.body.priceCurrency;

			await ctx.db.conn.getRepository(SpoolTemplate).save(spoolTemplate);

			return _.omit(spoolTemplate, ['user', 'material']);
		})
	});

	fastify.put<{Params: SpoolTemplateGetParamsType, Body: SpoolTemplatePutInputType}>('/spool-templates/:id', {
		schema: {
			params: SpoolTemplateGetParams,
			body: SpoolTemplatePutInput
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spoolTemplate = await ctx.db.conn.getRepository(SpoolTemplate).findOne(req.params.id);

			if(!spoolTemplate || !await ctx.authz.authorize(user, 'modify', spoolTemplate)) {
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

			await ctx.db.conn.getRepository(SpoolTemplate).update(spoolTemplate, patch);

			return await ctx.db.conn.getRepository(SpoolTemplate).findOne(req.params.id);
		})
	})

	fastify.delete<{Params: SpoolTemplateGetParamsType}>('/spool-templates/:id', {
		schema: {
			params: SpoolTemplateGetParams
		}
	}, (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const spoolTemplate = await ctx.db.conn.getRepository(SpoolTemplate).findOne(req.params.id);

			if(!spoolTemplate || !await ctx.authz.authorize(user, 'delete', spoolTemplate)) {
				forbiddenHelper(req, resp);
				return;
			}

			await ctx.db.conn.getRepository(SpoolTemplate).remove(spoolTemplate);

			return {
				deleted: true
			}
		})
	})
}

export default SpoolTemplatesRoute;