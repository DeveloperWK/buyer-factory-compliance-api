import { Router } from "express";
import { login } from "../controllers/auth.controller";
import {
	createEvidence,
	createEvidenceVersion,
} from "../controllers/evidence.controller";

const router = Router();
router.post("", createEvidence);
router.post("/:evidenceId/versions", createEvidenceVersion);

export default router;
