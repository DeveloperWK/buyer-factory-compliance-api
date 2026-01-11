import { NextFunction, Request, Response } from "express";

export const checkRequireFactory = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = req.user;
		if (user.factoryId && user.role === "factory") {
			next();
		} else {
			return res
				.status(403)
				.json({ message: "Unauthorized access factory access just" });
		}
	} catch (e) {
		return res
			.status(401)
			.json({ message: "Unauthorized Some error occurred", e });
	}
};
