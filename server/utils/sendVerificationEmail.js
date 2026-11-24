const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
  const senderName = process.env.BREVO_SENDER_NAME || 'Nexus News';

  if (!apiKey) {
    throw new Error('Missing BREVO_API_KEY in environment variables.');
  }

  if (!senderEmail) {
    throw new Error(
      'Missing BREVO_SENDER_EMAIL (or EMAIL_USER) in environment variables.',
    );
  }

  const htmlContent = `
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
  `;

  const textContent = `Hi ${name}, welcome aboard!\n\nPlease verify your Nexus News account by visiting this link:\n${verifyUrl}\n\nThis verification link expires in 24 hours.`;

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [
        {
          email: to,
          name,
        },
      ],
      subject: 'Verify your Nexus News account',
      htmlContent,
      textContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Brevo API failed (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  return response.json();
};

module.exports = { sendVerificationEmail };
