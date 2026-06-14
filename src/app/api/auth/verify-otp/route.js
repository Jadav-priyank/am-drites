import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';

const MAX_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    await connectToDatabase();

    // Find pending OTP record
    const record = await Otp.findOne({ email: email.toLowerCase().trim() });

    if (!record) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 });
    }

    // Check expiry (belt-and-suspenders alongside TTL)
    if (new Date() > record.expiresAt) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    // Verify OTP
    if (record.otp !== otp.toString().trim()) {
      await Otp.findByIdAndUpdate(record._id, { $inc: { attempts: 1 } });
      const remaining = MAX_ATTEMPTS - (record.attempts + 1);
      return NextResponse.json({
        error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      }, { status: 400 });
    }

    // OTP correct — check one more time that user doesn't already exist
    // (race condition guard)
    const existingUser = await User.findOne({ email: record.email });
    if (existingUser) {
      await Otp.deleteOne({ _id: record._id });
      return NextResponse.json({ error: 'Account already exists. Please log in.' }, { status: 409 });
    }

    // Create the user
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: record.hashedPassword,
    });

    // Clean up OTP record
    await Otp.deleteOne({ _id: record._id });

    // Issue JWT
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'am-drites-super-secret-key',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    }, { status: 201 });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
