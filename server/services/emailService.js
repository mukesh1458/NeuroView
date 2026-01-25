import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Transporter (Using Gmail for simplicity, requires App Password)
// Ideally, use SendGrid/Resend in production
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getWelcomeTemplate = (username) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #09090b; color: #e4e4e7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(to right, #06b6d4, #3b82f6); padding: 30px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: white; letter-spacing: -1px; text-transform: uppercase; }
    .content { padding: 40px; }
    h1 { font-size: 20px; margin-bottom: 20px; color: white; }
    p { font-size: 16px; line-height: 1.6; color: #a1a1aa; margin-bottom: 20px; }
    .btn { display: inline-block; background: white; color: black; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; background: #09090b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">NeuroView</div>
      </div>
      <div class="content">
        <h1>Welcome to the Future, ${username}! 🚀</h1>
        <p>You've successfully unlocked your creative potential. We're thrilled to have you join our community of visionaries.</p>
        <p>With NeuroView, you can:</p>
        <ul style="color: #a1a1aa; padding-left: 20px; margin-bottom: 30px;">
          <li>Generate stunning AI art</li>
          <li>Curate your own gallery</li>
          <li>Join the prompt battles</li>
        </ul>
        <p>Ready to create your first masterpiece?</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Start Creating</a>
      </div>
      <div class="footer">
        &copy; 2026 NeuroView AI. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (to, username) => {
  try {
    const info = await transporter.sendMail({
      from: `"NeuroView AI" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Welcome to NeuroView! 🚀",
      html: getWelcomeTemplate(username),
    });
    console.log("Welcome email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ SMTP Error: Credentials invalid or network issue.");
    console.log("-----------------------------------------");
    console.log("📧 [DEV MODE] Email Preview for:", to);
    console.log("Subject:", "Welcome to NeuroView! 🚀");
    // console.log("Content:", getWelcomeTemplate(username)); // Uncomment to see full HTML
    console.log("-----------------------------------------");
    return false;
  }
};
