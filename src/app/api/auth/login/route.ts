import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    // Default admin credentials
    const DEFAULT_ADMIN_EMAIL = 'admin@saporicafe.in';
    const DEFAULT_ADMIN_PASSWORD = 'admin123';

    if (
      (normalizedEmail === DEFAULT_ADMIN_EMAIL && normalizedPassword === DEFAULT_ADMIN_PASSWORD) ||
      (normalizedEmail === 'admin' && normalizedPassword === 'admin123')
    ) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: DEFAULT_ADMIN_EMAIL,
          role: 'SUPER_ADMIN',
          name: 'Sapori Manager',
        },
      });

      // Set secure session cookie
      response.cookies.set({
        name: 'sapori_admin_session',
        value: 'authenticated_sapori_admin_session_token_2026',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid credentials. Default: admin@saporicafe.in / admin123',
      },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
