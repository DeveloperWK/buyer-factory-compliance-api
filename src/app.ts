import cookieParser from "cookie-parser";
import express, { type Application } from "express";
import morgan from "morgan";
import { checkUserAuthToken } from "./middleware/checkUserAuthToken";
import auditRoutes from "./routes/audit.routes";
import authRoutes from "./routes/auth.routes";
import evidenceRoutes from "./routes/evidence.routes";
import requestRoutes from "./routes/requests.routes";
import { checkRequireFactory } from "./middleware/requireFactoryMiddleware";
import { getAllRequests } from "./controllers/requests.controller";

const app: Application = express();

const PORT = 5550;
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/audit", checkUserAuthToken, auditRoutes);
app.use(
	"/api/v1/evidence",
	checkUserAuthToken,
	checkRequireFactory,
	evidenceRoutes,
);
app.use("/api/v1/requests", checkUserAuthToken, requestRoutes);
app.get(
	"/api/v1/factory/requests",
	checkUserAuthToken,
	checkRequireFactory,
	getAllRequests,
);
app.listen(PORT, () => {
	console.log(`Server is running ${PORT}`);
});
