"use client";

import { Category } from "@/types";
import React, { useEffect, useRef } from "react";

interface CategoryNavProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to active element on mobile
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = document.getElementById(`cat-${selectedId}`);
      if (activeEl) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          activeEl.offsetLeft -
          container.offsetWidth / 2 +
          activeEl.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [selectedId]);

  return (
    <div className="sticky top-0 z-50 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-stone-100 transition-all duration-300">
      <div
        ref={scrollContainerRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto overflow-y-hidden no-scrollbar flex items-center gap-8 sm:gap-12 py-6"
      >
        {categories.map((category) => {
          const isSelected = selectedId === category.id;
          return (
            <button
              key={category.id}
              id={`cat-${category.id}`}
              onClick={() => onSelect(category.id)}
              className={`
                group relative flex-shrink-0 flex flex-col items-center justify-center transition-all duration-500 ease-out py-2
                ${isSelected ? "opacity-100" : "opacity-40 hover:opacity-70"}
              `}
            >
              {/* Text */}
              <span
                className={`
                text-lg sm:text-xl tracking-[0.2em] whitespace-nowrap font-serif
                ${isSelected ? "text-ink font-bold scale-110" : "text-stone-600 font-normal"}
                transition-all duration-500
              `}
              >
                {category.name}
              </span>

              {/* The "Seal" / Active Indicator - Minimalist Red Dot or Line */}
              <span
                className={`
                absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-seal-red shadow-[0_0_8px_rgba(185,28,28,0.4)]
                transition-all duration-500 delay-75
                ${isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
              />

              {/* Vertical Chinese writing decoration (Optional subtle detail on hover) */}
              <span className="absolute -right-4 top-0 text-[8px] writing-vertical-rl text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-full flex items-center select-none pointer-events-none">
                {category.id !== "all" ? "赏" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Decorative gradient to hint at scroll on mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fcfbf9] to-transparent pointer-events-none sm:hidden" />
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fcfbf9] to-transparent pointer-events-none sm:hidden" />
    </div>
  );
};

export default CategoryNav;
