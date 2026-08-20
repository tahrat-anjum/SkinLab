import React from 'react';
import { Check, ShieldAlert } from 'lucide-react';
import { PackageOption } from '../types';
import { trackAddToCart } from '../utils/metaPixel';

interface PackageSelectorProps {
  packages: PackageOption[];
  selectedPackage: PackageOption;
  onSelectPackage: (pkg: PackageOption) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export const PackageSelector: React.FC<PackageSelectorProps> = ({
  packages,
  selectedPackage,
  onSelectPackage,
  quantity,
  onQuantityChange,
}) => {
  const handlePackageClick = (pkg: PackageOption) => {
    onSelectPackage(pkg);
    trackAddToCart(pkg, quantity);
  };

  return (
    <div id="package-selector" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-[15px] font-bold text-slate-800 tracking-tight">
          প্যাকেজ নির্বাচন করুন
        </h3>
        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <Check className="w-3 h-3 stroke-[2.5]" /> ইন-স্টক (রেডি ফর ডেলিভারি)
        </span>
      </div>

      <div className="space-y-2.5">
        {packages.map((pkg) => {
          const isSelected = selectedPackage.id === pkg.id;

          return (
            <div
              key={pkg.id}
              id={`package-card-${pkg.id}`}
              onClick={() => handlePackageClick(pkg)}
              className={`relative cursor-pointer rounded-xl p-3.5 transition-all duration-200 bg-white border-2 ${
                isSelected
                  ? 'border-[#1a73e8] ring-2 ring-blue-100 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              {/* Savings Badge on Top Right */}
              <div className="absolute -top-2.5 right-3.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-2xs ${
                    isSelected
                      ? 'bg-[#1a73e8] text-white'
                      : 'bg-sky-600 text-white'
                  }`}
                >
                  {pkg.badgeText || `সেভ ${pkg.savings}৳`}
                </span>
              </div>

              <div className="flex items-center justify-between pr-1">
                <div className="flex items-center gap-2.5">
                  {/* Custom Radio Checkmark */}
                  <div
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                      isSelected
                        ? 'border-[#1a73e8] bg-[#1a73e8] text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {pkg.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {pkg.bengaliTitle}
                    </p>
                  </div>
                </div>

                {/* Price (e.g. 1,250 BDT, strikethrough 1,500 BDT) */}
                <div className="text-right">
                  <div className="text-sm sm:text-base font-extrabold text-[#1a73e8] tracking-tight">
                    {pkg.discountPrice.toLocaleString('en-US')} ৳
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 line-through font-medium">
                    {pkg.originalPrice.toLocaleString('en-US')} ৳
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quantity & Summary bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">পরিমাণ (Quantity):</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(Math.max(1, quantity - 1));
              }}
              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 text-sm font-bold cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900">
              {quantity}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(quantity + 1);
              }}
              className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 text-sm font-bold cursor-pointer"
            >
              +
            </button>
          </div>
          <span className="text-xs font-bold text-blue-900">
            মোট: {(selectedPackage.discountPrice * quantity).toLocaleString('en-US')} ৳
          </span>
        </div>
      </div>
    </div>
  );
};
