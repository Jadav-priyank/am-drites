import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ShippingSetting from '@/models/ShippingSetting';

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await ShippingSetting.findOne({ key: 'default_shipping_rules' });
    if (!settings) {
      settings = await ShippingSetting.create({
        key: 'default_shipping_rules',
        freeShippingThreshold: 499,
        percentageCharge: 10,
        minShippingCharge: 50,
        isEnabled: true,
      });
    }

    return NextResponse.json({ success: true, settings }, { status: 200 });
  } catch (error) {
    console.error('Fetch Store Shipping Settings Error:', error);
    return NextResponse.json(
      {
        success: false,
        settings: {
          freeShippingThreshold: 499,
          percentageCharge: 10,
          minShippingCharge: 50,
          isEnabled: true,
        },
      },
      { status: 200 }
    );
  }
}
