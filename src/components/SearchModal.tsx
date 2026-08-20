import React, { useState } from 'react';
import { Search, X, Package, HelpCircle, Truck, ArrowRight } from 'lucide-react';
import { productData, faqs } from '../data/productData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (pkgId: string) => void;
  onOpenTracking: (query?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPackage,
  onOpenTracking,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedPackages = productData.packages.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.bengaliTitle.toLowerCase().includes(query.toLowerCase())
  );

  const matchedFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase())
  );

  const isTrackingQuery = query.toLowerCase().startsWith('dz-') || /^[0-9]{11}$/.test(query.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-bold text-slate-900 font-serif">অনুসন্ধান করুন</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="প্যাকেজ, প্রশ্ন বা অর্ডার আইডি খুঁজুন..."
            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Dynamic Results */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Tracking suggestion */}
          {isTrackingQuery && (
            <div
              onClick={() => {
                onClose();
                onOpenTracking(query.trim());
              }}
              className="p-3 bg-blue-50 rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>এই নম্বরে অর্ডার ট্র্যাক করুন: "{query.trim()}"</span>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          )}

          {/* Matched Packages */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
              প্যাকেজসমূহ
            </span>
            <div className="space-y-2">
              {matchedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    onSelectPackage(pkg.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900">{pkg.title}</span>
                      <p className="text-slate-500">{pkg.bengaliTitle}</p>
                    </div>
                  </div>
                  <span className="font-bold text-blue-600">{pkg.discountPrice} ৳</span>
                </div>
              ))}
            </div>
          </div>

          {/* Matched FAQs */}
          {matchedFaqs.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                সম্পর্কিত প্রশ্নোত্তর
              </span>
              <div className="space-y-2">
                {matchedFaqs.map((faq, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>{faq.question}</span>
                    </div>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
