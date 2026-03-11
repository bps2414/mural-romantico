"use client";

import { useState } from "react";
import { Camera, StickyNote } from "lucide-react";

type Tab = "feed" | "cartinhas";

export function TabNavigation({
  feedContent,
  notesContent,
}: {
  feedContent: React.ReactNode;
  notesContent: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  return (
    <>
      {/* Tab Bar */}
      <div className="flex gap-1 bg-rose-100/60 rounded-2xl p-1 mx-4 mt-4 mb-2">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "feed"
              ? "bg-white text-rose-900 shadow-sm"
              : "text-rose-400 hover:text-rose-600"
          }`}
        >
          <Camera className="w-4 h-4" />
          Feed
        </button>
        <button
          onClick={() => setActiveTab("cartinhas")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "cartinhas"
              ? "bg-white text-rose-900 shadow-sm"
              : "text-rose-400 hover:text-rose-600"
          }`}
        >
          <StickyNote className="w-4 h-4" />
          Cartinhas
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto p-4 pt-2">
        {activeTab === "feed" ? feedContent : notesContent}
      </div>
    </>
  );
}
