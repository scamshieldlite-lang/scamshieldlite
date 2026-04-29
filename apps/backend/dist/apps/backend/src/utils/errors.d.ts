import type { ApiError } from "../../../../packages/shared/scan";
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: ApiError["code"];
    readonly scansRemaining?: number;
    constructor(message: string, statusCode: number, code: ApiError["code"], scansRemaining?: number);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, scansRemaining?: number);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class InvalidInputError extends AppError {
    constructor(message?: string);
}
export declare class ServerError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map