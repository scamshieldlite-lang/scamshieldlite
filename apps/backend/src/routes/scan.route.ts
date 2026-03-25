import { Router } from "express";
import { optionalAuth } from "@/middleware/optionalAuth";
import { scanController } from "@/controllers/scan.controller";

const router: Router = Router();

// Both guests and registered users can scan
// optionalAuth attaches user if token present, otherwise continues as guest
router.post("/", optionalAuth, scanController.analyze);

// Registered users only — scan history
router.get("/history", scanController.getHistory);

export default router;
