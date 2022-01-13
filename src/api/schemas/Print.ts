import { Type, Static } from '@sinclair/typebox';

import { Image } from './Image';

export const Print = Type.Object({
	id: Type.Number(),
	date: Type.String(),
	name: Type.String(),
	weight: Type.Number(),
	printerId: Type.Number(),
	spoolId: Type.Number(),
	progress: Type.Union([Type.Number(), Type.Null()]),
	duration: Type.Union([Type.Number(), Type.Null()]),
	image: Type.Union([Image, Type.Null()]),
	notes: Type.Union([Type.String(), Type.Null()])
});
export type PrintType = Static<typeof Print>;

export const PrintGetParams = Type.Object({
	id: Type.Number()
});
export type PrintGetParamsType = Static<typeof PrintGetParams>;

export const PrintCreateInput = Type.Object({
	date: Type.String(),
	name: Type.String(),
	weight: Type.Number(),
	printerId: Type.Number(),
	spoolId: Type.Number(),
	progress: Type.Union([Type.Number(), Type.Null()]),
	duration: Type.Union([Type.Number(), Type.Null()]),
	imageId: Type.Union([Type.Number(), Type.Null()]),
	notes: Type.Union([Type.String(), Type.Null()])
});
export type PrintCreateInputType = Static<typeof PrintCreateInput>;

export const PrintPutInput = Type.Partial(PrintCreateInput);
export type PrintPutInputType = Static<typeof PrintPutInput>;
