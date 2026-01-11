import type { Request, Response } from "express";
import generateAccessToken from "../services/jwt.service";

export const createEvidence = async (req: Request, res: Response) => {
	try {
		const { name, docType, expiry, notes } = req.body;
	
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
