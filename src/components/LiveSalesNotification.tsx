import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle } from 'lucide-react';

const mockSales = [
  { name: 'রাফসান আহমেদ', city: 'মিরপুর, ঢাকা', pack: 'ডিওডোরেন্ট ক্রিম (২৪ পিস)', time: '২ মিনিট আগে' },
  { name: 'তানজিলা হক', city: 'গুলশান, ঢাকা', pack: 'ডিওডোরেন্ট ক্রিম (১২ পিস)', time: '৪ মিনিট আগে' },
  { name: 'মাহবুবুল আলম', city: 'জিইসি, চট্টগ্রাম', pack: 'ডিওডোরেন্ট ক্রিম (৩৬ পিস)', time: '৬ মিনিট আগে' },
  { name: 'নুসরাত জাহান', city: 'উত্তরা, ঢাকা', pack: 'ডিওডোরেন্ট ক্রিম (২৪ পিস)', time: '৮ মিনিট আগে' },
  { name: 'ফারহান চৌধুরী', city: 'সিলেট সদর', pack: 'ডিওডোরেন্ট ক্রিম (১২ পিস)', time: '১১ মিনিট আগে' },
  { name: 'সামিয়া রহমান', city: 'ধানমন্ডি, ঢাকা', pack: 'ডিওডোরেন্ট ক্রিম (২৪ পিস)', time: '১৫ মিনিট আগে' },
  { name: 'আরিফুল ইসলাম', city: 'খুলনা সদর', pack: 'ডিওডোরেন্ট ক্রিম (৩৬ পিস)', time: '১৮ মিনিট আগে' },
  { name: 'মেহেরিন আক্তার', city: 'কুমিল্লা', pack: 'ডিওডোরেন্ট ক্রিম (১২ পিস)', time: '২২ মিনিট আগে' },
];

export const LiveSalesNotification: React.FC = () => {
  const [currentSale, setCurrentSale] = useState<typeof mockSales[0] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentSale(mockSales[index % mockSales.length]);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 4500);

      index++;
    }, 12000);

    // Initial trigger after 4s
    const initialTimeout = setTimeout(() => {
      setCurrentSale(mockSales[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!visible || !currentSale) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200 flex items-center gap-3 animate-bounce">
      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <CheckCircle className="w-5 h-5" />
      </div>
      <div className="text-xs">
        <p className="text-slate-900 font-bold leading-tight">
          {currentSale.name} ({currentSale.city})
        </p>
        <p className="text-[11px] text-slate-500">
          মাত্র অর্ডার করেছেন <span className="font-semibold text-blue-600">{currentSale.pack}</span>
        </p>
        <span className="text-[9px] text-slate-400 font-medium">{currentSale.time}</span>
      </div>
    </div>
  );
};
