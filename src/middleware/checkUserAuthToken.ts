import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user: {
				userId: string;
				role: string;
				factoryId: string;
			};
		}
	}
}
export const checkUserAuthToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const SECRET = process.env._JWT_SECRET ?? "mockJwtSecret";
	const accessToken = req.cookies.token;
	try {
		const decodedToken = jwt.verify(accessToken, SECRET!) as JwtPayload;
		if (!decodedToken) {
			return res.status(401).json({ message: "Unauthorized Token not valid" });
		}
		req.user = {
			userId: decodedToken.userId,
			factoryId: decodedToken.factoryId,
			role: decodedToken.role,
		};
		next();
	} catch (e) {
		return res
			.status(401)
			.json({ message: "Unauthorized Some error occurred", e });
	}
};
