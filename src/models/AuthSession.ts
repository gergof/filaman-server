import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_sessions')
class AuthSession {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: '128'})
	token!: string;

	@Column()
	expiry!: Date
}

export default AuthSession;