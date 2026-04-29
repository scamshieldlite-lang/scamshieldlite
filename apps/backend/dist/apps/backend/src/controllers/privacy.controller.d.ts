import type { Request, Response, NextFunction } from "express";
export declare const privacyController: {
    /**
     * GET /api/privacy/settings
     */
    getSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * PATCH /api/privacy/settings
     */
    updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * POST /api/privacy/consent
     * Called when user accepts updated terms.
     */
    recordConsent(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/privacy/export
     * Returns a JSON file of all user data.
     */
    exportData(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/privacy/scan-history
     * Clears scan history but keeps the account.
     */
    deleteScanHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * DELETE /api/privacy/account
     * Full account deletion — irreversible.
     */
    deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
};
//# sourceMappingURL=privacy.controller.d.ts.map