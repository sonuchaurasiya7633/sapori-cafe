import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    // Retrieve active dynamic admin credentials
    const adminUser = dbStore.getAdminUser();

    const matchesStored =
      normalizedEmail === adminUser.email.toLowerCase() && normalizedPassword === adminUser.password;
    const matchesLegacyFallback =
      (normalizedEmail === 'admin@saporicafe.in' || normalizedEmail === 'admin') &&
      normalizedPassword === (adminUser.password || 'admin123');

    if (matchesStored || matchesLegacyFallback) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name,
        },
      });

      // Set secure session cookie
      response.cookies.set({
        name: 'sapori_admin_session',
        value: `authenticated_sapori_admin_session_${adminUser.email}`,
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
        error: 'Invalid credentials. Please verify your administrator ID/email and password.',
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
