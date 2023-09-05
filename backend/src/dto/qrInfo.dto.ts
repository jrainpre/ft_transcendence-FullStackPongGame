import { IsNotEmpty, isString } from "class-validator";

export class qrInfoDTO{

    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    code: string;
}