import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure env is loaded even when this module is imported before server-level config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root .env is two levels up from utils/
const rootEnvPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: rootEnvPath });

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.warn("GMAIL_USER or GMAIL_APP_PASSWORD is not set. Verification emails will fail until configured.");
}

export const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates for local dev
  },
});

export const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `GymMate <${GMAIL_USER || "no-reply@gymmate.local"}>`,
    to,
    subject: "GymMate Email Verification Code",
    text: `Your GymMate verification code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #071434;">
        <h2>Verify your GymMate account</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</div>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return mailer.sendMail(mailOptions);
};
