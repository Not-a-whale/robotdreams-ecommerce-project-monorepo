import { Exclude } from 'class-transformer';
import { FileRecordEntity } from '../../files/entities/file-record.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

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
  @Exclude()
  password: string;

  @Column({ name: 'hashed_refresh_token', type: 'text', nullable: true })
  @Exclude()
  hashedRefreshToken: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'avatar_file_id', nullable: true })
  avatarFileId: string;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  @OneToOne(() => FileRecordEntity, { nullable: true })
  @JoinColumn({ name: 'avatar_file_id' })
  avatarFile: FileRecordEntity;
}
