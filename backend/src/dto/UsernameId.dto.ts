import { IsNotEmpty, Length, isString } from "class-validator";

export class UsernameIdDTO{

    @IsNotEmpty()
    id_42: string;

    @IsNotEmpty()
    @Length(1, 20)
    name: string;
}