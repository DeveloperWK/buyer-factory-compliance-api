import { Router } from "express";
import { getAllAudit } from "../controllers/audit.controller";

const router = Router();
router.get("", getAllAudit);

export default router;
