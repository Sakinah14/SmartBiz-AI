const { Resend } = require("resend");

let resendClient = null;

function getClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Resend's shared sandbox sender. It works immediately with any Resend API key
// and requires no domain setup, but in sandbox mode Resend will only deliver
// to the email address you signed up to Resend with — see the report for
// how to verify your own domain and send to real users.
const FROM_ADDRESS = "SmartBiz AI <onboarding@resend.dev>";

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const { error } = await getClient().emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Reset your SmartBiz AI password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #4f46e5;">Reset your password</h2>
        <p>We received a request to reset the password for your SmartBiz AI account.</p>
        <p>This link is valid for 15 minutes and can only be used once.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p>If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message || "Failed to send password reset email via Resend");
  }
};

module.exports = { sendPasswordResetEmail };
