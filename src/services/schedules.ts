import axios from "axios";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

const schedulesCodes = [
  "9177078",
]

const ConfirmationText = "ENCAMINHAMENTO MARCADO";

export async function scheduleVerification() {
  for (const code of schedulesCodes) {
    try {
      console.log(`Verificando agendamento ${code}...`);
      const response = await axios.get(
        `https://agendamentos.sus.fms.pmt.pi.gov.br/detail_scheduling/index?utf8=%E2%9C%93&number_id=${code}`
      );
      let html = response.data;

      if (!html.startsWith("<!DOCTYPE html>")) {
        html = "<!DOCTYPE html>\n" + html;
      }

      if(html.includes(ConfirmationText)) {
        console.log("Consulta marcada! Enviando email...");
        await sendEmail(`A consulta com o código ${code} foi agendada.`, fixImagePaths(html));
      } else {
        console.log("Consulta não marcada.");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching schedule ${code}:`, error.message);
      } else {
        console.error(`Error fetching schedule ${code}:`, error);
      }
    }
  }
}

function fixImagePaths(html: string): string {
  const baseUrl = "https://agendamentos.sus.fms.pmt.pi.gov.br";
  html = html.replace(/src="\/(assets\/[^"]+)"/g, `src="${baseUrl}/$1"`);
  html = html.replace(/href="\/(assets\/[^"]+)"/g, `href="${baseUrl}/$1"`);
  return html;
}

async function sendEmail(message: string, htmlContent: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "k3lson.oliveira@gmail.com",
    to: "k3lson.victor@gmail.com",
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