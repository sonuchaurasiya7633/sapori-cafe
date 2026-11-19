'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, Reply, Check, RefreshCw, Trash2, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { CustomerReview } from '@/types';
import { toast } from '@/lib/toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadReviews = (isManual = false) => {
    if (isManual) setRefreshing(true);
    fetch('/api/reviews?all=true')
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .finally(() => {
        setLoading(false);
        if (isManual) setRefreshing(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (review: CustomerReview) => {
    const updatedStatus = !review.isApproved;
    setSubmittingId(review.id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, isApproved: updatedStatus }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, isApproved: updatedStatus } : r))
        );
        toast.success(`Review ${updatedStatus ? 'Approved' : 'Hidden'}`);
      } else {
        toast.error('Failed to update review status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating review');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this guest review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success('Guest review deleted');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error deleting review');
    }
  };

  const handleSendReply = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;

    setSubmittingId(reviewId);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reply: text.trim() }),
      });
      if (res.ok) {
        toast.success('Official reply posted!');
        setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
        loadReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const approvedCount = reviews.filter((r) => r.isApproved).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Reputation & Hospitality
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Guest Reviews & Feedback
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Customer dining ratings and official Sapori management replies
          </p>
        </div>

        <button
          onClick={() => loadReviews(true)}
          disabled={refreshing}
          className="self-start sm:self-auto bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Total Reviews</span>
          <span className="text-2xl font-black text-[#15370D]">{reviews.length}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Average Rating</span>
          <span className="text-2xl font-black text-[#15370D] flex items-center">
            {avgRating} <Star className="w-4 h-4 ml-1 fill-[#15370D] text-[#15370D]" />
          </span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">Approved</span>
          <span className="text-2xl font-black text-[#15370D]">{approvedCount}</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#15370D]/60 block">With Reply</span>
          <span className="text-2xl font-black text-[#15370D]">
            {reviews.filter((r) => r.adminReply).length}
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Loading Guest Feedback...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-16 text-center space-y-2 shadow-xs">
            <MessageSquare className="w-10 h-10 opacity-30 mx-auto text-[#15370D]" />
            <h3 className="font-bold text-sm text-[#15370D]">No guest reviews recorded yet</h3>
            <p className="text-xs text-[#15370D]/60">
              Reviews left by diners will appear here for management moderation and replies.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-xs text-[#15370D]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#15370D]/10 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-[#15370D]">{rev.authorName}</h3>
                    <button
                      onClick={() => handleToggleApproval(rev)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${
                        rev.isApproved
                          ? 'bg-[#15370D] text-[#FFFFFF] border-[#15370D]'
                          : 'bg-[#F5EFE1] text-[#15370D]/60 border-[#15370D]/20'
                      }`}
                    >
                      {rev.isApproved ? 'Approved' : 'Hidden'}
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-[#15370D]/60 mt-0.5">
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-semibold">{rev.verifiedOrder ? 'Verified Diner' : 'Guest'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-[#15370D] text-[#15370D]'
                            : 'text-[#15370D]/20'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="w-7 h-7 rounded-lg bg-[#F5EFE1] text-[#15370D]/60 hover:text-[#15370D] hover:bg-[#FFFFFF] border border-[#15370D]/15 flex items-center justify-center transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#15370D]/85 leading-relaxed">
                "{rev.comment}"
              </p>

              {/* Management Reply */}
              {rev.adminReply ? (
                <div className="bg-[#F5EFE1]/70 border-l-2 border-[#15370D] rounded-r-xl p-3.5 space-y-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-[#15370D] block">
                    Sapori Management Response:
                  </span>
                  <p className="text-xs text-[#15370D]/80 leading-relaxed">{rev.adminReply}</p>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#15370D]/10 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
                    Write Official Hospitality Response
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Thank you for joining us at Raja Park..."
                      value={replyText[rev.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [rev.id]: e.target.value }))
                      }
                      className="flex-1 bg-[#F5EFE1]/50 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                    <button
                      onClick={() => handleSendReply(rev.id)}
                      disabled={submittingId === rev.id || !replyText[rev.id]?.trim()}
                      className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 min-h-[38px]"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{submittingId === rev.id ? 'Posting...' : 'Post Reply'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
