import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EditService } from './edit.service';

@Controller('edit')
export class EditController {

    constructor(private readonly auth: AuthService, private readonly edit: EditService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async editProfile(@Body() changedInfo: any, @Req() req): Promise<any>{
        console.log('In Function');
        const user = await this.auth.getUserFromJwtCookie(req);
        await this.auth.compareUserToId(changedInfo.id_42, user);
        console.log('Passed Compare');
        await this.edit.changeUsername(changedInfo.id_42, changedInfo.name);

    }
}
