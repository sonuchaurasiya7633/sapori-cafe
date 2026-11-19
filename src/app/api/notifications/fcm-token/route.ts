import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { NotificationTokenModel } from '@/lib/db/models';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { getMessaging } from 'firebase-admin/messaging';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token, role = 'admin', device } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, error: 'Valid FCM token is required' }, { status: 400 });
    }

    await connectToDatabase();
    const nowIso = new Date().toISOString();

    await NotificationTokenModel.findOneAndUpdate(
      { token },
      {
        token,
        role,
        device: device || 'Web Browser',
        updatedAt: nowIso,
      },
      { upsert: true, new: true }
    );

    // Subscribe to Firebase 'admin_orders' topic if Firebase Admin is available
    try {
      const fb = await getFirebaseAdmin();
      if (fb) {
        const messaging = getMessaging(fb);
        await messaging.subscribeToTopic([token], 'admin_orders');
      }
    } catch (fbErr) {
      console.warn('Could not subscribe token to Firebase topic:', fbErr);
    }

    return NextResponse.json({ success: true, message: 'Notification token registered successfully' });
  } catch (error) {
    console.error('Save notification token error:', error);
    return NextResponse.json({ success: false, error: 'Failed to register notification token' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const count = await NotificationTokenModel.countDocuments();
    const fb = await getFirebaseAdmin();

    return NextResponse.json({
      success: true,
      registeredDevices: count,
      firebaseConnected: !!fb,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve notification status' }, { status: 500 });
  }
}
