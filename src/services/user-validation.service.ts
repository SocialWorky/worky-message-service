import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserValidationService {
    constructor(
        private httpService: HttpService,
    ) {}

    async validateUserExist(userIdReceiver: string, token: string): Promise<boolean> {
        const url = `${process.env.API_BACKEND_URL}/user/validUser/${userIdReceiver}`;
        const headers = {
            Authorization: `Bearer ${token}`,  // Construimos el encabezado Authorization
        };

        try {
            const response = await lastValueFrom(this.httpService.get(url, { headers }));
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 404) { 
            }
            return false;
        }
    }
}
