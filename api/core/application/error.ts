export class AppError extends Error {
    statusCode: number;
    data?: Record<string, any>;

    constructor(message: string, statusCode = 400, data?: Record<string, any>) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.data = data;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            data: this.data,
        };
    }
}
