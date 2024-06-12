import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(payload: any): Promise<any> {
    return { userId: payload.id, username: payload.username };
  }
}