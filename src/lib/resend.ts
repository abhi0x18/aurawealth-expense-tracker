import { Resend } from "resend";
import nodemailer from "nodemailer";

export interface SendOtpResult {
  success: boolean;
  simulated: boolean;
  message: string;
  devOtp?: string;
  resendId?: string;
  provider?: "gmail" | "resend" | "simulated";
}

/**
 * Returns an instantiated Nodemailer Gmail transporter if SMTP_USER and SMTP_PASS are set.
 * This is the easiest way to send real emails to ANY address without owning a domain.
 */
function getSmtpTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass || user.trim() === "" || pass.trim() === "") return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ""), // removes spaces in Google App Password
    },
  });
}

/**
 * Returns an instantiated Resend client if RESEND_API_KEY is configured.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new Resend(apiKey.trim());
}

/**
 * Sends a 6-digit verification OTP to the user's email.
 * Prioritizes Gmail SMTP (can send to anyone without a domain), then Resend, then Dev simulation.
 */
export async function sendOtpEmail(email: string, otp: string, userName?: string): Promise<SendOtpResult> {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "PaisaPilot <onboarding@resend.dev>";
  
  // HTML Template for OTP Email
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
          .logo { font-size: 22px; font-weight: 700; color: #10b981; margin-bottom: 24px; display: flex; align-items: center; }
          .title { font-size: 20px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
          .text { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #0f172a; border: 2px dashed #10b981; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #34d399; font-family: monospace; }
          .footer { color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">✦ PaisaPilot</div>
          <div class="title">Your One-Time Login Code</div>
          <p class="text">${greeting}</p>
          <p class="text">Use the 6-digit verification code below to access your PaisaPilot Personal Finance account. This code is valid for 10 minutes.</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <p class="text">If you did not request this code, you can safely ignore this email. Never share this code with anyone.</p>
          
          <div class="footer">
            PaisaPilot — Personal Finance Manager &bull; Local-First &amp; Secure
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Try Gmail SMTP first if configured (sends to ANY email address)
  const smtp = getSmtpTransporter();
  if (smtp) {
    try {
      await smtp.sendMail({
        from: `"PaisaPilot" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${otp} is your PaisaPilot verification code`,
        html: htmlContent,
      });

      console.log(`[Gmail SMTP Sent] Successfully dispatched email to ${email}`);
      return {
        success: true,
        simulated: false,
        message: `Verification code sent to ${email}`,
        provider: "gmail",
      };
    } catch (smtpErr: any) {
      console.warn("[Gmail SMTP Warning]:", smtpErr.message);
    }
  }

  // 2. Try Resend if configured
  const resend = getResendClient();
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${otp} is your PaisaPilot verification code`,
        html: htmlContent,
      });

      if (response.error) {
        console.warn("[Resend Warning]:", response.error);
        console.log(`\n===================================================`);
        console.log(`  [PaisaPilot Fallback Dev OTP for ${email}]`);
        console.log(`  OTP Code: ${otp}`);
        console.log(`  Notice: ${response.error.message}`);
        console.log(`===================================================\n`);

        return {
          success: true,
          simulated: true,
          message: `Notice: ${response.error.message}`,
          devOtp: otp,
          provider: "simulated",
        };
      }

      console.log(`[Resend OTP Sent] Dispatched email to ${email} (ID: ${response.data?.id})`);
      return {
        success: true,
        simulated: false,
        message: `Verification code sent to ${email}`,
        resendId: response.data?.id,
        provider: "resend",
      };
    } catch (err: any) {
      console.error("[Resend Exception]:", err);
    }
  }

  // 3. Fallback: Log to console in development
  console.log(`\n===================================================`);
  console.log(`  [PaisaPilot OTP Service - Development Mode]`);
  console.log(`  To: ${email}`);
  console.log(`  OTP Code: ${otp}`);
  console.log(`  Valid for: 10 minutes`);
  console.log(`===================================================\n`);

  return {
    success: true,
    simulated: true,
    message: `OTP generated for ${email}. (Logged to server console in dev mode)`,
    devOtp: otp,
    provider: "simulated",
  };
}
