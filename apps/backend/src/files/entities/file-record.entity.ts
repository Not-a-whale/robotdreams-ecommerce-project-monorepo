import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

export enum FileStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export enum FileVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum FileEntityType {
  USER_AVATAR = 'USER_AVATAR',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
}

@Entity('file_records')
export class FileRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @Column({ name: 'entity_type', type: 'enum', enum: FileEntityType, enumName: 'file_records_entity_type_enum' })
  entityType: FileEntityType;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ unique: true })
  key: string;

  @Column({ name: 'content_type' })
  contentType: string;

  @Column({ type: 'int', default: 0 })
  size: number;

  @Column({
    type: 'enum',
    enum: FileStatus,
    enumName: 'file_records_status_enum',
    default: FileStatus.PENDING,
  })
  status: FileStatus;

  @Column({
    type: 'enum',
    enum: FileVisibility,
    enumName: 'file_records_visibility_enum',
    default: FileVisibility.PUBLIC,
  })
  visibility: FileVisibility;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
