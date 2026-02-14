import { Resend } from "resend";

export interface EmailData {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
}

export class EmailService {
  private resend: Resend;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing in environment variables");
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private validate(emailData: EmailData) {
    if (!emailData.from || typeof emailData.from !== "string") {
      throw new Error("Sender email ('from') is required.");
    }

    if (!emailData.to || typeof emailData.to !== "string") {
      throw new Error("Receiver email must be a valid string.");
    }

    const cleanEmail = emailData.to.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      throw new Error("Invalid email format.");
    }

    emailData.to = cleanEmail;
  }

  async sendEmail(emailData: EmailData) {
    this.validate(emailData);

    try {
      const { data, error } = await this.resend.emails.send({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html || "",
        text: emailData.text || "",
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        attachments: emailData.attachments || undefined,
      });

      if (error) {
        console.error("❌ Resend error:", error);
        throw new Error(error.message);
      }

      return { success: true, id: data?.id };
    } catch (err: any) {
      console.error("❌ Email service failed:", err.message);
      throw new Error(err.message);
    }
  }
}

export const emailService = new EmailService();
