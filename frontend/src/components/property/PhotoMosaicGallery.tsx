import React, { useState, useEffect } from "react";
import { Grid, ChevronLeft, ChevronRight, X, Maximize2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PhotoMosaicGalleryProps {
  images: string[];
  title: string;
}

export function PhotoMosaicGallery({ images, title }: PhotoMosaicGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const safeImages = images && images.length > 0 ? images : [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
  ];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActivePhotoIdx((prev) => (prev + 1) % safeImages.length);
      if (e.key === "ArrowLeft") setActivePhotoIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, safeImages.length]);

  return (
    <div className="relative">
      {/* 5-Photo Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2.5 h-[340px] md:h-[450px] rounded-2xl md:rounded-3xl overflow-hidden shadow-card">
        {/* Main Large Feature Image (Col 1-2, Row 1-2) */}
        <div
          className="relative md:col-span-2 md:row-span-2 overflow-hidden cursor-pointer group"
          onClick={() => {
            setActivePhotoIdx(0);
            setLightboxOpen(true);
          }}
        >
          <img
            src={safeImages[0]}
            alt={`${title} main view`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>

        {/* 4 Supporting Mosaic Tiles */}
        {[1, 2, 3, 4].map((index) => {
          const imgUrl = safeImages[index] || safeImages[0];
          const isLast = index === 4;

          return (
            <div
              key={index}
              className="hidden md:block relative overflow-hidden cursor-pointer group"
              onClick={() => {
                setActivePhotoIdx(index % safeImages.length);
                setLightboxOpen(true);
              }}
            >
              <img
                src={imgUrl}
                alt={`${title} view ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

              {/* Show All Photos button on the last tile */}
              {isLast && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all group-hover:bg-black/50">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2 bg-background/90 text-foreground font-semibold shadow-lg backdrop-blur-md"
                  >
                    <Grid className="h-4 w-4" />
                    <span>Show all {safeImages.length} photos</span>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating mobile button */}
      <div className="md:hidden absolute bottom-3 right-3">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 bg-background/90 backdrop-blur-md shadow-md text-xs"
          onClick={() => {
            setActivePhotoIdx(0);
            setLightboxOpen(true);
          }}
        >
          <Grid className="h-3.5 w-3.5" />
          <span>{safeImages.length} Photos</span>
        </Button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
            <div>
              <h3 className="font-heading font-bold text-base line-clamp-1">{title}</h3>
              <p className="text-xs text-white/60">
                Photo {activePhotoIdx + 1} of {safeImages.length}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Photo Viewport with Navigation */}
          <div className="relative flex-1 flex items-center justify-center p-4">
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev - 1 + safeImages.length) % safeImages.length)}
              className="absolute left-2 md:left-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <img
              src={safeImages[activePhotoIdx]}
              alt={`${title} - Photo ${activePhotoIdx + 1}`}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300 select-none"
            />

            <button
              onClick={() => setActivePhotoIdx((prev) => (prev + 1) % safeImages.length)}
              className="absolute right-2 md:right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md z-10"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 border-t border-white/10 scrollbar-none">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activePhotoIdx
                    ? "border-primary scale-105 shadow-md"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoMosaicGallery;
