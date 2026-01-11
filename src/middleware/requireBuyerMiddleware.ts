import { NextFunction, Request, Response } from "express";

export const checkRequireBuyer = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;
		if (user.role === "buyer") {
			next();
		} else {
			return res
				.status(403)
				.json({ message: "Unauthorized access buyer only" });
		}
	} catch (e) {
		return res
			.status(401)
			.json({ message: "Unauthorized Some error occurred", e });
	}
};
