import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('sapori_admin_session')?.value;

  if (session && session.includes('authenticated_sapori_admin_session')) {
    const admin = dbStore.getAdminUser();
    return NextResponse.json({
      authenticated: true,
      user: {
        email: admin.email,
        role: admin.role,
        name: admin.name,
      },
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
