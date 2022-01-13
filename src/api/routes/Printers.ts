import _ from 'lodash';

import { Printer, Image } from '../../models';
import { codeGenerator } from '../../utils';
import forbiddenHelper from '../helpers/forbiddenHelper';
import notFoundHelper from '../helpers/notFoundHelper';
import auth from '../middlewares/auth';
import {
	PrinterGetParamsType,
	PrinterGetParams,
	PrinterCreateInputType,
	PrinterCreateInput,
	PrinterPutInputType,
	PrinterPutInput
} from '../schemas/Printer';

import Route from './Route';

const PrintersRoute: Route = async (fastify, ctx) => {
	fastify.get('/printers', (req, resp) => {
		return auth(req, resp, ctx, async user => {
			const query = await ctx.authz.authorizedQuery(
				user,
				'read',
				Printer
			);
			return await ctx.db.conn.getRepository(Printer).find({
				where: query,
				order: {
					name: 'ASC'
				},
				relations: ['image']
			});
		});
	});

	fastify.get<{ Params: PrinterGetParamsType }>(
		'/printers/:id',
		{
			schema: {
				params: PrinterGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const printer = await ctx.db.conn
					.getRepository(Printer)
					.findOne(req.params.id, {
						relations: ['image']
					});

				if (!printer || !ctx.authz.authorize(user, 'read', printer)) {
					notFoundHelper(req, resp);
					return;
				}

				return printer;
			});
		}
	);

	fastify.post<{ Body: PrinterCreateInputType }>(
		'/printers',
		{
			schema: {
				body: PrinterCreateInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				if (
					!(await ctx.authz.authorize(user, 'create-printer', user))
				) {
					forbiddenHelper(req, resp);
					return;
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

				const printer = new Printer();
				printer.user = user;
				printer.name = req.body.name;
				(printer.code = codeGenerator.generate(8)),
					(printer.model = req.body.model);
				printer.image = image;
				printer.notes = req.body.notes;

				await ctx.db.conn.getRepository(Printer).save(printer);

				return _.omit(printer, ['user']);
			});
		}
	);

	fastify.put<{ Params: PrinterGetParamsType; Body: PrinterPutInputType }>(
		'/printers/:id',
		{
			schema: {
				params: PrinterGetParams,
				body: PrinterPutInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const printer = await ctx.db.conn
					.getRepository(Printer)
					.findOne(req.params.id);

				if (
					!printer ||
					!(await ctx.authz.authorize(user, 'modify', printer))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				const patch: Record<string, string | number | null | Image> =
					{};
				Object.entries(req.body).forEach(([key, value]) => {
					if (['imageId'].includes(key)) {
						return;
					}
					patch[key] = value;
				});

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

				await ctx.db.conn.getRepository(Printer).update(printer, patch);

				return await ctx.db.conn
					.getRepository(Printer)
					.findOne(req.params.id, {
						relations: ['image']
					});
			});
		}
	);

	fastify.delete<{ Params: PrinterGetParamsType }>(
		'/printers/:id',
		{
			schema: {
				params: PrinterGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const printer = await ctx.db.conn
					.getRepository(Printer)
					.findOne(req.params.id, {
						relations: ['image']
					});

				if (
					!printer ||
					!(await ctx.authz.authorize(user, 'delete', printer))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				if (
					printer.image &&
					!(await ctx.authz.authorize(user, 'delete', printer.image))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				if (printer.image) {
					await printer.image.deleteFile(ctx.aws);
					await ctx.db.conn
						.getRepository(Image)
						.remove(printer.image);
				}

				await ctx.db.conn.getRepository(Printer).remove(printer);

				return { deleted: true };
			});
		}
	);
};

export default PrintersRoute;
