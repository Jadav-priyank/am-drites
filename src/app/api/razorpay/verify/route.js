import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required payment/shipping fields' }, { status: 400 });
    }
    
    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder';
    
    // Create signature to verify
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
      
    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }
    
    // Verification successful, create the order in DB
    await connectToDatabase();
    
    const order = await Order.create({
      user: decoded.userId,
      items,
      totalAmount,
      status: 'Processing',
      paymentMethod,
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      shippingAddress
    });

    // Send order confirmation receipt email
    const user = await User.findById(decoded.userId);
    const userEmail = user?.email || decoded.email;
    const userName = user?.name || shippingAddress.name;
    if (userEmail) {
      sendOrderConfirmationEmail(order, userEmail, userName).catch(err => console.error("Confirmation email error:", err));
    }
    
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
