import { Router } from "express";
import {
	createRequests,
	requestItemsFullfilled,
} from "../controllers/requests.controller";
import { checkRequireBuyer } from "../middleware/requireBuyerMiddleware";
import { checkRequireFactory } from "../middleware/requireFactoryMiddleware";

const router = Router();
router.post("", checkRequireBuyer, createRequests);
router.post(
	"/:requestId/items/:itemId/fulfill",
	checkRequireFactory,
	requestItemsFullfilled,
);

export default router;
