import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    
    const { items, totalAmount, paymentMethod } = await request.json();
    
    if (!items || !items.length || totalAmount === undefined || !paymentMethod) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';

    const order = await Order.create({
      user: decoded.userId,
      items,
      totalAmount,
      status: 'Completed', // Order processed successfully
      paymentMethod,
      paymentStatus
    });
    
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
