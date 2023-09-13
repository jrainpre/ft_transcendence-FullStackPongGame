import { IsInt, IsString, Length, Matches } from 'class-validator';

export class SendUserDto {
    
    @IsString()
    @Length(1, 20)  
    @Matches(/^[a-zA-Z0-9 ]*$/, {
        message: 'name should only contain alphabets and numbers'
    })
    name: string;

    @IsInt()
    id_42: number;
}