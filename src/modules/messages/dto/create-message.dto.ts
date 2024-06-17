import { IsString, IsNotEmpty, IsEnum, IsOptional, Max, MaxLength, IsNumber, Min } from 'class-validator';
import { MessageStatus } from 'src/enum/message-status.enum';
import { MessageType } from 'src/enum/message-type.enum';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()  
    @MaxLength(500)
    content: string;
    
    @IsString()
    @IsNotEmpty()
    receiverId: string;

    @IsOptional()
    @IsEnum(MessageType)
    type?: MessageType;

    @IsOptional()
    @IsEnum(MessageStatus)
    status?: MessageStatus;
}
