import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { Coupon } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CouponModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    await connectToDatabase();

    if (code) {
      const dbCoupon = await CouponModel.findOne({ code: code.toUpperCase().trim() }).lean();
      if (dbCoupon) {
        const { _id, __v, ...clean } = dbCoupon as any;
        return NextResponse.json({ success: true, coupon: clean }, { headers: NO_CACHE_HEADERS });
      }
      const coupon = dbStore.getCouponByCode(code);
      if (!coupon) {
        return NextResponse.json({ success: false, error: 'Promo code not found or inactive' }, { status: 404 });
      }
      return NextResponse.json({ success: true, coupon }, { headers: NO_CACHE_HEADERS });
    }

    const dbCoupons = await CouponModel.find().lean();
    if (dbCoupons && dbCoupons.length > 0) {
      const cleanCoupons = dbCoupons.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, coupons: cleanCoupons }, { headers: NO_CACHE_HEADERS });
    }

    const coupons = dbStore.getCoupons();
    return NextResponse.json({ success: true, coupons }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const coupons = dbStore.getCoupons();
    return NextResponse.json({ success: true, coupons }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.code || !body.discountValue) {
      return NextResponse.json({ success: false, error: 'Code and discount value required' }, { status: 400 });
    }

    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: body.code.toUpperCase().trim(),
      discountType: body.discountType || 'percentage',
      discountValue: Number(body.discountValue),
      minOrderValue: Number(body.minOrderValue) || 0,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      isActive: body.isActive ?? true,
      description: body.description?.trim() || '',
    };

    await connectToDatabase();
    await CouponModel.findOneAndUpdate({ id: newCoupon.id }, newCoupon, { upsert: true, new: true });
    const created = dbStore.createCoupon(newCoupon);

    return NextResponse.json({ success: true, coupon: created }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}
