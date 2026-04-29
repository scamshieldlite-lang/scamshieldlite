// apps/backend/src/utils/errors.ts
export class AppError extends Error {
    statusCode;
    code;
    scansRemaining;
    constructor(message, statusCode, code, scansRemaining) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.scansRemaining = scansRemaining;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class RateLimitError extends AppError {
    constructor(message = "Too many requests", scansRemaining = 0) {
        super(message, 429, "RATE_LIMITED", scansRemaining);
        this.name = "RateLimitError";
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401, "UNAUTHORIZED");
        this.name = "UnauthorizedError";
    }
}
export class InvalidInputError extends AppError {
    constructor(message = "Invalid input") {
        super(message, 400, "INVALID_INPUT");
        this.name = "InvalidInputError";
    }
}
export class ServerError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500, "SERVER_ERROR");
        this.name = "ServerError";
    }
}
//# sourceMappingURL=errors.js.map