import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from  '@nestjs/axios'
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserValidationService {
    constructor(
        private readonly httpService: HttpService
    ) {}

    async validateUserExist(userIdReceiver: string, token: string): Promise<boolean> {
        const url = `${ process.env.API_BACKEND_URL }/user/${userIdReceiver}`;
        const headers = {
            Authorization: `Bearer ${token}`,
        };
        try {
            const response = await lastValueFrom(this.httpService.get(url, { headers }));
            return response.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false;
            }
            throw new HttpException('Error validating user', error.response.status);
        }
    }
}
