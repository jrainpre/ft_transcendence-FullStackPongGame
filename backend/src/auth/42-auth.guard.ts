import { AuthGuard } from "@nestjs/passport";

export class FortyTwoGuard extends AuthGuard('42'){
    
}