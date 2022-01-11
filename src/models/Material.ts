import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import User from './User';

@Entity('materials')
class Material {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column('varchar', { length: 60 })
	name!: string;

	@Column('varchar', { length: 10 })
	code!: string;

	@Column('decimal', { precision: 8, scale: 5 })
	density!: number;

	@Column('text', { nullable: true })
	notes!: string | null;
}

export default Material;
