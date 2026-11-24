const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  await transporter.sendMail({
    from: `"Nexus News" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your Nexus News account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1E1E1E; border: 1px solid #eee; padding: 24px;">
        <h2 style="margin: 0 0 12px;">
          NEXUS <span style="color: #D04A33;">NEWS</span>
        </h2>
        <p style="font-size: 15px; font-weight: bold; margin-bottom: 8px;">
          Hi ${name}, welcome aboard!
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #444;">
          Please verify your email address to activate your Nexus News account, bookmark stories, and join discussions.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #D04A33; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px;"
        >
          Verify My Email
        </a>
        <p style="font-size: 12px; color: #777; margin-top: 16px;">
          Or copy and paste this link into your browser:<br />
          <a href="${verifyUrl}" style="color: #D04A33; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="font-size: 11px; color: #999; margin-top: 16px;">
          This verification link expires in 24 hours.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
