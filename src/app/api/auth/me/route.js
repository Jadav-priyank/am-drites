import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    return NextResponse.json({ user: { id: decoded.userId, name: decoded.name, email: decoded.email } });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
