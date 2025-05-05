import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user-routes";
import { scheduleVerification } from "./services/schedules";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(cors({ origin: "*" }));

app.use("/users", userRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  scheduleVerification();
})