import { Type, Static } from '@sinclair/typebox';

import { Image } from './Image';

export const Printer = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	code: Type.String(),
	model: Type.String(),
	image: Image,
	notes: Type.Union([Type.String(), Type.Null()])
});
export type PrinterType = Static<typeof Printer>;

export const PrinterGetParams = Type.Object({
	id: Type.Number()
});
export type PrinterGetParamsType = Static<typeof PrinterGetParams>;

export const PrinterCreateInput = Type.Object({
	name: Type.String(),
	model: Type.String(),
	imageId: Type.Union([Type.Number(), Type.Null()]),
	notes: Type.Union([Type.String(), Type.Null()])
});
export type PrinterCreateInputType = Static<typeof PrinterCreateInput>;

export const PrinterPutInput = Type.Partial(PrinterCreateInput);
export type PrinterPutInputType = Static<typeof PrinterPutInput>;
