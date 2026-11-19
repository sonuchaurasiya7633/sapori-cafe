import { NextRequest, NextResponse } from 'next/server';
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

    // Connect to MongoDB Atlas (Single Source of Truth)
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

    // Strict authentication against current credentials in MongoDB Atlas
    const matchesStored =
      adminUser &&
      (normalizedEmail === adminUser.email.toLowerCase() ||
        normalizedEmail === 'admin@saporicafe.in' ||
        normalizedEmail === 'admin') &&
      normalizedPassword === adminUser.password;

    if (matchesStored) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: {
          email: adminUser!.email,
          role: adminUser!.role || 'SUPER_ADMIN',
          name: adminUser!.name || 'Sapori Administrator',
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
