import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
export function errorHandler(err, req, res, _next) {
    // Known application error — respond with structured payload
    if (err instanceof AppError) {
        const body = {
            error: err.message,
            code: err.code,
            ...(err.scansRemaining !== undefined && {
                scansRemaining: err.scansRemaining,
            }),
        };
        logger.warn({ requestId: req.id, code: err.code, statusCode: err.statusCode }, err.message);
        res.status(err.statusCode).json(body);
        return;
    }
    // Unknown error — don't leak internals
    logger.error({ requestId: req.id, err }, "Unhandled error");
    const body = {
        error: "Something went wrong",
        code: "SERVER_ERROR",
    };
    res.status(500).json(body);
}
//# sourceMappingURL=errorHandler.js.map