import { IsInt, IsBoolean, IsString, Length, IsOptional, Matches } from 'class-validator';


export class SendChannelDto {
    @IsInt()
    id: number;

    @IsString()
    @Length(1, 50) 
    name: string;

    @IsBoolean()
    private_channel: boolean;

    @IsString()
    @IsOptional()  
    password: string;
}