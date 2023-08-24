import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, Strategy} from 'passport-jwt'
import { Request } from 'express';

@Injectable()
export class JwtStrategty extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                  return request.cookies['jwtToken']; // Extract token from cookie
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: '1337Secret'
        })
    }

    async validate(payload: any){
        return{
            id: payload.id,
            username: payload.username,
        }
    }
}