import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn
} from 'typeorm';

import Aws from '../Aws';

import User from './User';

@Entity('images')
class Image {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn()
	user!: User;

	@Column()
	userId!: number;

	@Column('varchar', { length: 255 })
	path!: string;

	@Column('varchar', { length: 64 })
	blurhash!: string;

	public async getUrl(aws: Aws) {
		const command = new GetObjectCommand({
			Bucket: aws.conf.s3.bucket,
			Key: this.path
		});

		return await getSignedUrl(aws.s3, command, { expiresIn: 3600 });
	}

	public async deleteFile(aws: Aws) {
		const command = new DeleteObjectCommand({
			Bucket: aws.conf.s3.bucket,
			Key: this.path
		});

		await aws.s3.send(command);
	}
}

export default Image;
