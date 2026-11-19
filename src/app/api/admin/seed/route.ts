import { NextRequest, NextResponse } from 'next/server';
import { runMongoDBSeeder } from '@/lib/db/seeder';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('sapori_admin_session')?.value;
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, strictly require administrator session to execute database seeding
    if (
      isProduction &&
      (!sessionCookie || !sessionCookie.includes('authenticated_sapori_admin_session'))
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required for database initialization' },
        { status: 401 }
      );
    }

    const result = await runMongoDBSeeder();
    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas verified and synchronized successfully!',
      stats: result.stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to seed MongoDB Atlas',
      },
      { status: 500 }
    );
  }
}
