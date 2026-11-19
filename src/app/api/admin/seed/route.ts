import { NextResponse } from 'next/server';
import { runMongoDBSeeder } from '@/lib/db/seeder';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await runMongoDBSeeder();
    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas seeded successfully with all schemas and collections!',
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
