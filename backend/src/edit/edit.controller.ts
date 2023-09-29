import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EditService } from './edit.service';
import { UsernameIdDTO } from 'src/dto/UsernameId.dto';

@Controller('edit')
export class EditController {

    constructor(private readonly auth: AuthService, private readonly edit: EditService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async editProfile(@Body() changedInfo: UsernameIdDTO, @Req() req, @Res() res): Promise<any>{
        const user = await this.auth.getUserFromJwtCookie(req);
        await this.auth.compareUserToId(changedInfo.id_42, user);
        await this.edit.changeUsername(changedInfo.id_42, changedInfo.name);
        res.json({ success: true });
    }
}
