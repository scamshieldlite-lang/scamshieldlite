import type { Request, Response, NextFunction } from "express";

export const scanController = {
  async analyze(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 5 (AI detection engine)
    res.status(501).json({ error: "Not yet implemented" });
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 7 (text scan feature)
    res.status(501).json({ error: "Not yet implemented" });
  },
};
