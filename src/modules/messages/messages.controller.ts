import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationService } from 'src/services/notification.service';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationService: NotificationService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto, 
    @Req() req,
  ) {
      const message = await this.messagesService.create(createMessageDto, req.user);
      this.notificationService.notifyNewMessage(message);
      return message;
    }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.messagesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  findByUserId(
    @Param('id') userId: string
    ) {
    return this.messagesService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/:chatId')
  findByChatId(
    @Param('chatId') chatId: string
    ) {
    return this.messagesService.findByChatId(chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async update(
    @Param('id') messageId: string, 
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req,
  ) {
    const updatedMessage = await this.messagesService.update(messageId, updateMessageDto, req.user);
    return updatedMessage;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async remove(
    @Param('id') messageId: string,
    @Req() req,
    ){
    await this.messagesService.remove(messageId, req.user);
    return { message: 'Message deleted successfully'};
  }
}
