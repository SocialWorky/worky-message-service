import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private readonly authService: AuthService,
      private jwtService: JwtService) {
    // const request = context.switchToHttp().getRequest();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const payloadToken = { 
      id: payload.id,
      email: payload.email,
      username: payload.username,
      name: payload.name + ' ' + payload.lastname,
      role: payload.role,
      avatar: payload.avatar,
      }
    const expirationTime = 3*60*60;
    const token = this.jwtService.sign(payloadToken, {expiresIn: expirationTime});
    return { userId: payload.id, username: payload.username, token: token};
  }
}