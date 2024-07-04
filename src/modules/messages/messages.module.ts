import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { UserValidationService } from 'src/services/user-validation.service';
import { NotificationService } from 'src/services/notification.service';
import { HttpModule } from '@nestjs/axios';
import { TimeService } from 'src/services/time.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), HttpModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    UserValidationService,
    NotificationService,
    TimeService,
  ],
})
export class MessagesModule {}
