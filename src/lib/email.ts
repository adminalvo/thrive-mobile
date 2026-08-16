import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "mail.thrive.az",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "info@thrive.az",
    pass: process.env.EMAIL_PASSWORD || "", // Use environment variable for the password
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const info = await transporter.sendMail({
      from: '"Thrive CRM" <info@thrive.az>',
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}
