"use client";

import AboutPage from "@/components/AboutPage";
import CategoryNav from "@/components/CategoryNav";
import Header from "@/components/Header";
import UploadPage from "@/components/UploadPage";
import WalnutCard from "@/components/WalnutCard";
import WalnutDetailModal from "@/components/WalnutDetailModal";
import { CATEGORIES, MOCK_WALNUTS } from "@/constants";
import { Walnut } from "@/types";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "gallery" | "about" | "upload"
  >("gallery");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedWalnut, setSelectedWalnut] = useState<Walnut | null>(null);

  // In a real app, this would come from an API.
  // Here we use state initialized with MOCK_WALNUTS so we can append to it.
  const [walnuts, setWalnuts] = useState<Walnut[]>(MOCK_WALNUTS);

  const filteredWalnuts = useMemo(() => {
    if (selectedCategory === "all") return walnuts;
    return walnuts.filter((w) => w.variety === selectedCategory);
  }, [selectedCategory, walnuts]);

  const handleNavigateHome = () => {
    setCurrentView("gallery");
    setSelectedWalnut(null);
  };

  const handleNavigateAbout = () => {
    setCurrentView("about");
  };

  const handleNavigateUpload = () => {
    setCurrentView("upload");
  };

  const handleSaveWalnut = (newWalnut: Walnut) => {
    // Simulate API save
    setWalnuts((prev) => [newWalnut, ...prev]);
    alert("发布成功！");
    setCurrentView("gallery");
  };

  return (
    <div className="min-h-screen bg-paper font-serif text-ink selection:bg-stone-200">
      <Header
        onNavigateHome={handleNavigateHome}
        onNavigateAbout={handleNavigateAbout}
        onNavigateUpload={handleNavigateUpload}
        currentView={currentView}
      />

      <main className="pb-24">
        {currentView === "gallery" && (
          <>
            <CategoryNav
              categories={CATEGORIES}
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
          </>
        )}

        {currentView === "about" && <AboutPage />}

        {currentView === "upload" && (
          <UploadPage onCancel={handleNavigateHome} onSave={handleSaveWalnut} />
        )}
      </main>

      {/* Detail Modal */}
      {selectedWalnut && (
        <WalnutDetailModal
          walnut={selectedWalnut}
          onClose={() => setSelectedWalnut(null)}
        />
      )}
    </div>
  );
}
