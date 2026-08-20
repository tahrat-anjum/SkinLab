import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { PackageOption } from '../types';
import { trackInitiateCheckout } from '../utils/metaPixel';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: PackageOption;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  quantity,
  onQuantityChange,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = selectedPackage.discountPrice * quantity;

  const handleCheckoutClick = () => {
    trackInitiateCheckout(selectedPackage, quantity, subtotal);
    onClose();
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">আপনার শপিং ব্যাগ</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase">
                  Dr. Zeng Armpit Deodorant
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedPackage.title} ({selectedPackage.bengaliTitle})
                </h4>
                <p className="text-xs font-bold text-[#1a73e8] mt-1">
                  {selectedPackage.discountPrice.toLocaleString('en-US')} BDT
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => onQuantityChange(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Checkout */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">সাবটোটাল:</span>
            <span className="text-lg font-black text-slate-900">
              {subtotal.toLocaleString('en-US')} BDT
            </span>
          </div>

          <p className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছানোর পর মূল্য পরিশোধ করবেন।
          </p>

          <button
            onClick={handleCheckoutClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
          >
            <span>চেকআউট করুন (ক্যাশ অন ডেলিভারি)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
