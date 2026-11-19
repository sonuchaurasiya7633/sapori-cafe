import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const admin = dbStore.getAdminUser();
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newEmail, newPassword, newName } = body;

    const currentAdmin = dbStore.getAdminUser();

    // 1. Verify Current Password
    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password is required to make security changes.' },
        { status: 400 }
      );
    }

    if (currentPassword.trim() !== currentAdmin.password) {
      return NextResponse.json(
        { success: false, error: 'Current password does not match. Please verify and try again.' },
        { status: 401 }
      );
    }

    // 2. Validate New Email (if provided)
    if (newEmail !== undefined && !newEmail.trim()) {
      return NextResponse.json(
        { success: false, error: 'Admin email or ID cannot be empty.' },
        { status: 400 }
      );
    }

    // 3. Validate New Password (if provided)
    if (newPassword !== undefined && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }
    }

    // 4. Update in-memory and local store
    const updated = dbStore.updateAdminCredentials({
      email: newEmail ? newEmail.trim() : undefined,
      password: newPassword && newPassword.trim() ? newPassword.trim() : undefined,
      name: newName ? newName.trim() : undefined,
    });

    // 5. Asynchronously synchronize with MongoDB Atlas
    import('@/lib/db/models').then(({ AdminUserModel }) => {
      AdminUserModel.findOneAndUpdate(
        { id: updated.id },
        {
          id: updated.id,
          email: updated.email,
          password: updated.password,
          name: updated.name,
          role: updated.role,
          updatedAt: updated.updatedAt,
        },
        { upsert: true }
      ).catch((err) => console.warn('MongoDB AdminUser sync warning:', err.message));
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin ID & password updated successfully!',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        updatedAt: updated.updatedAt,
      },
    });

    // Refresh secure session cookie with updated identity
    response.cookies.set({
      name: 'sapori_admin_session',
      value: `authenticated_sapori_admin_session_${updated.email}_${Date.now()}`,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Update credentials error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update admin credentials' },
      { status: 500 }
    );
  }
}
