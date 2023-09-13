import { IsInt, IsBoolean, IsString, Length, Matches } from 'class-validator';

export class SendChannelUserDto {
    
    @IsString()
    @Length(1, 50)  // Ensures the name is between 1 and 255 characters
    @Matches(/^[a-zA-Z0-9 ]*$/, {
        message: 'name should only contain alphabets and numbers'
    })
    name: string;

    @IsInt()
    id_42: number;

    @IsBoolean()
    admin: boolean;

    @IsBoolean()
    owner: boolean;
}