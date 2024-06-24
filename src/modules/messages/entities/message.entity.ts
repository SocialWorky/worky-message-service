import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageType } from 'src/enum/message-type.enum';
import { MessageStatus } from 'src/enum/message-status.enum';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Index()
  @Column()
  senderId: string;

  @Index()
  @Column()
  receiverId: string;

  @Index()
  @Column()
  chatId: string;

  @Index()
  @Column()
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true, type: 'enum', enum: MessageType })
  type: MessageType;

  @Column({ nullable: true, type: 'enum', enum: MessageStatus })
  status: MessageStatus;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
