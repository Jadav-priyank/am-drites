import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import { sendOrderCancellationEmail, sendOrderConfirmationEmail } from '@/lib/email';

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
    
    // Decrement product inventory in database
    for (const item of items) {
      if (item.id || item._id) {
        await Product.updateOne(
          { $or: [{ id: item.id }, { _id: item._id }] },
          { $inc: { stockQuantity: -(item.quantity || 1) } }
        ).catch(err => console.error("Stock decrement error:", err));
      }
    }

    // Trigger order confirmation email asynchronously
    const user = await User.findById(decoded.userId);
    const userEmail = user?.email || decoded.email;
    const userName = user?.name || shippingAddress.name;
    if (userEmail) {
      sendOrderConfirmationEmail(order, userEmail, userName).catch(err => console.error("Confirmation email error:", err));
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    const userId = decoded.userId;

    const { orderId, action } = await request.json();

    if (!orderId || action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return NextResponse.json({ 
        error: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}` 
      }, { status: 400 });
    }

    order.status = 'Cancelled';
    if (order.paymentStatus === 'Paid') {
      order.paymentStatus = 'Refund Pending';
    }
    await order.save();

    // Trigger cancellation email asynchronously
    const user = await User.findById(userId);
    const userEmail = user?.email || decoded.email;
    const userName = user?.name || order.shippingAddress?.name;
    if (userEmail) {
      sendOrderCancellationEmail(order, userEmail, userName).catch(err => console.error("Cancellation email error:", err));
    }

    return NextResponse.json({ success: true, message: 'Order cancelled successfully', order }, { status: 200 });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

