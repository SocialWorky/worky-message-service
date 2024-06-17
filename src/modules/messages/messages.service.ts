import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './entities/message.entity';
import { UserValidationService } from 'src/services/user-validation.service';
import { MessageType } from 'src/enum/message-type.enum';
import { MessageStatus } from 'src/enum/message-status.enum';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly userValidationService: UserValidationService
  ) {}

  async create(createMessageDto: CreateMessageDto, user:any): Promise<Message> {
    const { receiverId } = createMessageDto;
    const userExist = await this.userValidationService.validateUserExist(receiverId, user.token);
    if (!userExist) {
      throw new HttpException('User not found', 404);
    }

    let messageType: MessageType;
    if (createMessageDto.type) {
      messageType = createMessageDto.type;
    } else if (createMessageDto.content.startsWith('http') && createMessageDto.content.match(/\.(jpeg|jpg|gif|png)$/)) {
      messageType = MessageType.IMAGE;
    } else if (createMessageDto.content.startsWith('http') && createMessageDto.content.match(/\.(mp4|avi|mov)$/)) {
      messageType = MessageType.VIDEO;
    } else {
      messageType = MessageType.TEXT;
    }

    const existingMessage = await this.messagesRepository.findOne(
      { where: [
        { senderId: user.userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: user.userId }
      ]}
    );

    const chatId = existingMessage ? existingMessage.chatId : uuidv4();

    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId: user.userId,
      chatId: chatId,
      type: messageType,
      status: MessageStatus.SENT,
    });

    return this.messagesRepository.save(message);
  }

  findAll(): Promise<Message[]> {
    return this.messagesRepository.find();
  }

  findByUserId(userId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
      { senderId: userId },
      { receiverId: userId }
      ],      
    });
  }

  findByChatId(chatId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { chatId },
      order: { timestamp: 'ASC' }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  async update(messageId: string, updateMessageDto: UpdateMessageDto, user: any): Promise<Message> {
    const message = await this.messagesRepository.findOneBy({ _id: messageId });
    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    if (message.senderId !== user.userId) {
      throw new HttpException('You are not the sender of this message', 403);
    }
    
    const updatedMessage = {
      ...message,
      ...updateMessageDto,
      isEdited: true,
    };

    return this.messagesRepository.save(updatedMessage);
  }

  async remove(messageId: string, user: any): Promise<void> {
    const message = await this.messagesRepository.findOneBy({ _id: messageId });
    if (!message) {
      throw new HttpException('Message not found', 404);
    }

    if (message.senderId !== user.userId) {
      throw new HttpException('You are not the sender of this message', 403);
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await this.messagesRepository.save(message);
  }
}
