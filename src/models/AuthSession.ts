import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import User from './User';

@Entity('auth_sessions')
class AuthSession {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column('varchar', { length: '128' })
	token!: string;

	@Column()
	expiry!: Date;
}

export default AuthSession;
