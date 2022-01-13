import { Type, Static } from '@sinclair/typebox';

export const SpoolTemplate = Type.Object({
	id: Type.Number(),
	materialId: Type.Number(),
	name: Type.String(),
	manufacturer: Type.Union([Type.String(), Type.Null()]),
	color: Type.RegEx(/^#[0-9A-Fa-f]{6}$/),
	diameter: Type.Number(),
	totalWeight: Type.Number(),
	weight: Type.Number(),
	priceValue: Type.Number(),
	priceCurrency: Type.String()
});
export type SpoolTemplateType = Static<typeof SpoolTemplate>;

export const SpoolTemplateGetParams = Type.Object({
	id: Type.Number()
});
export type SpoolTemplateGetParamsType = Static<typeof SpoolTemplateGetParams>;

export const SpoolTemplateCreateInput = Type.Omit(SpoolTemplate, ['id']);
export type SpoolTemplateCreateInputType = Static<
	typeof SpoolTemplateCreateInput
>;

export const SpoolTemplatePutInput = Type.Partial(SpoolTemplateCreateInput);
export type SpoolTemplatePutInputType = Static<typeof SpoolTemplatePutInput>;
