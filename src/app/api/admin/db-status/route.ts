import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabaseStatus } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    const conn = await connectToDatabase();
    const latencyMs = Date.now() - startTime;

    if (conn && conn.connection.readyState === 1) {
      return NextResponse.json({
        success: true,
        status: 'CONNECTED',
        database: conn.connection.name || 'sapori_cafe',
        host: conn.connection.host,
        readyState: conn.connection.readyState,
        latencyMs,
        provider: 'MongoDB Atlas',
        cluster: 'cluster0.yvurarx.mongodb.net',
        message: 'Successfully connected to MongoDB Atlas',
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: 'DISCONNECTED',
        message: 'Database connection is not ready',
      },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'ERROR',
        error: error.message || 'Failed to connect to MongoDB Atlas',
      },
      { status: 500 }
    );
  }
}
