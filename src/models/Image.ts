import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import User from './User';

@Entity('images')
class Image {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, {onDelete: 'CASCADE'})
	@JoinColumn()
	user!: User;

	@Column('varchar', {length: 255})
	path!: string;

	@Column('varchar', {length: 64})
	blurhash!: string;
}

export default Image;