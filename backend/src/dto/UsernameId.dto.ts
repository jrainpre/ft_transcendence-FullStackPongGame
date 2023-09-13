import { IsNotEmpty, Length, Matches, isString } from "class-validator";

export class UsernameIdDTO{

    @IsNotEmpty()
    id_42: string;

    @IsNotEmpty()
    @Length(1, 20)
    @Matches(/^\S*$/, { message: 'Field cannot contain spaces' })
    name: string;
}