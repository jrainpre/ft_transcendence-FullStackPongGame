import { IsNotEmpty, isString } from "class-validator";

export class UsernameIdDTO{

    @IsNotEmpty()
    id_42: string;

    @IsNotEmpty()
    name: string;


}