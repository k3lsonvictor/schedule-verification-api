import express from "express";
import { registerUser } from "../controllers/user-controller";

const router = express.Router();

// Rota para cadastro de usuário
router.post("/register", registerUser);

export default router;