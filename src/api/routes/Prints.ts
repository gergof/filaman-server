import _ from 'lodash';

import { Print, Printer, Spool, Image } from '../../models';
import forbiddenHelper from '../helpers/forbiddenHelper';
import notFoundHelper from '../helpers/notFoundHelper';
import auth from '../middlewares/auth';
import {
	PrintGetParamsType,
	PrintGetParams,
	PrintCreateInputType,
	PrintCreateInput,
	PrintPutInput,
	PrintPutInputType
} from '../schemas/Print';

import Route from './Route';

const PrintsRoute: Route = async (fastify, ctx) => {
	fastify.get('/prints', (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const query = await ctx.authz.authorizedQuery(user, 'read', Print);
			return await ctx.db.conn.getRepository(Print).find({
				where: query,
				order: {
					date: 'DESC'
				},
				relations: ['image']
			});
		});
	});

	fastify.get<{ Params: PrintGetParamsType }>(
		'/prints/:id',
		{
			schema: {
				params: PrintGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const print = await ctx.db.conn
					.getRepository(Print)
					.findOne(req.params.id, { relations: ['image'] });

				if (
					!print ||
					!(await ctx.authz.authorize(user, 'read', print))
				) {
					notFoundHelper(req, resp);
					return;
				}

				return print;
			});
		}
	);

	fastify.post<{ Body: PrintCreateInputType }>(
		'/prints',
		{
			schema: {
				body: PrintCreateInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				if (!(await ctx.authz.authorize(user, 'create-print', user))) {
					forbiddenHelper(req, resp);
					return;
				}

				const printer = await ctx.db.conn
					.getRepository(Printer)
					.findOne(req.body.printerId);

				if (
					!printer ||
					!(await ctx.authz.authorize(user, 'read', printer))
				) {
					resp.status(400);
					return {
						status: 400,
						error: 'Can not find printer'
					};
				}

				const spool = await ctx.db.conn
					.getRepository(Spool)
					.findOne(req.body.spoolId);

				if (
					!spool ||
					!(await ctx.authz.authorize(user, 'read', spool))
				) {
					resp.status(400);
					return {
						status: 400,
						error: 'Can not find spool'
					};
				}

				let image: Image | null = null;
				if (req.body.imageId) {
					const img = await ctx.db.conn
						.getRepository(Image)
						.findOne(req.body.imageId);
					if (
						!img ||
						!(await ctx.authz.authorize(user, 'read', img))
					) {
						resp.status(400);
						return {
							status: 400,
							error: 'Can not find image'
						};
					}
					image = img;
				}

				if (isNaN(Date.parse(req.body.date))) {
					resp.status(400);
					return {
						status: 400,
						error: 'Invalid date'
					};
				}

				const print = new Print();
				print.user = user;
				print.date = new Date(req.body.date);
				print.name = req.body.name;
				print.weight = req.body.weight;
				print.printer = printer;
				print.spool = spool;
				print.progress = req.body.progress;
				print.duration = req.body.duration;
				print.image = image;
				print.notes = req.body.notes;

				await ctx.db.conn.getRepository(Print).save(print);

				return _.omit(print, ['user', 'printer', 'spool']);
			});
		}
	);

	fastify.put<{ Params: PrintGetParamsType; Body: PrintPutInputType }>(
		'/prints/:id',
		{
			schema: {
				params: PrintGetParams,
				body: PrintPutInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const print = await ctx.db.conn
					.getRepository(Print)
					.findOne(req.params.id);

				if (
					!print ||
					!(await ctx.authz.authorize(user, 'modify', print))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				const patch: Record<
					string,
					string | number | null | Image | Printer | Spool
				> = {};
				Object.entries(req.body).forEach(([key, value]) => {
					if (['printerId', 'spoolId'].includes(key)) {
						return;
					}
					if (key == 'imageId' && value !== null) {
						return;
					}
					patch[key] = value;
				});

				if (req.body.printerId) {
					const printer = await ctx.db.conn
						.getRepository(Printer)
						.findOne(req.body.printerId);

					if (
						!printer ||
						!(await ctx.authz.authorize(user, 'read', printer))
					) {
						resp.status(400);
						return {
							status: 400,
							error: 'Can not find printer'
						};
					}
				}

				if (req.body.spoolId) {
					const spool = await ctx.db.conn
						.getRepository(Spool)
						.findOne(req.body.spoolId);

					if (
						!spool ||
						!(await ctx.authz.authorize(user, 'read', spool))
					) {
						resp.status(400);
						return {
							status: 400,
							error: 'Can not find spool'
						};
					}
				}

				if (req.body.imageId) {
					const image = await ctx.db.conn
						.getRepository(Image)
						.findOne(req.body.imageId);
					if (
						!image ||
						!(await ctx.authz.authorize(user, 'read', image))
					) {
						resp.status(400);
						return {
							status: 400,
							error: 'Can not find image'
						};
					}

					patch['image'] = image;
				}

				await ctx.db.conn.getRepository(Print).update(print, patch);

				return await ctx.db.conn
					.getRepository(Print)
					.findOne(req.params.id, {
						relations: ['image']
					});
			});
		}
	);

	fastify.delete<{ Params: PrintGetParamsType }>(
		'/prints/:id',
		{
			schema: {
				params: PrintGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const print = await ctx.db.conn
					.getRepository(Print)
					.findOne(req.params.id, {
						relations: ['image']
					});

				if (
					!print ||
					!(await ctx.authz.authorize(user, 'delete', print))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				if (
					print.image &&
					!(await ctx.authz.authorize(user, 'delete', print.image))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				if (print.image) {
					await print.image.deleteFile(ctx.aws);
					await ctx.db.conn.getRepository(Image).remove(print.image);
				}

				await ctx.db.conn.getRepository(Print).remove(print);

				return { deleted: true };
			});
		}
	);
};

export default PrintsRoute;
