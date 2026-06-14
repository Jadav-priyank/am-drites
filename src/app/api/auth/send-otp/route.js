import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';

// Generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Build nodemailer transporter from env vars
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please provide all fields' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    // Hash password now — store in OTP doc so we don't re-hash on verify
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert: replace any previous pending OTP for this email
    await Otp.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { email: email.toLowerCase().trim(), otp, name: name.trim(), hashedPassword, attempts: 0, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = createTransporter();

      // Build individual digit cells (table-based for email client compat)
      const digitCells = otp.split('').map(d =>
        `<td style="background:#fff7f0 !important;border:2px solid #f97316;border-radius:10px;width:44px;height:52px;text-align:center;vertical-align:middle;">` +
        `<span style="font-size:28px;font-weight:900;color:#f97316 !important;font-family:Arial,sans-serif;display:block;line-height:52px;">${d}</span>` +
        `</td>`
      ).join('<td style="width:6px;"></td>');

      await transporter.sendMail({
        from: `"AM DRIETS" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your AM DRIETS Verification Code',
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <style>
    :root { color-scheme: light only; }
    body { margin:0; padding:0; background:#f5f5f5 !important; }
    @media (prefers-color-scheme: dark) {
      body { background:#f5f5f5 !important; }
      .outer { background:#ffffff !important; }
      .body-cell { background:#ffffff !important; }
      .footer-cell { background:#fdf3eb !important; }
      h1,h2,p,span { color: inherit !important; }
    }
  </style>
</head>
<body style="margin:0;padding:20px 0;background:#f5f5f5 !important;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table class="outer" role="presentation" width="480" cellpadding="0" cellspacing="0" border="0"
             style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ffe0c0;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 24px;text-align:center;">
          <h1 style="color:#ffffff !important;margin:0;font-size:26px;font-weight:900;letter-spacing:-0.5px;">AM DRIETS</h1>
          <p style="color:rgba(255,255,255,0.88) !important;margin:6px 0 0;font-size:13px;">Nature's Goodness, Preserved</p>
        </td></tr>

        <!-- Body -->
        <tr><td class="body-cell" style="background:#ffffff !important;padding:36px 24px 28px;text-align:center;">
          <h2 style="color:#1a1a1a !important;font-size:20px;font-weight:700;margin:0 0 10px;">Verify Your Email</h2>
          <p style="color:#555555 !important;font-size:14px;margin:0 0 26px;line-height:1.65;">
            Hi <strong style="color:#1a1a1a !important;">${name}</strong>, use the code below to complete your signup.<br/>
            This code expires in <strong style="color:#f97316 !important;">10 minutes</strong>.
          </p>

          <!-- OTP digit boxes -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
            <tr>${digitCells}</tr>
          </table>

          <p style="color:#f97316 !important;font-size:12px;font-weight:700;margin:0 0 8px;">⏱ Code expires in 10 minutes</p>
          <p style="color:#aaaaaa !important;font-size:11px;margin:0;">If you didn't request this, please ignore this email.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td class="footer-cell" style="background:#fdf3eb !important;padding:14px 24px;text-align:center;border-top:1px solid #ffe0c0;">
          <p style="color:#cccccc !important;font-size:11px;margin:0;">© ${new Date().getFullYear()} AM DRIETS · India</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `,
      });
    } else {
      // Dev fallback — log OTP to console
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email address.',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
