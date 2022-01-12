import { Type, Static } from '@sinclair/typebox';

export const Spool = Type.Object({
	id: Type.Number(),
	materialId: Type.Number(),
	name: Type.String(),
	code: Type.String(),
	manufacturer: Type.Union([Type.String(), Type.Null()]),
	color: Type.RegEx(/^#[0-9A-Fa-f]{6}$/),
	diameter: Type.Number(),
	totalWeight: Type.Number(),
	weight: Type.Number(),
	priceValue: Type.Number(),
	priceCurrency: Type.String()
})
export type SpoolType = Static<typeof Spool>;

export const SpoolGetParams = Type.Object({
	id: Type.Number()
})
export type SpoolGetParamsType = Static<typeof SpoolGetParams>;

export const SpoolCreateInput = Type.Omit(Spool, ['id', 'code']);
export type SpoolCreateInputType = Static<typeof SpoolCreateInput>;

export const SpoolPutInput = Type.Partial(SpoolCreateInput);
export type SpoolPutInputType = Static<typeof SpoolPutInput>;
