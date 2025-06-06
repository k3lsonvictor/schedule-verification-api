import express from "express";
import { getTest, registerUser } from "../controllers/user-controller";

const router = express.Router();

// Rota para cadastro de usuário
router.post("/register", registerUser);
router.get("/test", getTest);

export default router;