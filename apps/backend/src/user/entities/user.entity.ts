import { FileRecordEntity } from 'src/files/entities/file-record.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, OneToOne } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column()
  password: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'avatar_file_id', nullable: true })
  avatarFileId: string;

  @OneToOne(() => FileRecordEntity, { nullable: true })
  @JoinColumn({ name: 'avatar_file_id' })
  avatarFile: FileRecordEntity;
}
