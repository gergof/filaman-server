import { Type, Static } from '@sinclair/typebox';

export const Material = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	code: Type.String(),
	density: Type.Number(),
	notes: Type.Union([Type.String(), Type.Null()])
});
export type MaterialType = Static<typeof Material>;

export const MaterialGetParams = Type.Object({
	id: Type.Number()
});
export type MaterialGetParamsType = Static<typeof MaterialGetParams>;

export const MaterialCreateInput = Type.Omit(Material, ['id']);
export type MaterialCreateInputType = Static<typeof MaterialCreateInput>;

export const MaterialPutInput = Type.Partial(MaterialCreateInput);
export type MaterialPutInputType = Static<typeof MaterialPutInput>;
