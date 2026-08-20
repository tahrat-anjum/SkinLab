import React, { useState } from 'react';
import { Star, ShieldCheck, Plus, MessageSquare, CheckCircle, Send } from 'lucide-react';
import { CustomerReview } from '../types';

interface CustomerReviewsProps {
  reviews: CustomerReview[];
  onAddReview: (review: { author: string; rating: number; comment: string; city: string }) => Promise<boolean>;
}

export const CustomerReviews: React.FC<CustomerReviewsProps> = ({ reviews, onAddReview }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    const success = await onAddReview({
      author: author.trim(),
      city: city.trim() || 'বাংলাদেশ',
      rating,
      comment: comment.trim(),
    });

    setIsSubmitting(false);
    if (success) {
      setSuccessMessage('আপনার রিভিউটি সফলভাবে জমা হয়েছে!');
      setAuthor('');
      setComment('');
      setCity('');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 1500);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="customer-reviews" className="my-6 pt-2">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 uppercase block mb-0.5">
            কাস্টমার রিভিউ
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            আমাদের গ্রাহকদের অভিজ্ঞতা
          </h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold text-[#1a73e8] hover:text-blue-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" /> রিভিউ দিন
        </button>
      </div>

      {/* Summary Score Card */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs mb-4 flex items-center gap-4">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {averageRating}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <p className="text-[11px] font-semibold text-slate-600">
            {reviews.length} Verified Reviews
          </p>
        </div>
      </div>

      {/* Individual Reviews List */}
      <div className="space-y-3">
        {reviews.map((rev) => {
          const initialLetter = rev.author.charAt(0).toUpperCase();

          return (
            <div
              key={rev.id}
              className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
            >
              {/* Reviewer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Dark Blue Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-[#0e2a47] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {initialLetter}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {rev.author}
                    </h4>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <span className="text-[11px] text-slate-400 font-medium">
                  {rev.date}
                </span>
              </div>

              {/* Comment text in quotes */}
              <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>

              {/* Verified Purchase Tag */}
              {rev.isVerified && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px]">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VERIFIED PURCHASE</span>
                  </div>
                  {rev.city && (
                    <span className="text-slate-400">
                      লোকেশন: {rev.city}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              আপনার মতামত ও রিভিউ লিখুন
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dr. Zeng আর্মপিট ডিওডোরেন্ট সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন
            </p>

            {successMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                {successMessage}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার শহর / জেলা
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="যেমন: ঢাকা"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রেটিং
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রিভিউ মন্তব্য *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="প্রোডাক্টটি আপনার কেমন লেগেছে বিস্তারিত লিখুন..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold bg-[#1a73e8] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
