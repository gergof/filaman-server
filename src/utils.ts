export const codeGenerator = {
	generate: (length: number): string => {
		const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let res = '';

		let i = length;
		while (i--) {
			res += charset.charAt((Math.random() * charset.length) | 0);
		}

		return res;
	}
};
