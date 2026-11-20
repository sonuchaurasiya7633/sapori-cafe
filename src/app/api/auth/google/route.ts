import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AdminUserModel, AuditLogModel, CustomerUserModel } from '@/lib/db/models';
import { AdminUser } from '@/types';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { email, name, uid, photoURL } = await request.json();

    if (!email || !uid) {
      return NextResponse.json({ success: false, error: 'Email and UID required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    await connectToDatabase();

    // Check if this email is the administrator in AdminUserModel
    const adminUser = (await AdminUserModel.findOne({
      email: normalizedEmail,
    }).lean()) as AdminUser | null;

    if (adminUser) {
      // Issue secure admin JWT token
      const secret = process.env.AUTH_SECRET || 'sapori_secure_jwt_secret_key_prod_2026';
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name || name,
          role: adminUser.role || 'SUPER_ADMIN',
          loginMethod: 'google',
        },
        secret,
        { expiresIn: '7d' }
      );

      // Audit Log
      await AuditLogModel.create({
        action: 'ADMIN_GOOGLE_LOGIN',
        actor: normalizedEmail,
        details: { uid, name, ip: request.headers.get('x-forwarded-for') || '127.0.0.1' },
      });

      const response = NextResponse.json({
        success: true,
        isAdmin: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
      });

      // Set HttpOnly secure session cookie
      response.cookies.set('sapori_admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // Otherwise, sync as a customer user
    const customer = await CustomerUserModel.findOneAndUpdate(
      { uid },
      {
        $set: {
          name: name || 'Customer',
          email: normalizedEmail,
          avatarUrl: photoURL,
          authProvider: 'google',
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      isAdmin: false,
      customer,
    });
  } catch (error) {
    console.error('Google Auth API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process Google login' }, { status: 500 });
  }
}
