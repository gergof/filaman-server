import { PutObjectCommand } from '@aws-sdk/client-s3';
import { encode as blurhashEncode } from 'blurhash';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import Sharp from 'sharp';

import { Image } from '../../models';
import forbiddenHelper from '../helpers/forbiddenHelper';
import notFoundHelper from '../helpers/notFoundHelper';
import auth from '../middlewares/auth';
import {
	ImageCreateInputType,
	ImageCreateInput,
	ImageGetParamsType,
	ImageGetParams
} from '../schemas/Image';

import Route from './Route';

const ImagesRoute: Route = async (fastify, ctx) => {
	fastify.get<{ Params: ImageGetParamsType }>(
		'/images/:id',
		{
			schema: {
				params: ImageGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const image = await ctx.db.conn
					.getRepository(Image)
					.findOne(req.params.id);

				if (
					!image ||
					!(await ctx.authz.authorize(user, 'read', image))
				) {
					notFoundHelper(req, resp);
					return;
				}

				return {
					id: image.id,
					url: await image.getUrl(ctx.aws),
					urlValid: Date.now() + 3300_000,
					blurhash: image.blurhash
				};
			});
		}
	);

	fastify.post<{ Body: ImageCreateInputType }>(
		'/images',
		{
			schema: {
				body: ImageCreateInput
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				if (!(await ctx.authz.authorize(user, 'read', user))) {
					forbiddenHelper(req, resp);
					return;
				}

				const files = (req.raw as any).files;

				if (!files.file.mimetype.includes('image/')) {
					resp.status(400);
					return {
						status: 400,
						error: 'Uploaded file must be an image'
					};
				}

				if (files.file.size > 50 * 1024 * 1024) {
					// > 50MB
					resp.status(400);
					return {
						status: 400,
						error: 'Uploaded file must be smaller than 50MB'
					};
				}

				let img: Sharp.Sharp;
				try {
					img = Sharp(files.file.data);
					const metadata = await img.metadata();
					await img.ensureAlpha();

					if (!metadata || !metadata.width || !metadata.height) {
						throw new Error('Could not parse metadata');
					}

					if (metadata.width > 1200) {
						if (metadata.height > metadata.width) {
							await img.resize({
								height: 1200
							});
						} else {
							await img.resize({
								width: 1200
							});
						}
					}
				} catch (e) {
					ctx.logger.error('Error while processing image', {
						exception: e
					});
					resp.status(500);
					return {
						status: 500,
						error: 'Failed to process uploaded image'
					};
				}

				let blurhash: string;
				try {
					const imgBuff = await img
						.raw()
						.toBuffer({ resolveWithObject: true });
					const imgData = new Uint8ClampedArray(imgBuff.data);
					blurhash = blurhashEncode(
						imgData,
						imgBuff.info.width,
						imgBuff.info.height,
						4,
						3
					);
				} catch (e) {
					ctx.logger.error('Failed to calculate blurhash', {
						exception: e
					});
					resp.status(500);
					return {
						status: 500,
						error: 'Failed to process uploaded image'
					};
				}

				const objectKey = `${user.id}/${nanoid()}`;
				try {
					const command = new PutObjectCommand({
						Bucket: ctx.aws.conf.s3.bucket,
						Key: objectKey,
						Body: await img.toFormat('png').toBuffer(),
						ContentType: 'image/png'
					});
					await ctx.aws.s3.send(command);
				} catch (e) {
					resp.status(500);
					return {
						status: 500,
						error: 'Failed to save image to S3'
					};
				}

				const image = new Image();
				image.user = user;
				image.path = objectKey;
				image.blurhash = blurhash;

				await ctx.db.conn.getRepository(Image).save(image);

				return {
					id: image.id,
					url: await image.getUrl(ctx.aws),
					urlValid: Date.now() + 3300_000,
					blurhash: image.blurhash
				};
			});
		}
	);

	fastify.delete<{ Params: ImageGetParamsType }>(
		'/images/:id',
		{
			schema: {
				params: ImageGetParams
			}
		},
		(req, resp) => {
			return auth(req, resp, ctx, async user => {
				const image = await ctx.db.conn
					.getRepository(Image)
					.findOne(req.params.id);

				if (
					!image ||
					!(await ctx.authz.authorize(user, 'delete', image))
				) {
					forbiddenHelper(req, resp);
					return;
				}

				await image.deleteFile(ctx.aws);
				await ctx.db.conn.getRepository(Image).remove(image);

				return { deleted: true };
			});
		}
	);
};

export default ImagesRoute;
