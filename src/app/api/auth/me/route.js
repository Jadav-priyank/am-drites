import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    
    await connectToDatabase();
    const dbUser = await User.findById(decoded.userId).select('-password');
    
    if (!dbUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ 
      user: { 
        id: dbUser._id, 
        name: dbUser.name, 
        email: dbUser.email,
        addresses: dbUser.addresses || []
      } 
    });
  } catch (error) {
    console.error("Auth Session Check Error:", error);
    return NextResponse.json({ user: null });
  }
}
