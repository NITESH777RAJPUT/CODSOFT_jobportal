// ...existing code...
import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.EMAIL_USER) {
        console.warn("EMAIL config not set. Skipping email send.");
        return;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
};
