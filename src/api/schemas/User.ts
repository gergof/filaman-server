import { Type, Static } from '@sinclair/typebox';

const User = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	email: Type.String()
});
export type UserType = Static<typeof User>;
