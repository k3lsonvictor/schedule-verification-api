import { User } from "../models/user-model";
import { Request, Response, NextFunction } from "express";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, codes } = req.body;

  if (!email || !codes || !Array.isArray(codes)) {
    res.status(400).json({ message: "Dados inválidos" });
  }

  try {
    const user = new User({ email, codes });
    await user.save();
    res.status(201).json({ message: "Usuário cadastrado com sucesso", user });
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar usuário", error });
  }
};