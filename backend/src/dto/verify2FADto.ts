import { IsNotEmpty, isString } from "class-validator";

export class verify2FADto{

    @IsNotEmpty()
    id  : string;

    @IsNotEmpty()
    code: string;
}