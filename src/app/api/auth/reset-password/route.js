import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import PasswordResetOtp from '@/models/PasswordResetOtp';
import { applyRateLimit } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const rateLimitResponse = applyRateLimit(request, { max: 10, windowMs: 15 * 60 * 1000, prefix: 'reset-password' });
    if (rateLimitResponse) return rateLimitResponse;

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await connectToDatabase();

    // Find pending reset OTP record
    const record = await PasswordResetOtp.findOne({ email: email.toLowerCase().trim() });

    if (!record) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await PasswordResetOtp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      await PasswordResetOtp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    // Verify OTP
    if (record.otp !== otp.toString().trim()) {
      await PasswordResetOtp.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json({
        error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      }, { status: 400 });
    }

    // OTP correct — find user and update password
    const user = await User.findOne({ email: record.email }).select('+password');
    if (!user) {
      await PasswordResetOtp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Clean up OTP record
    await PasswordResetOtp.deleteOne({ _id: record._id });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
