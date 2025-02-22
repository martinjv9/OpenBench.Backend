import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import sensorRoutes from "./routes/sensorRoutes";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/sensors", sensorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
