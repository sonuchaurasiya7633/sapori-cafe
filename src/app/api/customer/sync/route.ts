import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CustomerUserModel, OrderModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, email, phone, avatarUrl, authProvider = 'google', savedAddress } = body;

    if (!uid) {
      return NextResponse.json({ success: false, error: 'User UID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Calculate customer order count
    const matchConditions: any[] = [];
    if (phone) matchConditions.push({ 'customer.phone': phone });
    if (email) matchConditions.push({ 'customer.email': email.toLowerCase() });

    let totalOrdersCount = 0;
    if (matchConditions.length > 0) {
      totalOrdersCount = await OrderModel.countDocuments({ $or: matchConditions });
    }

    // Upsert customer profile
    const updateData: any = {
      name: name || (phone ? `Guest ${phone.slice(-4)}` : 'Valued Guest'),
      updatedAt: new Date().toISOString(),
      totalOrdersCount,
    };
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (authProvider) updateData.authProvider = authProvider;
    if (savedAddress) updateData.savedAddress = savedAddress;

    const customer = await CustomerUserModel.findOneAndUpdate(
      { uid },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const { _id, __v, ...cleanCustomer } = customer as any;

    return NextResponse.json(
      {
        success: true,
        customer: cleanCustomer,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('Customer sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync customer profile' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
