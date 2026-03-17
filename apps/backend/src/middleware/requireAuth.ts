import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { logger } from "../utils/logger";

// Extend Express Request to carry the session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
      sessionId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Better Auth validates the Bearer token from the Authorization header
    // React Native sends: Authorization: Bearer <token>
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session?.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized. Please log in.",
      });
      return;
    }

    // Attach to request for downstream use
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    req.sessionId = session.session.id;

    next();
  } catch (error) {
    logger.error("Auth middleware error", error);
    res.status(401).json({
      success: false,
      error: "Invalid or expired session.",
    });
  }
}
