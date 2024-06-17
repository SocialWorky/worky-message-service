import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(payload: any): Promise<any> {
    return { userId: payload.id, username: payload.username, token: payload};
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId};
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}