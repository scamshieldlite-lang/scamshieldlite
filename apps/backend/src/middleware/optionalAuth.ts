import type { Request, Response, NextFunction } from "express";
import { auth } from "@/lib/auth";

// Same as requireAuth but never throws — guest requests pass through
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(key, Array.isArray(value) ? value[0] : value);
      }
    });

    const session = await auth.api.getSession({ headers });

    if (session?.user) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
      };
      req.sessionId = session.session.id;
    }
  } catch {
    // Silently continue as guest
  }

  next();
}
