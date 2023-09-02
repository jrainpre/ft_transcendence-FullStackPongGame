import { Controller, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';

@Controller('upload')
export class UploadController {

    constructor(private upload: UploadService, private auth: AuthService) {}
    
    @UseGuards(JwtAuthGuard)
    @Post('/avatar')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
          destination: './img',
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
              const filePath = join('./img', `${randomName}${extname(file.originalname)}`);
            return cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
      }),
    )
    async changeAvatar(@UploadedFile() file, @Req() req, @Res() res): Promise<any>{
        const user = await this.auth.getUserFromJwtCookie(req);
        await this.upload.changeAvatar(file.path, user);
        res.json({ success: true });
    }

}