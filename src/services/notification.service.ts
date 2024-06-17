import { HttpService } from '@nestjs/axios';
import { Injectable} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Message } from 'src/modules/messages/entities/message.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly httpService: HttpService) {}

  async notifyNewMessage(message: Message) {
    const notificationServiceUrl = `${process.env.SOCKET_BACKEND_URL}/notifications/chatNotifications`;

    const payload = {
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      chatId: message.chatId,
      message: message.content,
      timestamp: message.timestamp,
      type: message.type,
      status: message.status,
      isRead: message.isRead,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt,
    };

    try {
      const response = await firstValueFrom(this.httpService.post(notificationServiceUrl, payload));
      console.log('Notification sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}