import { auth } from "../lib/auth.js";
import { UnauthorizedError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
export async function requireAuth(req, _res, next) {
    try {
        // Log what authorization header we receive
        const authHeader = req.headers.authorization;
        logger.debug(`requireAuth: Authorization header: ${authHeader ? authHeader.substring(0, 30) + "..." : "MISSING"}`);
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value) {
                headers.set(key, Array.isArray(value) ? value[0] : value);
            }
        });
        const session = await auth.api.getSession({ headers });
        logger.debug(`requireAuth: session result: ${session ? `user: ${session.user.id}` : "null"}`);
        if (!session?.user) {
            throw new UnauthorizedError();
        }
        req.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name ?? null,
        };
        req.sessionId = session.session.id;
        next();
    }
    catch (error) {
        if (error instanceof UnauthorizedError) {
            next(error);
            return;
        }
        next(new UnauthorizedError());
    }
}
//# sourceMappingURL=requireAuth.js.map