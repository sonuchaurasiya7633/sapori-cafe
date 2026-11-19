import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { CustomerReview } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get('all') === 'true';
    const reviews = dbStore.getReviews(!all);
    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorName, rating, comment } = body;

    if (!authorName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Author name, rating, and comment are required' },
        { status: 400 }
      );
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10)));
    const newReview: CustomerReview = {
      id: `rev-${Date.now()}`,
      authorName: authorName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      verifiedOrder: true,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    const saved = dbStore.createReview(newReview);
    return NextResponse.json({ success: true, review: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
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

    const updated = dbStore.updateReview(reviewId, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    }

    const deleted = dbStore.deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
