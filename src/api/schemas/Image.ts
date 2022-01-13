import { Type, Static } from '@sinclair/typebox';

export const Image = Type.Object({
	id: Type.Number(),
	url: Type.String(),
	urlValid: Type.Number(),
	blurhash: Type.String()
});
export type ImageType = Static<typeof Image>;

export const ImageGetParams = Type.Object({
	id: Type.Number()
});
export type ImageGetParamsType = Static<typeof ImageGetParams>;

export const ImageCreateInput = Type.Object({
	file: Type.Object({})
});
export type ImageCreateInputType = Static<typeof Image>;
