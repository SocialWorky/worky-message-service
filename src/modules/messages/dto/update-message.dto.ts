import { PartialType } from '@nestjs/mapped-types';
import { CreateMessageDto } from './create-message.dto';
import { IsOptional, IsString } from 'class-validator';
import { MessageType } from 'src/enum/message-type.enum';
import { MessageStatus } from 'src/enum/message-status.enum';

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
    @IsString()
    @IsOptional()
    content?: string;

    @IsOptional()
    type?: MessageType;

    @IsOptional()
    status?: MessageStatus;

}
