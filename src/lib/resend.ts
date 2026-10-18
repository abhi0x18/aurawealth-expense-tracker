import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || "PaisaPilot <onboarding@resend.dev>";

export interface SendOtpResult {
  success: boolean;
  simulated: boolean;
  message: string;
  devOtp?: string;
}

/**
 * Sends a 6-digit verification OTP to the user's email using Resend (Free Tier).
 * If RESEND_API_KEY is not configured or in development, logs the OTP to server console
 * and provides simulated delivery so local development works seamlessly.
 */
export async function sendOtpEmail(email: string, otp: string, userName?: string): Promise<SendOtpResult> {
  const greeting = userName ? `Hello ${userName},` : "Hello,";
  
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

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `${otp} is your PaisaPilot verification code`,
        html: htmlContent,
      });

      if (response.error) {
        console.error("[Resend Error]:", response.error);
        // Fallback to simulated delivery in dev if domain or API key has issue
        console.log(`\n===================================================`);
        console.log(`  [PaisaPilot Fallback Dev OTP for ${email}]`);
        console.log(`  OTP Code: ${otp}`);
        console.log(`===================================================\n`);
        return {
          success: true,
          simulated: true,
          message: `Resend free tier notice: ${response.error.message}. (In dev mode, OTP is logged to console)`,
          devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
        };
      }

      console.log(`[Resend OTP Sent] Successfully dispatched email to ${email}`);
      return {
        success: true,
        simulated: false,
        message: `Verification code sent to ${email}`,
      };
    } catch (err: any) {
      console.error("[Resend Exception]:", err);
      return {
        success: true,
        simulated: true,
        message: "Email sending simulated (dev fallback)",
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      };
    }
  } else {
    // Development / No API key provided yet: simulate delivery gracefully
    console.log(`\n===================================================`);
    console.log(`  [PaisaPilot OTP Service - Development Mode]`);
    console.log(`  To: ${email}`);
    console.log(`  OTP Code: ${otp}`);
    console.log(`  Valid for: 10 minutes`);
    console.log(`  (To send real emails for free, add RESEND_API_KEY to your .env file)`);
    console.log(`===================================================\n`);

    return {
      success: true,
      simulated: true,
      message: `OTP generated for ${email}. (In local dev mode, OTP is logged to console)`,
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    };
  }
}
