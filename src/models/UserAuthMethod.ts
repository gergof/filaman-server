import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import AuthRealm from './AuthRealm';
import User from './User';

@Entity('user_auth_methods')
class UserAuthMethod {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: 512})
	realmUserId!: string;

	@ManyToOne(() => AuthRealm)
	realm!: AuthRealm;

	@ManyToOne(() => User)
	user!: User;
}

export default UserAuthMethod;