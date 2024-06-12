import { HttpService } from '@nestjs/axios';
import { Injectable} from '@nestjs/common';
import { Message } from 'src/modules/messages/entities/message.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly httpService: HttpService) {}

  notifyNewMessage(message: Message) {
    // Definir la URL del microservicio de notificaciones
    const notificationServiceUrl = 'http://notification-service/newMessage';

    // Crear el payload para la notificación
    const payload = {
      message: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      timestamp: message.timestamp,
      type: message.type,
      status: message.status,
      isRead: message.isRead,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
    };

    // Enviar la notificación al microservicio de notificaciones
    this.httpService.post(notificationServiceUrl, payload).subscribe({
      next: (response) => {
        console.log('Notification sent successfully:', response.data);
      },
      error: (error) => {
        console.error('Error sending notification:', error);
      }
    });
  }
}