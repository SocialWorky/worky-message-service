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
      console.log("user log data: ",req.user);

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
  findByUserId(@Param('id') userId: string) {
    return this.messagesService.findByUserId(userId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
  //   return this.messagesService.update(+id, updateMessageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.messagesService.remove(+id);
  // }
}
