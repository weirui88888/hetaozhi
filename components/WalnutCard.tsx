import { CATEGORIES, COLOR_MAP, TAG_LABELS } from "@/constants";
import { Walnut } from "@/types";
import { Heart, Hourglass, Layers, Palette, Ruler, Scale } from "lucide-react";
import React, { useState } from "react";

interface WalnutCardProps {
  data: Walnut;
  onClick: (walnut: Walnut) => void;
  isAdmin?: boolean;
}

const WalnutCard: React.FC<WalnutCardProps> = ({ data, onClick }) => {
  const hasMultipleImages = data.detailImages && data.detailImages.length > 0;
  const [imageLoaded, setImageLoaded] = useState(false);

  // 查找品种名称
  const varietyLabel =
    CATEGORIES.find((c) => c.id === data.variety)?.name || "珍品";

  return (
    <div
      className="group flex flex-col gap-4 mb-8 break-inside-avoid cursor-pointer animate-fade-in"
      onClick={() => onClick(data)}
    >
      {/* Image Container - 使用 aspect-ratio 预留空间 */}
      <div
        className="relative w-full overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1"
        style={{
          aspectRatio:
            data.coverImage.width && data.coverImage.height
              ? `${data.coverImage.width} / ${data.coverImage.height}`
              : "4 / 5", // 默认比例
        }}
      >
        {/* 占位符标识 - 图片加载前显示 */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-stone-300 text-sm font-serif tracking-[0.3em] select-none">
              核桃·志
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/5 transition-colors duration-500 z-10" />
        <img
          src={data.coverImage.url}
          alt={data.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Variety Badge - Subtle */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs text-ink-light tracking-widest border border-stone-200 shadow-sm">
            {varietyLabel}
          </span>
        </div>

        {/* Likes Indicator - Bottom Left */}
        <div className="absolute bottom-3 left-3 z-20">
          <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-full sm:rounded-sm text-white/90 flex items-center gap-1.5 px-2">
            <Heart className="w-3.5 h-3.5 fill-white/20" />
            <span className="text-[10px] font-medium tracking-wider">
              {data.likes}
            </span>
          </div>
        </div>

        {/* Multiple Images Indicator - Bottom Right */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-sm text-white/90 flex items-center gap-1.5 px-2">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium tracking-wider">
                1 + {data.detailImages?.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="px-2">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-xl font-bold text-ink tracking-wide group-hover:text-walnut transition-colors">
            {data.title}
          </h3>
          <span className="text-xs text-stone-400 font-light italic">
            By {data.ownerName}
          </span>
        </div>

        <p className="text-sm text-ink-light leading-relaxed mb-4 line-clamp-3">
          {data.description}
        </p>

        {/* Custom Tags Display - Divider Style */}
        <div className="flex flex-wrap items-center gap-y-2 text-xs text-stone-500 font-medium">
          {data.tags.map((tag, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-1.5 group/tag">
                {getTagIcon(tag.type)}
                <span className="text-stone-400">{TAG_LABELS[tag.type]}</span>
                <span className="text-ink">
                  {tag.type === "size" && typeof tag.value !== "string"
                    ? tag.value.length
                    : tag.type === "color"
                      ? COLOR_MAP[tag.value as string] || tag.value
                      : (tag.value as string)}
                </span>
              </div>
              {/* Vertical Divider, don't show after last item */}
              {index < data.tags.length - 1 && (
                <span className="mx-3 h-3 w-[1px] bg-stone-300/50 block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper for icons
const getTagIcon = (type: string) => {
  const className = "w-3 h-3 text-stone-400";
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

export default WalnutCard;
