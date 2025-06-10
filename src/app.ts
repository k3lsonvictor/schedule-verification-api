import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user-routes";
import { scheduleVerification } from "./services/schedules";
import cors from "cors";
import { connectDB } from "./config/db";

const app = express();
connectDB();

const allowedOrigin = "https://verificacao-de-agendamento-e3lce.ondigitalocean.app/"

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json());
app.use("/users", userRoutes);

app.listen(8000, () => {
  console.log("Server is running on port 3000");
  scheduleVerification();
})