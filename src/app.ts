import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user-routes";
import { scheduleVerification } from "./services/schedules";
import cors from "cors";
import { connectDB } from "./config/db";

const app = express();
connectDB();

app.use(cors({
  origin: "https://verificacao-de-agendamento-e3lce.ondigitalocean.app/", // substitua pelo domínio real do frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors());
app.use(bodyParser.json());
app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  scheduleVerification();
})