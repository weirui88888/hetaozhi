"use client";

import { Upload } from "lucide-react";
import React from "react";

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateAbout: () => void;
  onNavigateUpload: () => void; // New prop
  currentView: "gallery" | "about" | "upload"; // Added 'upload'
}

const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigateAbout,
  onNavigateUpload,
  currentView,
}) => {
  return (
    <header className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
      <div
        className="text-center sm:text-left cursor-pointer group"
        onClick={onNavigateHome}
      >
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-ink tracking-widest mb-2 group-hover:opacity-80 transition-opacity">
          核桃<span className="text-seal-red">.</span>志
        </h1>
        <p className="text-stone-500 text-sm tracking-[0.3em] uppercase group-hover:text-stone-700 transition-colors">
          The Walnut Collection
        </p>
      </div>

      <div className="flex items-center gap-8">
        {/* About Link */}
        <button
          onClick={currentView === "about" ? onNavigateHome : onNavigateAbout}
          className={`
            text-stone-500 hover:text-walnut transition-colors font-serif tracking-widest text-sm flex items-center gap-2
            ${currentView === "about" ? "text-walnut font-bold" : ""}
          `}
        >
          {currentView === "about" ? "返回雅集" : "关于"}
        </button>

        {/* Upload Button - Minimalist Icon */}
        <button
          onClick={onNavigateUpload}
          className={`
            hover:text-walnut transition-colors p-1
            ${currentView === "upload" ? "text-walnut" : "text-stone-400"}
          `}
          title="上传珍品"
          aria-label="上传珍品"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
