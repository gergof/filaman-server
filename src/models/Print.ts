import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	OneToOne
} from 'typeorm';

import Image from './Image';
import Printer from './Printer';
import Spool from './Spool';
import User from './User';

@Entity('prints')
class Print {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column()
	date!: Date;

	@Column('varchar', { length: 60 })
	name!: string;

	@Column('decimal', { precision: 8, scale: 3 })
	weight!: number;

	@ManyToOne(() => Printer, { onDelete: 'CASCADE' })
	@JoinColumn()
	printer!: Printer;

	@ManyToOne(() => Spool, { onDelete: 'CASCADE' })
	@JoinColumn()
	spool!: Spool;

	@Column('decimal', { precision: 5, scale: 2, nullable: true })
	progress!: number | null;

	@Column('int', { unsigned: true, nullable: true })
	duration!: number | null;

	@OneToOne(() => Image, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	image!: Image | null;

	@Column('text', { nullable: true })
	notes!: string | null;
}

export default Print;
