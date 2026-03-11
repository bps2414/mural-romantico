"use client";

import { useState } from "react";
import { Camera, StickyNote, Sparkles, Music } from "lucide-react";

type Tab = "feed" | "cartinhas" | "potinho" | "musicas";

export function TabNavigation({
  feedContent,
  notesContent,
  jarContent,
  musicContent,
}: {
  feedContent: React.ReactNode;
  notesContent: React.ReactNode;
  jarContent?: React.ReactNode;
  musicContent?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("feed");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "feed", label: "Feed", icon: <Camera className="w-4 h-4" /> },
    { key: "cartinhas", label: "Cartinhas", icon: <StickyNote className="w-4 h-4" /> },
    ...(jarContent ? [{ key: "potinho" as Tab, label: "Potinho", icon: <Sparkles className="w-4 h-4" /> }] : []),
    ...(musicContent ? [{ key: "musicas" as Tab, label: "Músicas", icon: <Music className="w-4 h-4" /> }] : []),
  ];

  const contentMap: Record<Tab, React.ReactNode> = {
    feed: feedContent,
    cartinhas: notesContent,
    potinho: jarContent ?? null,
    musicas: musicContent ?? null,
  };

  return (
    <>
      {/* Espaçador para o conteúdo não ficar sob a tab bar fixada */}
      <div className="h-20" />

      {/* Floating Bottom Tab Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="flex gap-1 bg-white/70 backdrop-blur-xl rounded-2xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/50 w-full max-w-md mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-all active:scale-95 duration-200 ease-in-out ${
                activeTab === tab.key
                  ? "bg-rose-50 text-rose-600 shadow-sm"
                  : "text-rose-400 hover:text-rose-600"
              }`}
            >
              <div className={`${activeTab === tab.key ? "scale-110 mb-0.5" : "scale-100"} transition-transform duration-300`}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

