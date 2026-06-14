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

    // Verify token to ensure user is logged in
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    const userId = decoded.userId;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const cartTotalStr = searchParams.get('cartTotal');

    if (!code) {
      return NextResponse.json({ error: 'Missing promo code' }, { status: 400 });
    }

    const cartTotal = cartTotalStr ? Number(cartTotalStr) : 0;

    await connectToDatabase();

    const uppercaseCode = code.trim().toUpperCase();

    // Find the coupon in DB
    const coupon = await Coupon.findOne({ code: uppercaseCode, isActive: true });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired promo code.' }, { status: 400 });
    }

    if (coupon.isFirstOrderOnly) {
      const ordersCount = await Order.countDocuments({ user: userId });
      if (ordersCount > 0) {
        return NextResponse.json({ 
          error: "This promo code is only available for your first order." 
        }, { status: 400 });
      }
    }

    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount of ₹${coupon.minOrderAmount} is required for this code.` 
      }, { status: 400 });
    }

    let calculatedDiscount = coupon.discount;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round((cartTotal * coupon.discount) / 100);
      if (coupon.maxDiscountLimit > 0) {
        calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscountLimit);
      }
    }

    // Ensure calculated discount is not negative and doesn't exceed cart total
    calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, cartTotal));

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount: calculatedDiscount,
      minOrderAmount: coupon.minOrderAmount,
      discountType: coupon.discountType || 'flat',
      couponDiscountValue: coupon.discount,
      maxDiscountLimit: coupon.maxDiscountLimit || 0
    }, { status: 200 });
  } catch (error) {
    console.error('Validate Coupon Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
