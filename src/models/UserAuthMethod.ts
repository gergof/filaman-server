import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import AuthRealm from './AuthRealm';
import User from './User';

@Entity('user_auth_methods')
class UserAuthMethod {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', { length: 512 })
	realmUserId!: string;

	@ManyToOne(() => AuthRealm, { onDelete: 'CASCADE' })
	@JoinColumn()
	realm!: AuthRealm;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;
}

export default UserAuthMethod;
