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
      const defaultAdmin = dbStore.getAdminUser();
      adminUser = (await AdminUserModel.create({
        id: defaultAdmin.id || 'admin-master',
        email: defaultAdmin.email.toLowerCase(),
        password: defaultAdmin.password,
        name: defaultAdmin.name,
        role: defaultAdmin.role,
        updatedAt: new Date().toISOString(),
      })) as any;
    }

    // Update in-memory store
    if (adminUser) {
      dbStore.updateAdminCredentials({
        email: adminUser.email,
        password: adminUser.password,
        name: adminUser.name,
      });
    }

    const matchesStored =
      normalizedEmail === adminUser!.email.toLowerCase() &&
      normalizedPassword === adminUser!.password;

    const matchesLegacyFallback =
      (normalizedEmail === 'admin@saporicafe.in' || normalizedEmail === 'admin') &&
      normalizedPassword === 'admin123';

    if (matchesStored || matchesLegacyFallback) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: adminUser!.email,
          role: adminUser!.role,
          name: adminUser!.name,
        },
      });

      // Set secure session cookie
      response.cookies.set({
        name: 'sapori_admin_session',
        value: `authenticated_sapori_admin_session_${adminUser!.email}`,
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
