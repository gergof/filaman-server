import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column('varchar', {length: 60})
	name!: string;

	@Column('varchar', {length: 60})
	email!: string;

	@Column('varchar', {length: 30})
	timezone!: string;
}

export default User;