import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Message } from './entities/message.entity';
import { UserValidationService } from 'src/services/user-validation.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SearchMessagesByDateDto } from './dto/search-messages-by-date.dto';
import { MessageType } from 'src/enum/message-type.enum';
import { MessageStatus } from 'src/enum/message-status.enum';
import { TimeService } from 'src/services/time.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly userValidationService: UserValidationService,
    private readonly timeService: TimeService,
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
      timestamp: this.timeService.getLocalTime(new Date()),
      status: MessageStatus.SENT,
    });

    return await this.messagesRepository.save(message);
  }

  async findUsersWithConversations(userId: string): Promise<string[]> {
    const messages = await this.messagesRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      select: ['senderId', 'receiverId'],
    });

    const userIds = new Set<string>();
    messages.forEach((message) => {
      if (message.senderId !== userId) {
        userIds.add(message.senderId);
      }
      if (message.receiverId !== userId) {
        userIds.add(message.receiverId);
      }
    });
    const filteredUserIds = Array.from(userIds).filter((id) => id !== userId);

    return filteredUserIds;
  }

  async findConversationsWithUser(
    userId: string,
    otherUserId: string,
  ): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { timestamp: 'ASC' },
    });
  }

  async findLastConversationWithUser(
    userId: string,
    otherUserId: string,
  ): Promise<Message> {
    return await this.messagesRepository.findOne({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { timestamp: 'DESC' },
    });
  }

  async countConversationsWithUser(
    userId: string,
    otherUserId: string,
  ): Promise<number> {
    return await this.messagesRepository.count({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });
  }

  async findConversationsByDate(
    userId: string,
    searchMessagesByDateDto: SearchMessagesByDateDto,
  ): Promise<Message[]> {
    const { startDate, endDate } = searchMessagesByDateDto;
    const start = new Date(startDate.split('/').reverse().join('-'));
    const end = new Date(endDate.split('/').reverse().join('-'));
    return await this.messagesRepository.find({
      where: [
        { senderId: userId, timestamp: Between(start, end) },
        { receiverId: userId, timestamp: Between(start, end) },
      ],
      order: { timestamp: 'DESC' },
    });
  }

  async updateMessageStatus(
    messageId: string,
    userId: string,
    isRead: boolean,
  ): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { _id: messageId },
    });
    if (!message) {
      throw new HttpException('Message not found', 404);
    }
    if (message.receiverId !== userId) {
      throw new HttpException('Unauthorized', 403);
    }
    message.isRead = isRead;
    if (isRead) {
      message.status = MessageStatus.READ;
    }
    return await this.messagesRepository.save(message);
  }

  async update(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    user: any,
  ): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { _id: messageId },
    });
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
    const message = await this.messagesRepository.findOne({
      where: { _id: messageId },
    });
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

  async markMessagesAsRead(
    chatId: string,
    senderId: string,
  ): Promise<Message[]> {
    const messagesToUpdate = await this.messagesRepository.find({
      where: { chatId, senderId, isRead: false },
    });

    await this.messagesRepository.update(
      { chatId, senderId, isRead: false },
      { isRead: true },
    );

    return messagesToUpdate.map((message) => {
      message.isRead = true;
      return message;
    });
  }

  async getUnreadMessagesCount(
    userId: string,
    chatId: string,
    senderId: string,
  ): Promise<number> {
    return this.messagesRepository.count({
      where: { receiverId: userId, senderId, isRead: false, chatId },
    });
  }
}
