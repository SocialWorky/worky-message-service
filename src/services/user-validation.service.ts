import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from  '@nestjs/axios'

@Injectable()
export class UserValidationService {
    constructor(
        private readonly httpService: HttpService
    ) {}

    async validateUserExist(userId: string): Promise<boolean> {
        try {
            const response = await this.httpService.get(`http://localhost:3000/users/${userId}`).toPromise();
            return response.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false;
            }
            throw new HttpException('Error validating user', error.response.status);
        }
    }
}
