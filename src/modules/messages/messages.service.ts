import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { UserValidationService } from 'src/services/user-validation.service';

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

    const message = this.messagesRepository.create(createMessageDto);
    return this.messagesRepository.save(message);
  }

  findAll(): Promise<Message[]> {
    return this.messagesRepository.find();
  }

  findByUserId(userId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
