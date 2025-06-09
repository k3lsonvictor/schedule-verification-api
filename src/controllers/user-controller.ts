import { User } from "../models/user-model";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, codes } = req.body as { email: string; codes: { value: string }[] };

  if (!email || !codes || !Array.isArray(codes)) {
    res.status(400).json({ message: "Dados inválidos" });
    return;
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const newCodes = codes.filter((code) => !existingUser.codes.some((existingCode: { value: string }) => existingCode.value === code.value));
      if (newCodes.length > 0) {
        const codesWithStatus = newCodes.map((code) => ({ ...code, status: false }));
        existingUser.codes.push(...codesWithStatus);
        await existingUser.save();
        res.status(200).json({ message: "Códigos complementados com sucesso", user: existingUser });
      } else {
        res.status(200).json({ message: "Usuário e códigos já cadastrados", user: existingUser });
      }
    } else {
      const codesWithStatus = codes.map((code) => ({ ...code, status: false }));
      const newUser = new User({ email, codes: codesWithStatus });
      await newUser.save();
      res.status(201).json({ message: "Usuário cadastrado com sucesso", user: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar usuário", error });
  }
};

export const getTest = (req: Request, res: Response): void => {
  res.status(200).json({ message: "Test endpoint is working!" });
}