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
    const filePath = path.join(__dirname, "../../data/users.json");
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    let users = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      users = JSON.parse(data);
    }

    const existingUser = users.find((user: { email: string }) => user.email === email);

    if (existingUser) {
      const newCodes = codes.filter((code) => !existingUser.codes.some((existingCode: { value: string }) => existingCode.value === code.value));
      if (newCodes.length > 0) {
        const codesWithStatus = newCodes.map((code) => ({ ...code, status: false }));
        existingUser.codes.push(...codesWithStatus);
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        res.status(200).json({ message: "Códigos complementados com sucesso", user: existingUser });
      } else {
        res.status(200).json({ message: "Usuário e códigos já cadastrados", user: existingUser });
      }
    } else {
      const codesWithStatus = codes.map((code) => ({ ...code, status: false }));
      const newUser = { email, codes: codesWithStatus };
      users.push(newUser);
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
      res.status(201).json({ message: "Usuário cadastrado com sucesso", user: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao cadastrar usuário", error });
  }
};