import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationService } from 'src/services/notification.service';
import { SearchMessagesDto } from './dto/search-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    const message = await this.messagesService.create(
      createMessageDto,
      req.user,
    );
    this.notificationService.notifyNewMessage(message);
    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  findByUserId(@Param('id') userId: string) {
    return this.messagesService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/:chatId')
  findByChatId(@Param('chatId') chatId: string) {
    return this.messagesService.findByChatId(chatId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  async update(
    @Param('id') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req,
  ) {
    const updatedMessage = await this.messagesService.update(
      messageId,
      updateMessageDto,
      req.user,
    );
    return updatedMessage;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async remove(@Param('id') messageId: string, @Req() req) {
    await this.messagesService.remove(messageId, req.user);
    return { message: 'Message deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('mark-read/:chatId')
  async markAsRead(@Param('chatId') chatId: string, @Req() req) {
    const updatedMessage = await this.messagesService.markAsRead(
      chatId,
      req.user,
    );
    return updatedMessage;
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchMessages(
    @Query('query') query: string,
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('pageSize', new ParseIntPipe()) pageSize: number = 10,
    @Req() req,
  ) {
    const user = req.user;
    const searchMessageDto: SearchMessagesDto = { query, page, pageSize };
    return this.messagesService.searchMessages(searchMessageDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async findUserMessages(@Query('userId') userId: string) {
    return this.messagesService.findUserMessages(userId);
  }
}
