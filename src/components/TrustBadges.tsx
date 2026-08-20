import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Banknote } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      id: 'original',
      icon: ShieldCheck,
      title: '১০০% অরিজিনাল',
      desc: 'অথেনটিক চায়না হারবাল গ্যারান্টি',
    },
    {
      id: 'fast-delivery',
      icon: Truck,
      title: 'ফাস্ট ডেলিভারি',
      desc: 'ঢাকা ২৪ ঘণ্টা, সারা দেশ ৪৮-৭২ ঘণ্টা',
    },
    {
      id: 'return-policy',
      icon: RotateCcw,
      title: '৭ দিনের রিটার্ন',
      desc: 'পণ্য পছন্দ না হলে সহজ রিপ্লেসমেন্ট',
    },
  ];

  return (
    <div className="py-3 border-y border-slate-100/90 my-2">
      <div className="grid grid-cols-3 gap-1.5">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className="flex flex-col items-center text-center p-1.5 rounded-xl hover:bg-sky-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#e3f2fd] text-[#1a73e8] flex items-center justify-center mb-1.5 shadow-2xs">
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-tight leading-tight">
                {b.title}
              </h4>
            </div>
          );
        })}
      </div>
    </div>
  );
};
