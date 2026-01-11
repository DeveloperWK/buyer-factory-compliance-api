import type { Request, Response } from "express";
import generateAccessToken from "../services/jwt.service";

export const login = async (req: Request, res: Response) => {
	try {
		const { userId, role, factoryId } = req.body;
		console.log(req.body);
		if ((!userId && !role) || !factoryId) {
			res.status(500).json({
				error: "login with all required field",
			});
			return;
		}

		const payload = {
			userId,
			role,
			factoryId,
		};
		const token = generateAccessToken(payload);
		if (token) {
			res.status(200).json({
				token,
			});
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: err,
		});
	}
};
