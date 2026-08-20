import React from 'react';
import { CheckCircle, Printer, Truck, Copy, Check, ShoppingBag } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Success Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            অর্ডার সফল হয়েছে
          </span>
          <h2 className="text-2xl font-black text-slate-900 font-serif">
            ধন্যবাদ, {order.customerName}!
          </h2>
          <p className="text-xs text-slate-600">
            আপনার অর্ডারটি সিস্টেমে সংরক্ষিত হয়েছে। শীঘ্রই আমাদের কাস্টমার কেয়ার প্রতিনিধি ফোন করে কনফার্ম করবেন।
          </p>
        </div>

        {/* Order Number Box */}
        <div className="my-5 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              অর্ডার ট্র্যাকিং নাম্বার (Order ID)
            </span>
            <span className="text-lg font-black text-blue-950 font-mono">
              {order.orderNumber}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 text-xs font-bold flex items-center gap-1 shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>
        </div>

        {/* Order Details Breakdown */}
        <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">পণ্য:</span>
            <span className="font-bold text-slate-900">{order.item.packageName} × {order.item.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">মোবাইল নাম্বার:</span>
            <span className="font-bold font-mono text-slate-900">{order.phoneNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
            <span className="font-medium text-slate-900 text-right max-w-[200px]">{order.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">পেমেন্ট মেথড:</span>
            <span className="font-bold text-emerald-700">ক্যাশ অন ডেলিভারি (COD)</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
            <span>সর্বমোট পরিশোধযোগ্য:</span>
            <span className="text-[#1a73e8]">{order.totalAmount.toLocaleString('en-US')} BDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => onTrackOrder(order.orderNumber)}
            className="w-full py-3 px-4 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Truck className="w-4 h-4" />
            অর্ডার লাইভ ট্র্যাক করুন
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              রসিদ প্রিন্ট
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              হোমপেজে ফিরুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
