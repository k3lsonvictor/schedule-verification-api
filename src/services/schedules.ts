import axios from "axios";
import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();
import users from "../../data/users.json";

const data = users as { email: string; codes: { value: string, status: boolean }[] }[];

const ConfirmationText = "ENCAMINHAMENTO MARCADO";

// export async function scheduleVerification() {
//   for (const user of data) {
//     for (const code of user.codes) {
//       try {
//         console.log(`Verificando agendamento ${code} para o email ${user.email}...`);
//         const response = await axios.get(
//           `https://agendamentos.sus.fms.pmt.pi.gov.br/detail_scheduling/index?utf8=%E2%9C%93&number_id=${code}`
//         );
//         let html = response.data;

//         if (!html.startsWith("<!DOCTYPE html>")) {
//           html = "<!DOCTYPE html>\n" + html;
//         }

//         if (html.includes(ConfirmationText)) {
//           console.log("Consulta marcada! Enviando email...");
//           await sendEmail(user.email,
//             `A consulta com o código ${code} foi agendada.`,
//             fixImagePaths(html)
//           );
//         } else {
//           console.log("Consulta não marcada.");
//         }
//       } catch (error) {
//         if (error instanceof Error) {
//           console.error(`Error fetching schedule ${code} para o email ${user.email}:`, error.message);
//         } else {
//           console.error(`Error fetching schedule ${code} para o email ${user.email}:`, error);
//         }
//       }
//     }
//   }
// }

export async function scheduleVerification() {
  const userPromises = data.map(async (user) => {
    for (const code of user.codes) {
      try {
        console.log(`Verificando agendamento ${code} para o email ${user.email}...`);
        const response = await axios.get(
          `https://agendamentos.sus.fms.pmt.pi.gov.br/detail_scheduling/index?utf8=%E2%9C%93&number_id=${code}`
        );
        let html = response.data;

        if (!html.startsWith("<!DOCTYPE html>")) {
          html = "<!DOCTYPE html>\n" + html;
        }

        if (html.includes(ConfirmationText)) {
          console.log("Consulta marcada! Enviando email...");
          await sendEmail(
            user.email,
            `A consulta com o código ${code} foi agendada.`,
            fixImagePaths(html)
          );
        } else {
          console.log("Consulta não marcada.");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error fetching schedule ${code} para o email ${user.email}:`, error.message);
        } else {
          console.error(`Error fetching schedule ${code} para o email ${user.email}:`, error);
        }
      }
    };

    // Aguarda todas as promessas de códigos para o usuário atual
  });

  // Aguarda todas as promessas de usuários
  await Promise.all(userPromises);
}

function fixImagePaths(html: string): string {
  const baseUrl = "https://agendamentos.sus.fms.pmt.pi.gov.br";
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