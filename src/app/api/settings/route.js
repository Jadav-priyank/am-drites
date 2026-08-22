import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const settings = await Setting.findOne();

    return NextResponse.json(
      {
        success: true,
        settings: {
          codEnabled: settings?.codEnabled ?? true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Public Settings Error:", error);
    return NextResponse.json(
      {
        success: true,
        settings: {
          codEnabled: true,
        },
      },
      { status: 200 }
    );
  }
}
