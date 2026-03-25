import { Router } from "express";
import { optionalAuth } from "@/middleware/optionalAuth";
import { reportController } from "@/controllers/report.controller";

const router: Router = Router();

router.post("/", optionalAuth, reportController.submit);

export default router;
