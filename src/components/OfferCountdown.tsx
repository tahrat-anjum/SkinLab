import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const toBengaliNumber = (num: number): string => {
  const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((digit) => bnNumbers[parseInt(digit, 10)] ?? digit)
    .join('');
};

export const OfferCountdown: React.FC = () => {
  // 1 hour, 55 minutes, 30 seconds default (6930 seconds)
  const [totalSeconds, setTotalSeconds] = useState(1 * 3600 + 55 * 60 + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          return 2 * 3600; // Reset to 2 hours loop for urgency
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const bnHours = toBengaliNumber(hours);
  const bnMinutes = toBengaliNumber(minutes);
  const bnSeconds = toBengaliNumber(seconds);

  return (
    <div
      id="limited-offer-banner"
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fde8e8] border border-[#fbd0d0] text-[#e02424] text-xs font-semibold shadow-xs"
    >
      <Clock className="w-3.5 h-3.5 animate-pulse text-[#e02424]" />
      <span>
        সীমিত সময়ের অফার: <span className="font-bold">{bnHours} ঘণ্টা {bnMinutes} মিনিট {bnSeconds} সেকেন্ড</span> বাকি
      </span>
    </div>
  );
};
