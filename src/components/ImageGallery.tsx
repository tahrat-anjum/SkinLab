import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { DrZengBoxMockup } from './ProductGraphics';
import { GalleryImageItem } from '../types';

interface ImageGalleryProps {
  images?: GalleryImageItem[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images: propImages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const defaultImages: GalleryImageItem[] = [
    { id: '1', label: 'প্যাকেজিং ও স্যাশে', variant: 'hero' },
    { id: '2', label: 'হারবাল মেকানিজম', variant: 'diagram' },
    { id: '3', label: 'ফুল কোর্স বান্ডেল', variant: 'bundle' },
    { id: '4', label: 'সিঙ্গেল ইউজ স্যাশে', variant: 'sachet' },
  ];

  const images = propImages && propImages.length > 0 ? propImages : defaultImages;
  
  // Keep index within bounds if image list shrinks or is reordered
  useEffect(() => {
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  const safeIndex = currentIndex >= images.length ? 0 : currentIndex;
  const currentImg = images[safeIndex] || images[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (imgId: string) => {
    setImageErrors((prev) => ({ ...prev, [imgId]: true }));
  };

  const renderImageContent = (img: GalleryImageItem) => {
    if (img && img.url && !imageErrors[img.id]) {
      return (
        <img
          src={img.url}
          alt={img.label || 'Product image'}
          referrerPolicy="no-referrer"
          onError={() => handleImageError(img.id)}
          className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 hover:scale-105"
        />
      );
    }
    return <DrZengBoxMockup variant={img?.variant || 'hero'} className="w-full h-full" />;
  };

  const renderThumbnailContent = (img: GalleryImageItem) => {
    if (img && img.url && !imageErrors[img.id]) {
      return (
        <img
          src={img.url}
          alt={img.label || 'Thumbnail'}
          referrerPolicy="no-referrer"
          onError={() => handleImageError(img.id)}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return <DrZengBoxMockup variant={img?.variant || 'hero'} className="w-full h-full transform scale-90" />;
  };

  return (
    <section className="w-full relative">
      {/* Main Showcase Image */}
      <div className="relative rounded-2xl overflow-hidden shadow-xs border border-sky-100 bg-[#f0f7fd] aspect-4/3 sm:aspect-16/11 flex items-center justify-center">
        {renderImageContent(currentImg)}

        {/* Left Arrow Button */}
        {images.length > 1 && (
          <button
            id="gallery-prev-btn"
            onClick={handlePrev}
            aria-label="Previous Image"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all z-20"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Right Arrow Button */}
        {images.length > 1 && (
          <button
            id="gallery-next-btn"
            onClick={handleNext}
            aria-label="Next Image"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all z-20"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        {/* Zoom Inspection Button */}
        <button
          onClick={() => setShowZoomModal(true)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 backdrop-blur-xs text-slate-700 hover:bg-white shadow-xs border border-slate-200/60 z-20"
          title="বড় করে দেখুন"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Image index pill */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-semibold z-20">
          {safeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 mt-3 px-1">
        {images.map((item, idx) => {
          const isActive = idx === safeIndex;
          return (
            <button
              key={item.id || idx}
              id={`thumbnail-btn-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-[#f4f9fd] border-2 transition-all p-1 ${
                isActive
                  ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm scale-102'
                  : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
              }`}
            >
              {renderThumbnailContent(item)}
            </button>
          );
        })}
      </div>

      {/* Zoom Modal */}
      {showZoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              ✕ বন্ধ করুন
            </button>
            <div className="mt-4 aspect-square w-full rounded-xl overflow-hidden bg-[#f0f7fd] flex items-center justify-center">
              {renderImageContent(currentImg)}
            </div>
            <p className="text-center text-sm font-bold text-slate-800 mt-4">{currentImg.label}</p>
          </div>
        </div>
      )}
    </section>
  );
};
