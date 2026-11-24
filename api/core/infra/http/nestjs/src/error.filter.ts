import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from '@application/response';
import { AppError } from '@application/error';

@Catch()
export class ErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        if (exception instanceof AppError) {
            return response
                .status(exception.statusCode)
                .json(Response.error(exception.data || null, exception.message, exception.statusCode));
        }

        if (Array.isArray(exception) && exception[0]?.constraints) {
            const first = exception[0];
            const message = Object.values(first.constraints)[0] as string;
            return response
                .status(HttpStatus.BAD_REQUEST)
                .json(Response.error(null, message, HttpStatus.BAD_REQUEST));
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            const message = typeof res === 'string' ? res : (res as any).message;
            return response.status(status).json(Response.error(null, message, status));
        }

        if (exception?.statusCode && exception?.message) {
            return response
                .status(exception.statusCode)
                .json(Response.error(exception.data || null, exception.message, exception.statusCode));
        }

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        return response.status(status).json(Response.error(null, 'Internal server error', status));
    }
}
