import jwt from "jsonwebtoken";

const JWT_SECRET = process.env._JWT_SECRET ?? "mockJwtSecret";
const JWT_EXPIRY = "15m";

const generateAccessToken = (payload: {
	userId: string;
	role: string;
	factoryId?: string;
}) => {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export default generateAccessToken;
