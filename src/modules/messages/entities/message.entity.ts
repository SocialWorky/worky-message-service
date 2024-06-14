import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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

    @Column()
    content: string;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ nullable: true })
    type: 'text' | 'image' | 'video' | 'audio' | 'file';

    @Column({ nullable: true })
    status: 'sent' | 'delivered' | 'read';

    @Column({ default: false })
    isRead: boolean;

    @Column({ default: false })
    isEdited: boolean;

    @Column({ default: false })
    isDeleted: boolean;
}
