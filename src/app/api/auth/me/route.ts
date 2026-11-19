import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AdminUserModel } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const session = request.cookies.get('sapori_admin_session')?.value;

  if (session && session.includes('authenticated_sapori_admin_session')) {
    try {
      await connectToDatabase();
      const admin = await AdminUserModel.findOne().lean();
      if (admin) {
        return NextResponse.json({
          authenticated: true,
          user: {
            email: admin.email,
            role: admin.role,
            name: admin.name,
          },
        });
      }
    } catch (e) {
      // fallback
    }

    const fallbackAdmin = dbStore.getAdminUser();
    return NextResponse.json({
      authenticated: true,
      user: {
        email: fallbackAdmin.email,
        role: fallbackAdmin.role,
        name: fallbackAdmin.name,
      },
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
