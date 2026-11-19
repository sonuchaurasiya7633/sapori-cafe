import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { CustomerReview } from '@/types';
import { connectToDatabase } from '@/lib/db/mongodb';
import { CustomerReviewModel } from '@/lib/db/models';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { escapeHtml } from '@/lib/security/sanitize';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
};

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true';
    await connectToDatabase();
    const filter = all ? {} : { isApproved: true };
    const dbReviews = await CustomerReviewModel.find(filter).sort({ createdAt: -1 }).lean();

    if (dbReviews && dbReviews.length > 0) {
      const cleanReviews = dbReviews.map(({ _id, __v, ...rest }: any) => rest);
      return NextResponse.json({ success: true, count: cleanReviews.length, reviews: cleanReviews }, { headers: NO_CACHE_HEADERS });
    }

    const reviews = dbStore.getReviews(!all);
    return NextResponse.json({ success: true, count: reviews.length, reviews }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    const all = request.nextUrl.searchParams.get('all') === 'true';
    const reviews = dbStore.getReviews(!all);
    return NextResponse.json({ success: true, count: reviews.length, reviews }, { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`review_${clientIp}`, { limit: 10, windowMs: 300000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Review submission limit reached. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { authorName, rating, comment } = body;

    if (!authorName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Author name, rating, and comment are required' },
        { status: 400 }
      );
    }

    // Input sanitization against XSS & script injection
    const cleanAuthor = escapeHtml(String(authorName).trim().slice(0, 80));
    const cleanComment = escapeHtml(String(comment).trim().slice(0, 1000));
    const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      authorName: cleanAuthor,
      rating: numericRating,
      comment: cleanComment,
      verifiedOrder: true,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    await connectToDatabase();
    await CustomerReviewModel.findOneAndUpdate({ id: newReview.id }, newReview, { upsert: true, new: true });
    const saved = dbStore.createReview(newReview);

    return NextResponse.json({ success: true, review: saved }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit review' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, reply, isApproved } = body;

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const updates: Partial<CustomerReview> = {};
    if (reply !== undefined) updates.adminReply = reply;
    if (isApproved !== undefined) updates.isApproved = Boolean(isApproved);

    await connectToDatabase();
    await CustomerReviewModel.findOneAndUpdate({ id: reviewId }, { $set: updates }, { new: true });
    const updated = dbStore.updateReview(reviewId, updates);

    return NextResponse.json({ success: true, review: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await CustomerReviewModel.deleteOne({ id });
    const deleted = dbStore.deleteReview(id);

    return NextResponse.json({ success: true, deleted: true }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
