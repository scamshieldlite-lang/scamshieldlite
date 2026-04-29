import { Router } from "express";
import { auth } from "../lib/auth.js";
import { toNodeHandler } from "better-auth/node";
const router = Router();
// Better Auth handles ALL auth routes under /api/auth/*
// This includes: sign-up, sign-in, sign-out, get-session
// toNodeHandler converts Better Auth's fetch-based handler to Express
router.all("/*", toNodeHandler(auth));
export default router;
//# sourceMappingURL=auth.routes.js.map