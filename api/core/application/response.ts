export class Response {
    static success<T>(data: T, statusCode = 200) {
        return {
            data,
            statusCode,
            message: null,
        };
    }

    static error<T>(data: T, message: string, statusCode = 400) {
        return {
            data,
            statusCode,
            message,
        };
    }
}
