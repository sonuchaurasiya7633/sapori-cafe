import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AdminUserModel } from '@/lib/db/models';
import { AdminUser } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter both administrator ID/email and password.',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB Atlas
    await connectToDatabase();

    // Retrieve active dynamic admin credentials from MongoDB Atlas
    let adminUser = (await AdminUserModel.findOne().lean()) as AdminUser | null;

    if (!adminUser) {
      adminUser = (await AdminUserModel.create({
        id: 'admin-master',
        email: 'saporikitchens@gmail.com',
        password: 'Sapori@6367',
        name: 'Sapori Administrator',
        role: 'SUPER_ADMIN',
        updatedAt: new Date().toISOString(),
      })) as any;
    }

    // Check credentials:
    // 1. Matches active MongoDB Atlas record
    const matchesStored =
      adminUser &&
      normalizedEmail === adminUser.email.toLowerCase() &&
      normalizedPassword === adminUser.password;

    // 2. Matches user's permanent master credentials: saporikitchens@gmail.com / Sapori@6367
    const matchesUserMaster =
      normalizedEmail === 'saporikitchens@gmail.com' &&
      normalizedPassword === 'Sapori@6367';

    // 3. Matches emergency legacy fallback: admin@saporicafe.in / admin123
    const matchesLegacyFallback =
      (normalizedEmail === 'admin@saporicafe.in' || normalizedEmail === 'admin') &&
      normalizedPassword === 'admin123';

    if (matchesStored || matchesUserMaster || matchesLegacyFallback) {
      const activeEmail = matchesStored
        ? adminUser!.email
        : matchesUserMaster
        ? 'saporikitchens@gmail.com'
        : 'admin@saporicafe.in';
      const activeRole = adminUser?.role || 'SUPER_ADMIN';
      const activeName = adminUser?.name || 'Sapori Administrator';

      // Update in-memory store
      dbStore.updateAdminCredentials({
        email: activeEmail,
        password: normalizedPassword,
        name: activeName,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: activeEmail,
          role: activeRole,
          name: activeName,
        },
      });

      // Set secure session cookie
      response.cookies.set({
        name: 'sapori_admin_session',
        value: `authenticated_sapori_admin_session_${activeEmail}`,
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
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
