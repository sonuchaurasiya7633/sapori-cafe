import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = request.cookies.get('sapori_admin_session')?.value;

  if (session && session.includes('authenticated_sapori_admin_session')) {
    return NextResponse.json({
      authenticated: true,
      user: {
        email: 'admin@saporicafe.in',
        role: 'SUPER_ADMIN',
        name: 'Sapori Manager',
      },
    });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
