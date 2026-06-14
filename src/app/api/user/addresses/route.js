import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

function getUserId(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'am-drites-super-secret-key');
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// POST: Add new address
export async function POST(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, addressLine1, addressLine2, city, state, pinCode, isDefault } = await request.json();

    if (!name || !phone || !addressLine1 || !city || !state || !pinCode) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set other addresses to not default if this is default
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default automatically
    const isFirstAddress = user.addresses.length === 0;

    user.addresses.push({
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pinCode,
      isDefault: isFirstAddress ? true : !!isDefault
    });

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses }, { status: 201 });
  } catch (error) {
    console.error('Add Address Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update address or set default
export async function PUT(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { addressId, name, phone, addressLine1, addressLine2, city, state, pinCode, isDefault } = await request.json();

    if (!addressId) {
      return NextResponse.json({ error: 'Missing address ID' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting to default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update fields
    if (name !== undefined) address.name = name;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pinCode !== undefined) address.pinCode = pinCode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses }, { status: 200 });
  } catch (error) {
    console.error('Update Address Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove address
export async function DELETE(request) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ error: 'Missing address ID' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and there are remaining addresses, set the first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return NextResponse.json({ success: true, addresses: user.addresses }, { status: 200 });
  } catch (error) {
    console.error('Delete Address Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
