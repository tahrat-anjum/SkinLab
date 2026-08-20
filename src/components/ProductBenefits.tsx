import React, { useState } from 'react';
import { benefitsList, faqs } from '../data/productData';
import { ShieldCheck, Sparkles, Droplets, HeartHandshake, ChevronDown, CheckCircle2 } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  Sparkles,
  Droplets,
  HeartHandshake,
};

export const ProductBenefits: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="my-6 pt-2">
      {/* Benefits Grid */}
      <div className="mb-8">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 uppercase block mb-0.5">
          বিশেষ গুণাবলী
        </span>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mb-4">
          কেন Dr. Zeng সবচেয়ে কার্যকর?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {benefitsList.map((b, i) => {
            const Icon = iconMap[b.icon] || Sparkles;
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-1"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-blue-600 flex items-center justify-center mb-1">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {b.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div className="mb-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 tracking-tight">
          সাধারণ ডিওডোরেন্ট বনাম Dr. Zeng
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-bold text-[11px]">বৈশিষ্ট্য</th>
                <th className="pb-2 font-bold text-blue-600 text-[11px]">Dr. Zeng হার্বাল</th>
                <th className="pb-2 font-bold text-slate-400 text-[11px]">সাধারণ স্প্রে/রোল-অন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2 font-medium">স্থায়িত্ব</td>
                <td className="py-2 font-bold text-emerald-700">৭ থেকে ২১ দিন পর্যন্ত ফ্রেশ</td>
                <td className="py-2 text-slate-400">মাত্র ৪-৬ ঘণ্টা</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">লোমকূপ অবস্থা</td>
                <td className="py-2 font-bold text-emerald-700">স্বাভাবিক ও উন্মুক্ত রাখে</td>
                <td className="py-2 text-slate-400">কেমিক্যাল দিয়ে বন্ধ করে দেয়</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">উপাদান</td>
                <td className="py-2 font-bold text-emerald-700">প্রাকৃতিক চীনা ভেষজ</td>
                <td className="py-2 text-slate-400">অ্যালকোহল ও অ্যালুমিনিয়াম</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">ত্বকের যত্ন</td>
                <td className="py-2 font-bold text-emerald-700">কালো দাগ দূর করে ত্বক কোমল করে</td>
                <td className="py-2 text-slate-400">ত্বক কালো ও শুষ্ক হতে পারে</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mb-4">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-blue-600 uppercase block mb-0.5">
          সাধারণ জিজ্ঞাসা
        </span>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mb-3">
          সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3 sm:px-3.5 pb-3 pt-0.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
