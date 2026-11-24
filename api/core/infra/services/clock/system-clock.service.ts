import { IClockService } from '@domain/_services/clock/clock.service';

export class SystemClockService implements IClockService {
    now(): Date {
        return new Date();
    }
}
