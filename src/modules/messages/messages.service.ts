import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Like, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './entities/message.entity';
import { UserValidationService } from 'src/services/user-validation.service';
import { MessageType } from 'src/enum/message-type.enum';
import { MessageStatus } from 'src/enum/message-status.enum';
import { SearchMessagesDto } from './dto/search-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    user: any,
  ): Promise<Message> {
    const { receiverId } = createMessageDto;
    const userExist = await this.userValidationService.validateUserExist(
      receiverId,
      user.token,
    );
    if (!userExist) {
      throw new HttpException('User not found', 404);
    }

    let messageType: MessageType;
    if (createMessageDto.type) {
      messageType = createMessageDto.type;
    } else if (
      createMessageDto.content.startsWith('http') &&
      createMessageDto.content.match(/\.(jpeg|jpg|gif|png)$/)
    ) {
      messageType = MessageType.IMAGE;
    } else if (
      createMessageDto.content.startsWith('http') &&
      createMessageDto.content.match(/\.(mp4|avi|mov)$/)
    ) {
      messageType = MessageType.VIDEO;
    } else {
      messageType = MessageType.TEXT;
    }

    const existingMessage = await this.messagesRepository.findOne({
      where: [
        { senderId: user.userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: user.userId },
      ],
    });

    const chatId = existingMessage ? existingMessage.chatId : uuidv4();

    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId: user.userId,
      chatId: chatId,
      type: messageType,
      status: MessageStatus.SENT,
    });

    return await this.messagesRepository.save(message);
  }

  async findByUserId(userId: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });
  }

  async findByChatId(
    chatId: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<Message[]> {
    const skip = (page - 1) * pageSize;
    return await this.messagesRepository.find({
      where: { chatId },
      order: { timestamp: 'ASC' },
      skip,
      take: pageSize,
    });
  }

  async update(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    user: any,
  ): Promise<Message> {
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

    return await this.messagesRepository.save(updatedMessage);
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

  async markAsRead(chatId: string, user: any): Promise<Message[]> {
    const messagesToUpdate = await this.messagesRepository.find({
      where: { chatId, receiverId: user.userId, isRead: false },
    });

    if (messagesToUpdate.length === 0) {
      return [];
    }
    messagesToUpdate.forEach((message) => {
      message.status = MessageStatus.READ;
      message.isRead = true;
    });

    return await this.messagesRepository.save(messagesToUpdate);
  }

  async searchMessages(
    searchMessageDto: SearchMessagesDto,
    user: any,
  ): Promise<{ messages: Message[]; total: number }> {
    const { query, page = 1, pageSize = 10 } = searchMessageDto;

    const [messages, total] = await this.messagesRepository.findAndCount({
      where: [
        { senderId: user.userId, content: Like(`%${query}%`) },
        { receiverId: user.userId, content: Like(`%${query}%`) },
      ],
      order: { timestamp: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { messages, total };
  }

  async findUserMessages(user: any): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { receiverId: user.userId, isRead: false || true },
    });
  }
}
