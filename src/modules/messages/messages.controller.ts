import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SearchMessagesByDateDto } from './dto/search-messages-by-date.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Message } from './entities/message.entity';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req: any) {
    return await this.messagesService.create(createMessageDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async findUsersWithConversations(@Req() req: any) {
    return await this.messagesService.findUsersWithConversations(
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:otherUserId')
  async findConversationsWithUser(
    @Param('otherUserId') otherUserId: string,
    @Req() req: any,
  ) {
    return await this.messagesService.findConversationsWithUser(
      req.user.userId,
      otherUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:otherUserId/last')
  async findLastConversationWithUser(
    @Param('otherUserId') otherUserId: string,
    @Req() req: any,
  ) {
    return await this.messagesService.findLastConversationWithUser(
      req.user.userId,
      otherUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:otherUserId/count')
  async countConversationsWithUser(
    @Param('otherUserId') otherUserId: string,
    @Req() req: any,
  ) {
    return await this.messagesService.countConversationsWithUser(
      req.user.id,
      otherUserId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/date')
  async findConversationsByDate(
    @Query() searchMessagesByDateDto: SearchMessagesByDateDto,
    @Req() req: any,
  ) {
    return await this.messagesService.findConversationsByDate(
      req.user.userId,
      searchMessagesByDateDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':messageId/read')
  async updateMessageStatus(
    @Param('messageId') messageId: string,
    @Req() req: any,
  ) {
    return await this.messagesService.updateMessageStatus(
      messageId,
      req.user.userId,
      true,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':messageId')
  async update(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req: any,
  ) {
    return await this.messagesService.update(
      messageId,
      updateMessageDto,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':messageId')
  async remove(@Param('messageId') messageId: string, @Req() req: any) {
    return await this.messagesService.remove(messageId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-as-read')
  async markMessagesAsRead(
    @Body() body: { chatId: string; senderId: string },
  ): Promise<Message[]> {
    return await this.messagesService.markMessagesAsRead(
      body.chatId,
      body.senderId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count/:messageId/:senderId')
  async getUnreadMessagesCount(
    @Param('messageId') messageId: string,
    @Param('senderId') senderId: string,
    @Req() req: any,
  ): Promise<number> {
    return await this.messagesService.getUnreadMessagesCount(
      req.user.userId,
      messageId,
      senderId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-all-count')
  async getUnreadAllMessagesCount(@Req() req: any): Promise<number> {
    return await this.messagesService.getUnreadAllMessagesCount(
      req.user.userId,
    );
  }
}
