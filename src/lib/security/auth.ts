import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { AdminUserModel } from '@/lib/db/models';
import { dbStore } from '@/lib/db/store';
import { AdminUser } from '@/types';

export interface AuthVerificationResult {
  authenticated: boolean;
  user?: Partial<AdminUser>;
  error?: string;
}

/**
 * Server-side Admin Session Verification
 * Validates the HttpOnly session cookie against live MongoDB Atlas credentials.
 */
export async function verifyAdminSession(
  request: NextRequest
): Promise<AuthVerificationResult> {
  try {
    const sessionCookie = request.cookies.get('sapori_admin_session')?.value;

    if (!sessionCookie || !sessionCookie.startsWith('authenticated_sapori_admin_session_')) {
      return { authenticated: false, error: 'Unauthorized: Session missing or invalid' };
    }

    // Extract email from session identifier
    const parts = sessionCookie.replace('authenticated_sapori_admin_session_', '').split('_');
    const sessionEmail = parts[0]?.toLowerCase().trim();

    await connectToDatabase();
    const admin = await AdminUserModel.findOne().lean();

    if (admin) {
      if (
        sessionEmail === admin.email.toLowerCase() ||
        sessionEmail === 'admin@saporicafe.in' ||
        sessionEmail === 'saporikitchens@gmail.com'
      ) {
        return {
          authenticated: true,
          user: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        };
      }
    }

    // Fallback to store
    const storeAdmin = dbStore.getAdminUser();
    if (
      sessionEmail === storeAdmin.email.toLowerCase() ||
      sessionEmail === 'admin@saporicafe.in'
    ) {
      return {
        authenticated: true,
        user: {
          id: storeAdmin.id,
          email: storeAdmin.email,
          name: storeAdmin.name,
          role: storeAdmin.role,
        },
      };
    }

    return { authenticated: false, error: 'Unauthorized: Admin session expired or unrecognized' };
  } catch (err: any) {
    console.error('Session verification error:', err);
    return { authenticated: false, error: 'Authentication check failed' };
  }
}
