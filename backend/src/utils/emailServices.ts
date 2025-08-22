// import { Resend } from "resend";

// // Make 'from' required for more explicit control
// export interface EmailData {
//   from: string; // ALWAYS required (must be user or system email)
//   to: string | string[]; // Who receives your email (can be admin/support/other)
//   subject: string;
//   html?: string;
//   text?: string;
//   cc?: string[];
//   bcc?: string[];
//   attachments?: any[];
// }

// export class EmailService {
//   private resend: Resend;

//   constructor() {
//     this.resend = new Resend(process.env.RESEND_API_KEY);
//   }

//   // Validate that 'from' and 'to' are provided and correct
//   private validate(emailData: EmailData) {
//     if (!emailData.from || typeof emailData.from !== "string") {
//       throw new Error("Sender email ('from') is required.");
//     }
//     if (
//       !emailData.to ||
//       (typeof emailData.to !== "string" && !Array.isArray(emailData.to))
//     ) {
//       throw new Error("Receiver email ('to') is required.");
//     }
//     // Optionally, you can add email format regex validation here.
//   }

//   async sendEmail(emailData: EmailData) {
//     this.validate(emailData);

//     try {
//       const { data, error } = await this.resend.emails.send({
//         from: "onboarding@resend.dev",
//         // from: emailData.from,
//         to: process.env.ADMIN_EMAIL || "admin@yourdomain.com",
//         subject: emailData.subject,
//         html: emailData.html || "",
//         text: emailData.text || "",
//         cc: emailData.cc || undefined,
//         bcc: emailData.bcc || undefined,
//         attachments: emailData.attachments || undefined,
//       });

//       if (error) {
//         console.error("❌ Email send error:", error);
//         throw new Error(`Email failed: ${error.message}`);
//       }

//       console.log("✅ Email sent successfully:", data?.id);
//       return { success: true, id: data?.id };
//     } catch (error: any) {
//       console.error("❌ Email service error:", error);
//       throw error;
//     }
//   }
// }

// // Export ready-to-use instance
// export const emailService = new EmailService();

import { Resend } from "resend";

export interface EmailData {
  from: string;
  to: string | string[];
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
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  private validate(emailData: EmailData) {
    if (!emailData.from || typeof emailData.from !== "string") {
      throw new Error("Sender email ('from') is required.");
    }
    if (
      !emailData.to ||
      (typeof emailData.to !== "string" && !Array.isArray(emailData.to))
    ) {
      throw new Error("Receiver email ('to') is required.");
    }
  }

  async sendEmail(emailData: EmailData) {
    this.validate(emailData);

    try {
      const { data, error } = await this.resend.emails.send({
        from: "onboarding@resend.dev",
        to: emailData.to, // ✅ Use actual recipient email, not hardcoded ADMIN_EMAIL
        subject: emailData.subject,
        html: emailData.html || "",
        text: emailData.text || "",
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        attachments: emailData.attachments || undefined,
      });

      if (error) {
        console.error("❌ Email send error:", error);
        throw new Error(`Email failed: ${error.message}`);
      }

      console.log("✅ Email sent successfully:", data?.id);
      return { success: true, id: data?.id };
    } catch (error: any) {
      console.error("❌ Email service error:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
