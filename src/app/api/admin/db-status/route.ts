import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const conn = await connectToDatabase();
    const latencyMs = Date.now() - startTime;

    const sessionCookie = request.cookies.get('sapori_admin_session')?.value;
    const isAdmin = Boolean(
      sessionCookie && sessionCookie.includes('authenticated_sapori_admin_session')
    );

    if (conn && conn.connection.readyState === 1) {
      return NextResponse.json({
        success: true,
        status: 'CONNECTED',
        provider: 'MongoDB Atlas',
        latencyMs,
        // Only disclose internal database structure to authenticated administrators
        ...(isAdmin
          ? {
              database: conn.connection.name,
              readyState: conn.connection.readyState,
            }
          : {}),
        message: 'Database operational and healthy',
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: 'DEGRADED',
        message: 'Database service unavailable',
      },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'ERROR',
        error: 'Database diagnostic check failed',
      },
      { status: 500 }
    );
  }
}
