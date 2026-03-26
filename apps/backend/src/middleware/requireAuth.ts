import type { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/utils/errors";
import { RateLimitResult } from "@/services/rateLimit.service";

// Extend Express Request to carry the session
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string | null };
      sessionId?: string;
      id?: string; // For request tracing
      rateLimitResult?: RateLimitResult;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

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
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError());
  }
}
