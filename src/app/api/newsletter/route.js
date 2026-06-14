import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await Subscriber.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed!' }, { status: 200 });
    }

    await Subscriber.create({ email: email.toLowerCase().trim() });

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
