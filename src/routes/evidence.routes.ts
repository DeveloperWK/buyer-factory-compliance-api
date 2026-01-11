import { Router } from "express";
import {
	createEvidence,
	createEvidenceVersion,
	getEvidence,
} from "../controllers/evidence.controller";
import { checkRequireFactory } from "../middleware/requireFactoryMiddleware";

const router = Router();
router.post("", checkRequireFactory, createEvidence);
router.post(
	"/:evidenceId/versions",
	checkRequireFactory,
	createEvidenceVersion,
);
router.get("/:requestId", getEvidence);

export default router;
