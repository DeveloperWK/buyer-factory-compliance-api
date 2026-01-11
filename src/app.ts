import cookieParser from "cookie-parser";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import { checkUserAuthToken } from "./middleware/checkUserAuthToken";
import auditRoutes from "./routes/audit.routes";
import authRoutes from "./routes/auth.routes";

const app: Application = express();

const PORT = 5550;
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/audit", checkUserAuthToken, auditRoutes);
app.get("/health", checkUserAuthToken, (_req: Request, res: Response) => {
	res.send("hello");
});
app.listen(PORT, () => {
	console.log(`Server is running ${PORT}`);
});
