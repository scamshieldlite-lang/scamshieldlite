import type { Request, Response, NextFunction } from "express";

export const reportController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 9 (report scam feature)
    res.status(501).json({ error: "Not yet implemented" });
  },
};
