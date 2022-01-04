import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import User from './User';
import Material from './Material';

@Entity('spool_templates')
class SpoolTemplate {
	@PrimaryGeneratedColumn()
	id!:number;

	@ManyToOne(() => User)
	user!: User;

	@ManyToOne(() => Material)
	material!: Material;

	@Column('varchar', {length: 60})
	name!: string;

	@Column('varchar', {length: 120, nullable: true})
	manufacturer!: string;

	@Column('varchar', {length: 7})
	color!: string;

	@Column('decimal', {scale: 8, precision: 5})
	diameter!: number;

	@Column('decimal', {scale: 8, precision: 3})
	totalWeight!: number;

	@Column('decimal', {scale: 8, precision: 3})
	weight!: number;

	@Column('decimal', {scale: 10, precision: 2})
	priceValue!: number;

	@Column('varchar', {length: 5})
	priceCurrency!: string;
}

export default SpoolTemplate;