import { Filter } from 'oso/dist/src/dataFiltering';
import { Not, In } from 'typeorm';

export const dbConstrain = (query: any, filter: Filter) => {
	if (filter.field === undefined) {
		filter.field = 'id';
	}

	if (filter.field instanceof Array) {
		for (const i in filter.field) {
			const val = (filter.value as any)[i];
			const field = filter.field[i] as string;
			query[field] = filter.kind === 'In' ? val : Not(val);
		}
	} else {
		switch (filter.kind) {
			case 'Eq':
				query[filter.field] = filter.value;
				break;
			case 'Neq':
				query[filter.field] = Not(filter.value);
				break;
			case 'In':
				query[filter.field] = In(filter.value as any);
				break;
			case 'Nin':
				query[filter.field] = Not(In(filter.value as any));
				break;
			default:
				throw new Error(`Unknown filter kind: ${filter.kind}`);
		}
	}

	return query;
};

export const buildDbQuery = (filters: Array<Filter>) => {
	if (!filters.length) {
		return { id: Not(null) };
	}

	return filters.reduce(dbConstrain, {});
};

export const lift = (x: any) => (x instanceof Array ? x : [x]);

export const combineDbQuery = (a: any, b: any) => lift(a).concat(lift(b));
