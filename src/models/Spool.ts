import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import Material from './Material';
import User from './User';

@Entity('spools')
class Spool {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column()
	userId!: number;

	@ManyToOne(() => Material, { onDelete: 'CASCADE' })
	@JoinColumn()
	material!: Material;

	@Column()
	materialId!: number;

	@Column('varchar', { length: 60 })
	name!: string;

	@Column('varchar', { length: 8 })
	code!: string;

	@Column('varchar', { length: 120, nullable: true })
	manufacturer!: string | null;

	@Column('varchar', { length: 7 })
	color!: string;

	@Column('decimal', { precision: 8, scale: 5 })
	diameter!: number;

	@Column('decimal', { precision: 8, scale: 3 })
	totalWeight!: number;

	@Column('decimal', { precision: 8, scale: 3 })
	weight!: number;

	@Column('decimal', { precision: 10, scale: 2 })
	priceValue!: number;

	@Column('varchar', { length: 5 })
	priceCurrency!: string;
}

export default Spool;
