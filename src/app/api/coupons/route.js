import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    const userId = decoded.userId;

    await connectToDatabase();
    
    // Find active coupons sorted by minimum order amount
    const coupons = await Coupon.find({ isActive: true }).sort({ minOrderAmount: 1 });
    
    // Check if the user has any orders
    const ordersCount = await Order.countDocuments({ user: userId });
    const userHasOrders = ordersCount > 0;
    
    return NextResponse.json({ success: true, coupons, userHasOrders }, { status: 200 });
  } catch (error) {
    console.error('Website GET Coupons Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
