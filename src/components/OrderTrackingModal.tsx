import React, { useState, useEffect } from 'react';
import { Search, X, Truck, CheckCircle2, Clock, PackageCheck, AlertCircle, Phone } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'অর্ডার প্রাপ্তি',
  confirmed: 'অর্ডার নিশ্চিতকরণ',
  processing: 'প্যাকিং ও প্রস্তুতকরণ',
  shipped: 'কুরিয়ারে হস্তান্তর',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'অর্ডার বাতিল',
};

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  const handleSearch = async (searchStr: string) => {
    if (!searchStr.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(searchStr.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.data);
      } else {
        setOrders([]);
        setError(data.message || 'কোনো অর্ডার পাওয়া যায়নি। সঠিক আইডি অথবা ফোন নম্বর দিন।');
      }
    } catch (err) {
      setError('সার্ভারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-serif">
                অর্ডার লাইভ ট্র্যাকিং
              </h3>
              <p className="text-xs text-slate-500">
                অর্ডার নাম্বার বা ফোন নম্বর দিয়ে স্ট্যাটাস দেখুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex gap-2 mb-6"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অর্ডার নাম্বার (যেমন: DZ-748291) বা মোবাইল নম্বর"
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-[#1a73e8] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {orders.length > 0 && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {orders.map((order) => {
              const currentStatusIndex = statusOrder.indexOf(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4"
                >
                  {/* Order Overview Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        অর্ডার নাম্বার
                      </span>
                      <span className="text-base font-black text-blue-900 font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        বর্তমান স্ট্যাটাস
                      </span>
                      <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                        {statusLabels[order.status]}
                      </span>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="py-2">
                    <div className="relative flex items-center justify-between">
                      {statusOrder.map((step, idx) => {
                        const isDone = currentStatusIndex >= idx;
                        const isCurrent = currentStatusIndex === idx;

                        return (
                          <div key={step} className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-[#1a73e8] text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-blue-100 scale-110' : ''}`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>
                            <span className="text-[9px] font-semibold text-slate-600 mt-1.5 text-center max-w-[60px] hidden sm:block">
                              {statusLabels[step]}
                            </span>
                          </div>
                        );
                      })}
                      {/* Stepper track */}
                      <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                    </div>
                  </div>

                  {/* Tracking Log History */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      টাইমলাইন আপডেট
                    </h5>
                    <div className="space-y-2 text-xs divide-y divide-slate-100">
                      {order.trackingHistory.map((item, i) => (
                        <div key={i} className="pt-2 first:pt-0">
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span className="font-bold text-slate-700">{statusLabels[item.status]}</span>
                            <span>{new Date(item.timestamp).toLocaleString('bn-BD')}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <p><span className="font-semibold">গ্রাহক:</span> {order.customerName} ({order.phoneNumber})</p>
                    <p><span className="font-semibold">ঠিকানা:</span> {order.address}</p>
                    <p><span className="font-semibold">প্যাকেজ:</span> {order.item.packageName}</p>
                    <p><span className="font-semibold">প্রদেয় টাকা:</span> <strong className="text-slate-900">{order.totalAmount} BDT</strong> (ক্যাশ অন ডেলিভারি)</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
