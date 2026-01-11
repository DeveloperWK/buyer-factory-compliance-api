import express, { Application, type Request, Response } from "express";
import morgan from "morgan";
import { checkUserAuthToken } from "./middleware/checkUserAuthToken";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
const app: Application = express();

const PORT = 5550;
app.use(express.json());
app.use(cookieParser())
app.use(morgan("dev"));
app.use("/api/v1/auth", authRoutes);
app.get("/health", checkUserAuthToken, (req: Request, res: Response) => {
	res.send("hello");
});
app.listen(PORT, () => {
	console.log(`Server is running ${PORT}`);
});
