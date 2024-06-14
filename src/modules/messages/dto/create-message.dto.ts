import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()    
    content: string;
    
    @IsString()
    @IsNotEmpty()
    receiverId: string;

}
