import axios from "axios";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
import { User } from "../models/user-model"; // Importa o model do usuário
import mongoose from "mongoose";
const baseUrl = process.env.BASE_URL;

const ConfirmationText = "ENCAMINHAMENTO MARCADO";

// Garante conexão com o banco antes de rodar a verificação
async function ensureDbConnection() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/seu_banco");
  }
}

export async function scheduleVerification() {
  await ensureDbConnection();

  // Busca todos os usuários e códigos
  const users = await User.find({});

  const userPromises = users.map(async (user) => {
    for (const code of user.codes) {
      try {
        console.log(`Verificando agendamento ${code.value} para o email ${user.email}...`);
        if (!code.status) {
          const response = await axios.get(
            `${baseUrl}/detail_scheduling/index?utf8=%E2%9C%93&number_id=${code.value}`
          );

          let html = response.data;

          if (!html.startsWith("<!DOCTYPE html>")) {
            html = "<!DOCTYPE html>\n" + html;
          }

          if (html.includes(ConfirmationText)) {
            console.log("Consulta marcada! Enviando email...");
            await sendEmail(
              user.email,
              `A consulta com o código ${code.value} foi agendada.`,
              fixImagePaths(html)
            );
            // Atualiza o status para true após o envio bem-sucedido
            code.status = true;
            await user.save(); // Salva a atualização no banco
          } else {
            console.log("Consulta não marcada.");
          }
        } else {
          console.log(`O código ${code.value} já foi enviado anteriormente.`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error fetching schedule ${code.value} para o email ${user.email}:`, error.message);
        } else {
          console.error(`Error fetching schedule ${code.value} para o email ${user.email}:`, error);
        }
      }
    }
  });

  await Promise.all(userPromises);
}

function fixImagePaths(html: string): string {
  html = html.replace(/src="\/(assets\/[^"]+)"/g, `src="${baseUrl}/$1"`);
  html = html.replace(/href="\/(assets\/[^"]+)"/g, `href="${baseUrl}/$1"`);
  return html;
}

async function sendEmail(email: string, message: string, htmlContent: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "k3lson.oliveira@gmail.com",
    to: email,
    subject: "Alerta SUS",
    html: `
      <p>${message}</p>
      <div>${htmlContent}</div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", info.response);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
}

setInterval(scheduleVerification, 12 * 60 * 60 * 1000);