'use client';

import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { CustomerReview } from '@/types';
import { toast } from '@/lib/toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadReviews = () => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      toast.warning('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      toast.warning('Please enter your review feedback');
      return;
    }

    setSubmitting(true);
    toast.loading('Submitting your review...');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, comment }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.dismiss();
        toast.success('Grazie! Your review has been submitted.');
        setSuccessMsg('Grazie! Your review has been added.');
        setAuthorName('');
        setComment('');
        setRating(5);
        loadReviews();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        toast.dismiss();
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.dismiss();
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Guest Testimonials
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#15370D]">
            Sapori Guest Reviews
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed">
            Real feedback from diners enjoying our Neapolitan pizzas and artisanal coffee in Raja Park, Jaipur.
          </p>
        </div>

        {/* Submit Review Card */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#15370D] border-b border-[#15370D]/10 pb-3">
            Share Your Experience
          </h2>

          {successMsg && (
            <div className="bg-[#F5EFE1] border border-[#15370D]/30 p-3.5 rounded-xl text-xs font-bold text-[#15370D] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diya Patel"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10))}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Needs Improvement)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                Your Review & Dish Recommendations *
              </label>
              <textarea
                rows={3}
                required
                placeholder="What did you love about your order or visit? (e.g. Truffle Mushroom Pizza, Cold Brew Tonic...)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow min-h-[44px]"
            >
              {submitting ? 'Submitting...' : 'Post Guest Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#15370D]">
            All Reviews ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#15370D]">{rev.authorName}</span>
                    <span className="text-xs font-bold text-[#15370D]">
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-[#15370D]/80 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {rev.adminReply && (
                  <div className="bg-[#F5EFE1] border-l-2 border-[#15370D] p-3 rounded-r-xl text-[11px] text-[#15370D] space-y-0.5">
                    <span className="font-bold block text-[10px] uppercase">
                      Official Sapori Reply:
                    </span>
                    <p className="leading-relaxed opacity-85">{rev.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
