import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { Coupon } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    if (code) {
      const coupon = dbStore.getCouponByCode(code);
      if (!coupon) {
        return NextResponse.json({ success: false, error: 'Promo code not found or inactive' }, { status: 404 });
      }
      return NextResponse.json({ success: true, coupon });
    }

    const coupons = dbStore.getCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 });
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

    const created = dbStore.createCoupon(newCoupon);
    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 });
  }
}
