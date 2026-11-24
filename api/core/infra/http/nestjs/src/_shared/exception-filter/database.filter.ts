import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { DatabaseError } from 'pg-protocol';
import { Logger } from '@nestjs/common';

@Catch(DatabaseError)
export class DatabaseFilter implements ExceptionFilter {
    private readonly logger = new Logger(DatabaseFilter.name);

    catch(exception: DatabaseError, host: ArgumentsHost) {
        this.logger.error(exception.message, exception.stack);

        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = 500;

        response.status(status).json({
            data: null,
            statusCode: status,
            message: 'Database error',
        });
    }
}
