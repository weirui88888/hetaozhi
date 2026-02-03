"use client";

import { Category, Walnut } from "@/types";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import CategoryNav from "./CategoryNav";
import WalnutCard from "./WalnutCard";
import WalnutDetailModal from "./WalnutDetailModal";

interface WalnutGalleryProps {
  categories: Category[];
  initialWalnuts: Walnut[];
}

export default function WalnutGallery({
  categories,
  initialWalnuts,
}: WalnutGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWalnut, setSelectedWalnut] = useState<Walnut | null>(null);
  const [walnuts] = useState<Walnut[]>(initialWalnuts);

  const filteredWalnuts = useMemo(() => {
    if (selectedCategory === "all") return walnuts;
    return walnuts.filter((w) => w.variety === selectedCategory);
  }, [selectedCategory, walnuts]);

  return (
    <>
      <CategoryNav
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Empty State */}
        {filteredWalnuts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg tracking-widest font-light">暂无藏品</p>
            <p className="text-xs mt-2 opacity-50">No collection found</p>
          </div>
        )}

        {/* Masonry-like Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          {filteredWalnuts.map((walnut) => (
            <WalnutCard
              key={walnut.id}
              data={walnut}
              onClick={setSelectedWalnut}
            />
          ))}
        </div>

        {/* Footer Decoration */}
        <div className="mt-24 flex justify-center opacity-30">
          <div className="w-16 h-16 border border-stone-800 rounded-sm flex items-center justify-center">
            <span className="writing-vertical-rl text-xs font-bold tracking-widest">
              核桃雅集
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedWalnut && (
        <WalnutDetailModal
          walnut={selectedWalnut}
          onClose={() => setSelectedWalnut(null)}
        />
      )}
    </>
  );
}
