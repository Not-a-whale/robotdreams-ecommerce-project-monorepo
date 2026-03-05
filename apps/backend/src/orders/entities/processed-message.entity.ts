import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('processed_messages')
@Index(['messageId'], { unique: true })
export class ProcessedMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', unique: true })
  messageId: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ nullable: true })
  handler: string;

  @CreateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}
