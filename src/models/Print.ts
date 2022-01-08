import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import User from './User';
import Printer from './Printer';
import Spool from './Spool';
import Image from './Image';

@Entity('prints')
class Print {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, {onDelete: 'CASCADE'})
	@JoinColumn()
	user!: User;

	@Column()
	expiry!: Date;

	@Column('varchar', {length: 60})
	name!: string;

	@Column('decimal', {scale: 8, precision: 3})
	weight!: number;

	@ManyToOne(() => Printer, {onDelete: 'CASCADE'})
	@JoinColumn()
	printer!: Printer;

	@ManyToOne(() => Spool, {onDelete: 'CASCADE'})
	@JoinColumn()
	spool!: Spool;

	@Column('decimal', {scale: 5, precision: 2, nullable: true})
	progress!: number | null;

	@Column('int', {unsigned: true, nullable: true})
	duration!: number | null;

	@OneToOne(() => Image, {nullable: true, onDelete: 'SET NULL'})
	@JoinColumn()
	image!: Image | null;

	@Column('text', {nullable: true})
	notes!: string | null;
}

export default Print;