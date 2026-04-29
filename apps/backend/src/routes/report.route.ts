import { Router } from "express";
import { optionalAuth } from "@/middleware/optionalAuth.js";
import { reportController } from "@/controllers/report.controller.js";

const router: Router = Router();

router.post("/", optionalAuth, reportController.submit);

export default router;
