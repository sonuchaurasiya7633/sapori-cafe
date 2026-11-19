import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getProfile, PUT as updateProfile } from '../../src/app/api/auth/profile/route';
import { POST as login } from '../../src/app/api/auth/login/route';
import { dbStore } from '../../src/lib/db/store';

describe('Admin ID and Password Management', () => {
  it('retrieves current admin user profile without exposing plain password in response', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/profile');
    const res = await getProfile(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBeDefined();
    expect(data.user.role).toBe('SUPER_ADMIN');
    expect(data.user.password).toBeUndefined(); // Password must not be leaked
  });

  it('rejects credential update when current password is wrong or omitted', async () => {
    // 1. Missing current password
    const reqNoPass = new NextRequest('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newEmail: 'newadmin@saporicafe.in',
      }),
    });

    const resNoPass = await updateProfile(reqNoPass);
    const dataNoPass = await resNoPass.json();
    expect(resNoPass.status).toBe(400);
    expect(dataNoPass.error).toContain('Current password is required');

    // 2. Incorrect current password
    const reqWrongPass = new NextRequest('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: 'wrong_password_999',
        newEmail: 'newadmin@saporicafe.in',
      }),
    });

    const resWrongPass = await updateProfile(reqWrongPass);
    const dataWrongPass = await resWrongPass.json();
    expect(resWrongPass.status).toBe(401);
    expect(dataWrongPass.error).toContain('Current password does not match');
  });

  it('rejects new password if shorter than 6 characters', async () => {
    const currentAdmin = dbStore.getAdminUser();

    const req = new NextRequest('http://localhost:3000/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: currentAdmin.password,
        newPassword: '123', // Too short
      }),
    });

    const res = await updateProfile(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('at least 6 characters');
  });

  it('successfully updates admin ID and password, and verifies new login', async () => {
    const { AdminUserModel } = await import('../../src/lib/db/models');
    const { connectToDatabase } = await import('../../src/lib/db/mongodb');
    await connectToDatabase();
    const originalAdmin = await AdminUserModel.findOne().lean();

    const currentPass = originalAdmin?.password || dbStore.getAdminUser().password;
    const initialAdmin = dbStore.getAdminUser();

    const newTestEmail = 'master.chef@saporicafe.in';
    const newTestPassword = 'SecureSapori2026!';
    const newTestName = 'Executive Chef Sonu';

    try {
      // 1. Update credentials via API
      const updateReq = new NextRequest('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          newEmail: newTestEmail,
          newPassword: newTestPassword,
          newName: newTestName,
        }),
      });

      const updateRes = await updateProfile(updateReq);
      const updateData = await updateRes.json();

      expect(updateRes.status).toBe(200);
      expect(updateData.success).toBe(true);
      expect(updateData.user.email).toBe(newTestEmail);
      expect(updateData.user.name).toBe(newTestName);

      // 2. Verify login with OLD password now fails
      const oldLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newTestEmail,
          password: currentPass, // Old password
        }),
      });

      const oldLoginRes = await login(oldLoginReq);
      expect(oldLoginRes.status).toBe(401);

      // 3. Verify login with NEW credentials succeeds
      const newLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newTestEmail,
          password: newTestPassword,
        }),
      });

      const newLoginRes = await login(newLoginReq);
      const newLoginData = await newLoginRes.json();

      expect(newLoginRes.status).toBe(200);
      expect(newLoginData.success).toBe(true);
      expect(newLoginData.user.email).toBe(newTestEmail);
    } finally {
      // 4. Reset back to original credentials in BOTH Atlas and in-memory store
      if (originalAdmin) {
        const { _id, __v, ...cleanAdmin } = originalAdmin as any;
        await AdminUserModel.findOneAndUpdate({ id: 'admin-master' }, { $set: cleanAdmin });
      }
      dbStore.updateAdminCredentials({
        email: originalAdmin?.email || initialAdmin.email,
        password: originalAdmin?.password || initialAdmin.password,
        name: originalAdmin?.name || initialAdmin.name,
      });
    }
  });
});
