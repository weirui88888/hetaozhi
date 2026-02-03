"use client";

import { COLOR_MAP, TAG_LABELS } from "@/constants";
import { Walnut } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Hourglass,
  Palette,
  QrCode,
  Ruler,
  Scale,
  Share2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface WalnutDetailModalProps {
  walnut: Walnut;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const WalnutDetailModal: React.FC<WalnutDetailModalProps> = ({
  walnut,
  onClose,
  isAdmin,
  onEdit,
}) => {
  // Combine cover image and detail images into a single list for the gallery
  const allImages = [walnut.coverImage, ...(walnut.detailImages || [])];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Like State (Simulated)
  const [likes, setLikes] = useState(walnut.likes);
  const [isLiked, setIsLiked] = useState(false);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast.success("海报已保存至相册");
    }, 1500);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  const currentImage = allImages[currentImageIndex];

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative w-full max-w-6xl h-full sm:h-[90vh] bg-[#fcfbf9] sm:rounded-md shadow-2xl overflow-hidden flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-200">
          {/* Close Button & Admin Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            {isAdmin && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 bg-walnut/10 hover:bg-walnut/20 text-walnut rounded-full transition-colors backdrop-blur-md border border-walnut/20"
                title="编辑详情"
              >
                <Palette className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6 text-stone-800" />
            </button>
          </div>

          {/* Left Side: Image Gallery */}
          <div className="w-full sm:w-2/3 h-[50vh] sm:h-full bg-stone-100 relative group select-none">
            {/* Main Image */}
            <Image
              src={currentImage.url}
              alt={`${walnut.title} - view ${currentImageIndex + 1}`}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white text-stone-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs tracking-widest font-light">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {/* Right Side: Details & Thumbnails */}
          <div className="w-full sm:w-1/3 h-[50vh] sm:h-full bg-[#fcfbf9] flex flex-col border-l border-stone-200/50">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
              {/* Header: Variety Tag */}
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 border border-stone-200 text-[10px] tracking-widest text-stone-400 uppercase">
                  {walnut.variety} Collection
                </span>
              </div>

              <h2 className="text-3xl font-serif font-bold text-ink mb-2">
                {walnut.title}
              </h2>
              <p className="text-sm text-stone-500 italic mb-8">
                收藏者：{walnut.ownerName}
              </p>

              {/* Tags Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {walnut.tags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-3 bg-stone-50 rounded-sm border border-stone-100"
                  >
                    <div className="flex items-center gap-2 mb-1 text-stone-400">
                      {getTagIcon(tag.type)}
                      <span className="text-xs">{TAG_LABELS[tag.type]}</span>
                    </div>
                    <span className="text-ink font-serif font-medium">
                      {tag.type === "size" && typeof tag.value !== "string" ? (
                        <div className="flex gap-2">
                          {tag.value.length && (
                            <span>长{tag.value.length}</span>
                          )}
                          {tag.value.width && <span>宽{tag.value.width}</span>}
                          {tag.value.height && (
                            <span>高{tag.value.height}</span>
                          )}
                        </div>
                      ) : tag.type === "color" ? (
                        COLOR_MAP[tag.value as string] || tag.value
                      ) : (
                        (tag.value as string)
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Area (Like & Share) */}
              <div className="flex items-center gap-3 mb-8">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  className={`
                      flex-1 flex items-center justify-center gap-2 py-3 border rounded-sm transition-all group
                      ${isLiked ? "border-seal-red/30 bg-red-50/50" : "border-stone-200 hover:border-walnut hover:bg-stone-50"}
                    `}
                >
                  <Heart
                    className={`w-4 h-4 transition-all duration-300 ${isLiked ? "fill-seal-red text-seal-red" : "text-stone-400 group-hover:text-seal-red"}`}
                  />
                  <span
                    className={`text-sm font-serif tracking-widest ${isLiked ? "text-seal-red font-medium" : "text-stone-500 group-hover:text-ink"}`}
                  >
                    {isLiked ? "已赏" : "共赏"} ({likes})
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-200 rounded-sm hover:border-walnut hover:bg-stone-50 transition-all group"
                >
                  <Share2 className="w-4 h-4 text-stone-400 group-hover:text-ink" />
                  <span className="text-sm font-serif tracking-widest text-stone-500 group-hover:text-ink">
                    分享
                  </span>
                </button>
              </div>

              {/* Details Description */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-widest text-ink uppercase border-b border-stone-100 pb-2">
                  雅集详情
                </h3>
                <p className="text-ink-light leading-loose text-sm font-light text-justify">
                  {walnut.description}
                </p>
              </div>
            </div>

            {/* Thumbnails Strip */}
            {allImages.length > 1 && (
              <div className="p-4 bg-stone-50 border-t border-stone-200/50 overflow-x-auto">
                <div className="flex gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`
                        relative w-16 h-16 shrink-0 rounded-sm overflow-hidden border-2 transition-all duration-300
                        ${currentImageIndex === idx ? "border-walnut opacity-100" : "border-transparent opacity-50 hover:opacity-100"}
                      `}
                    >
                      <Image
                        src={img.url}
                        fill
                        className="object-cover"
                        alt="thumbnail"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Poster Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-110 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Darker backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/95 backdrop-blur-md"
            onClick={() => setShowShareModal(false)}
          />

          {/* The 3:4 Card Container */}
          <div className="relative z-120 w-full max-w-sm aspect-3/4 bg-[#fcfbf9] rounded-sm shadow-2xl p-5 flex flex-col items-center justify-between border border-stone-200 overflow-hidden transition-all duration-300">
            {/* Card Header */}
            <div className="w-full flex justify-between items-center opacity-50 mb-2 shrink-0">
              <span className="text-[10px] tracking-[0.2em] uppercase">
                The Walnut Collection
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase">
                {new Date().getFullYear()}/
                {String(new Date().getMonth() + 1).padStart(2, "0")}/
                {String(new Date().getDate()).padStart(2, "0")}
              </span>
            </div>

            {/* Card Image Area */}
            <div className="w-full h-[42%] bg-stone-100 mb-3 p-2 shadow-inner rounded-sm shrink-0 relative">
              <Image
                src={walnut.coverImage.url}
                fill
                className="object-cover mix-blend-multiply"
                alt="Poster"
                sizes="320px"
              />
            </div>

            {/* Card Content Area */}
            <div
              className={`flex-1 w-full px-2 min-h-0 flex flex-col ${showQrCode ? "text-left" : "text-center"}`}
            >
              {/* Top Block: Info + (Optional) QR */}
              <div
                className={`w-full flex ${showQrCode ? "flex-row justify-between items-start gap-3" : "flex-col items-center"}`}
              >
                {/* Text Info */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink truncate w-full leading-tight">
                    {walnut.title}
                  </h2>
                  <p className="text-xs text-stone-500 italic mb-2">
                    收藏者 · {walnut.ownerName}
                  </p>

                  {/* Mini Tags Row */}
                  <div
                    className={`flex flex-wrap gap-2 mb-1 ${showQrCode ? "justify-start" : "justify-center"}`}
                  >
                    {walnut.tags.slice(0, 3).map((tag, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-sm border border-stone-100"
                      >
                        {getTagIcon(tag.type)}
                        <span className="text-[10px] text-stone-600 font-serif">
                          {tag.type === "size" && typeof tag.value !== "string"
                            ? tag.value.length &&
                              tag.value.width &&
                              tag.value.height
                              ? `${tag.value.length},${tag.value.width},${tag.value.height}`
                              : tag.value.length
                            : tag.type === "color"
                              ? COLOR_MAP[tag.value as string] || tag.value
                              : (tag.value as string)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code Placeholder */}
                {showQrCode && (
                  <div className="shrink-0 w-20 h-20 bg-white border border-stone-200 p-1 rounded-sm shadow-sm flex items-center justify-center">
                    <div className="shrink-0 w-full h-full bg-stone-100 flex items-center justify-center text-[8px] text-stone-400">
                      <QrCode className="w-8 h-8 opacity-20" />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 text-[11px] text-stone-500 leading-relaxed font-light line-clamp-3 w-full text-justify">
                {walnut.description}
              </div>
            </div>

            {/* Card Footer / Stamp */}
            <div className="w-full pt-3 border-t border-stone-200 flex justify-center items-center gap-2 mt-auto shrink-0">
              <div className="w-5 h-5 border border-stone-800 flex items-center justify-center rounded-sm">
                <span className="text-[10px] font-serif font-bold text-seal-red">
                  雅
                </span>
              </div>
              <span className="text-xs tracking-[0.3em] font-serif font-bold text-ink">
                核桃雅集
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute -top-12 right-0 sm:-right-12 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="relative z-120 mt-6 flex items-center gap-4">
            {/* QR Toggle Button */}
            <button
              onClick={() => setShowQrCode(!showQrCode)}
              className={`
                 p-3 rounded-full shadow-lg transition-all active:scale-95 border
                 ${showQrCode ? "bg-ink text-white border-ink" : "bg-white text-ink border-stone-200 hover:bg-stone-50"}
               `}
              title={showQrCode ? "隐藏二维码" : "显示二维码"}
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-white text-ink hover:bg-stone-100 px-8 py-3 rounded-full shadow-lg font-serif tracking-widest text-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-stone-100"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink"></span>
                  生成中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  保存雅集海报
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Helper for icons
const getTagIcon = (type: string) => {
  const className = "w-3.5 h-3.5";
  switch (type) {
    case "weight":
      return <Scale className={className} />;
    case "play_time":
      return <Hourglass className={className} />;
    case "size":
      return <Ruler className={className} />;
    case "color":
      return <Palette className={className} />;
    default:
      return <Ruler className={className} />;
  }
};

export default WalnutDetailModal;
