import type { Request, Response } from "express";
import { readAllAuditLogsToDb } from "../services/audit.service";

export const getAllAudit = async (_req: Request, res: Response) => {
	try {
		const audit = readAllAuditLogsToDb();

		res.status(200).json({
			audit,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
