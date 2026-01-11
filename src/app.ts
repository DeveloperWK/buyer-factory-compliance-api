import express, { type Application } from "express";
import morgan from "morgan";

const app: Application = express();

const PORT = 5550;
app.use(express.json());
app.use(morgan("dev"));

app.listen(PORT, () => {
	console.log(`Server is running ${PORT}`);
});
