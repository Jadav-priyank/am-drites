import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    await connectToDatabase();

    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: userId });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    
    const { items, totalAmount, paymentMethod, shippingAddress } = await request.json();
    
    if (!items || !items.length || totalAmount === undefined || !paymentMethod || !shippingAddress) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }
    
    await connectToDatabase();
    
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : 'Paid';
    const status = paymentMethod === 'COD' ? 'Pending' : 'Processing';

    const order = await Order.create({
      user: decoded.userId,
      items,
      totalAmount,
      status,
      paymentMethod,
      paymentStatus,
      shippingAddress
    });
    
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
