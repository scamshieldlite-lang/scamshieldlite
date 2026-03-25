import type { Request, Response, NextFunction } from "express";

export const subscriptionController = {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 11 (subscription system)
    res.status(501).json({ error: "Not yet implemented" });
  },

  async verifyPurchase(req: Request, res: Response, next: NextFunction) {
    // Implemented in Phase 11 (subscription system)
    res.status(501).json({ error: "Not yet implemented" });
  },
};
