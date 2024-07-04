// time.service.ts
import { Injectable } from '@nestjs/common';
import { format, toDate } from 'date-fns-tz';

@Injectable()
export class TimeService {
  private readonly timeZone = 'America/Santiago';

  getLocalTime(date: Date): Date {
    return toDate(date, { timeZone: this.timeZone });
  }

  formatLocalTime(date: Date): string {
    const zonedDate = this.getLocalTime(date);
    return format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', {
      timeZone: this.timeZone,
    });
  }
}
