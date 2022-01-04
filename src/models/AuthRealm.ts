import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_realms')
class AuthRealm {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: 30})
	name!: string;
}

export default AuthRealm;