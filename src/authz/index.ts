import Winston from 'winston';
import { Oso, Relation, Class } from 'oso';
import { User, AuthRealm, AuthSession, Image, Material, Print, Printer, Spool, SpoolTemplate } from '../models';
import type Action from './Action';
import type Resource from './Resource';
import Db from '../Db';
import { combineDbQuery, buildDbQuery } from './filteringUtils';
import policies from './policies';
import path from 'path';

class Authz {
	private logger: Winston.Logger;
	private oso: Oso<User, Action, Resource, unknown, unknown>;
	private db: Db;

	constructor(logger: Winston.Logger, db: Db) {
		this.logger = logger;
		this.db = db;

		this.oso = new Oso<User, Action, Resource, unknown, unknown>();
		this.oso.setDataFilteringQueryDefaults({combineQuery: combineDbQuery, buildQuery: buildDbQuery});

		this.registerClasses();
	}

	private registerClasses(): void {
		this.oso.registerClass(Image, {
			execQuery: this.db.execFromRepo(Image),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id')
			}
		});
		this.oso.registerClass(Material, {
			execQuery: this.db.execFromRepo(Material),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id')
			}
		});
		this.oso.registerClass(Print, {
			execQuery: this.db.execFromRepo(Print),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id'),
			}
		});
		this.oso.registerClass(Printer, {
			execQuery: this.db.execFromRepo(Printer),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id')
			}
		});
		this.oso.registerClass(Spool, {
			execQuery: this.db.execFromRepo(Spool),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id')
			}
		});
		this.oso.registerClass(SpoolTemplate, {
			execQuery: this.db.execFromRepo(SpoolTemplate),
			fields: {
				id: Number,
				user: new Relation('one', 'User', 'userId', 'id')
			}
		});
		this.oso.registerClass(User, {
			execQuery: this.db.execFromRepo(User),
			fields: {
				id: Number
			}
		});
	}

	public async init(): Promise<void> {
		await this.oso.loadFiles(policies.map(file => path.join(__dirname, 'policies', file)));
	}

	public authorize(
		actor: User,
		action: Action,
		resource: Resource
	): Promise<boolean> {
		return new Promise<boolean>(resolve => {
			this.oso
				.authorize(actor, action, resource)
				.then(() => resolve(true))
				.catch(() => resolve(false));
		}).then(result => {
			this.logger.debug(result ? 'Allowed' : 'Denied', {
				actor: actor.id,
				resource: resource.id,
				action: action
			});

			return result;
		});
	}

	public authorizedResources<T extends Resource>(
		actor: User,
		action: Action,
		resource: Class<T>
	): Promise<T[]> {
		return this.oso.authorizedResources(actor, action, resource);
	}
}

export default Authz;
