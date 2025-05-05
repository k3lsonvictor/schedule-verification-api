import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user-routes";
import { scheduleVerification } from "./services/schedules";
import cors from "cors";

const app = express();

app.use(bodyParser.json());

app.use(cors({ origin: "*" }));

app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  scheduleVerification();
})