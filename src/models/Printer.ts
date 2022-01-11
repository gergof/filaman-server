import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToOne,
	JoinColumn
} from 'typeorm';

import Image from './Image';
import User from './User';

@Entity('printers')
class Printer {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column('varchar', { length: 60 })
	name!: string;

	@Column('varchar', { length: 8 })
	code!: string;

	@Column('varchar', { length: 60 })
	model!: string;

	@OneToOne(() => Image, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn()
	image!: Image | null;

	@Column('text', { nullable: true })
	notes!: string | null;
}

export default Printer;
