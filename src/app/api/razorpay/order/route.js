import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify token to ensure only logged in users can create orders
    jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    
    const { totalAmount } = await request.json();
    
    if (!totalAmount || totalAmount * 100 < 100) {
      return NextResponse.json({ error: 'Invalid amount. Minimum amount must be 1 INR (100 paise)' }, { status: 400 });
    }
    
    // Initialize razorpay instance
    // Note: User must replace these placeholders in .env.local with real Test API Keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
    });
    
    const options = {
      amount: totalAmount * 100, // Razorpay works in minimum currency subunits (paise)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
