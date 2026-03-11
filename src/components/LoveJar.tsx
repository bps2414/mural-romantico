"use client";

import { useState, useTransition } from "react";
import { drawPhrase } from "@/lib/love-jar-actions";
import { Heart } from "lucide-react";

interface LoveJarProps {
  phraseCount: number;
}

export function LoveJar({ phraseCount }: LoveJarProps) {
  const [currentPhrase, setCurrentPhrase] = useState<{
    phrase: string;
    category: string;
  } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDraw = () => {
    if (isPending || isRevealing) return;

    setIsRevealing(true);
    setCurrentPhrase(null);

    startTransition(async () => {
      const phrase = await drawPhrase();
      // Delay reveal for animation
      setTimeout(() => {
        setCurrentPhrase(
          phrase ? { phrase: phrase.phrase, category: phrase.category } : null
        );
        setIsRevealing(false);
      }, 600);
    });
  };

  const categoryLabels: Record<string, string> = {
    motivo: "Motivo pra te amar",
    lembranca: "Uma lembrança",
    elogio: "Um elogio",
  };

  // Empty jar
  if (phraseCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="text-5xl mb-4">🫙</div>
        <p className="text-sm text-rose-300 font-medium">
          O potinho está vazio...
        </p>
        <p className="text-xs text-rose-200 mt-1">
          Peça ao Bryan para enchê-lo 💕
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 px-6">
      {/* Glassmorphism Jar */}
      <div className="jar-glass relative w-40 h-48 flex items-center justify-center mb-6">
        {/* Jar SVG */}
        <svg
          viewBox="0 0 120 160"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Jar body */}
          <path
            d="M25 45 Q20 45 18 55 L15 130 Q15 150 35 150 L85 150 Q105 150 105 130 L102 55 Q100 45 95 45 Z"
            fill="rgba(255, 228, 230, 0.3)"
            stroke="rgba(244, 63, 94, 0.3)"
            strokeWidth="1.5"
            className="jar-body"
          />
          {/* Jar neck */}
          <rect
            x="30"
            y="30"
            width="60"
            height="18"
            rx="4"
            fill="rgba(255, 228, 230, 0.4)"
            stroke="rgba(244, 63, 94, 0.25)"
            strokeWidth="1"
          />
          {/* Jar lid */}
          <rect
            x="26"
            y="24"
            width="68"
            height="10"
            rx="5"
            fill="rgba(244, 63, 94, 0.15)"
            stroke="rgba(244, 63, 94, 0.3)"
            strokeWidth="1"
          />

          {/* Dynamic Hearts inside container */}
          {/* We use a max of 40 visual hearts to keep performance, but the text counter shows the real number */}
          {Array.from({ length: Math.min(phraseCount, 40) }).map((_, i) => {
            // Psuedo-random deterministic positions based on index
            const x = 30 + ((i * 13) % 60); 
            const finalY = 145 - ((i * 3) % 40) - Math.floor(i / 10) * 8;
            const size = 10 + (i % 6);
            const rot = -15 + ((i * 27) % 30);
            
            // Generate some falling ones if recently mounted/added, else just rest at bottom
            const delay = (i % 5) * 0.2; // in seconds
            
            return (
              <text 
                key={i}
                x={x} 
                y={finalY} 
                fontSize={size} 
                className="jar-paper-heart"
                style={{ 
                  transformOrigin: `${x}px ${finalY}px`,
                  "--rot": `${rot}deg`,
                  animation: `paperDrop 1.2s cubic-bezier(0.25, 1, 0.5, 1) ${delay}s both`
                } as React.CSSProperties}
              >
                {i % 3 === 0 ? "💗" : i % 2 === 0 ? "❤️" : "💕"}
              </text>
            );
          })}
        </svg>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-rose-200/20 blur-2xl -z-10" />
      </div>

      {/* Phrase count */}
      <p className="text-xs text-rose-300 mb-4">
        {phraseCount} {phraseCount === 1 ? "frase" : "frases"} no potinho
      </p>

      {/* Draw button */}
      <button
        onClick={handleDraw}
        disabled={isPending || isRevealing}
        className="group relative px-8 py-3.5 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white rounded-2xl font-medium shadow-lg shadow-rose-500/25 disabled:opacity-60 disabled:active:scale-100"
      >
        <span className="flex items-center gap-2">
          {isPending || isRevealing ? (
            <>
              <Heart className="w-4 h-4 animate-spin" />
              Sorteando...
            </>
          ) : (
            <>✨ Sortear um Dengo</>
          )}
        </span>
      </button>

      {/* Revealed phrase */}
      {currentPhrase && (
        <div className="mt-6 w-full max-w-sm jar-unfold">
          <div className="bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
            <span className="inline-block text-[10px] uppercase tracking-wider text-rose-300 font-medium bg-rose-50 px-2.5 py-0.5 rounded-full mb-3">
              {categoryLabels[currentPhrase.category] || "Dengo"}
            </span>
            <p className="text-lg font-handwriting text-rose-900 leading-relaxed">
              &ldquo;{currentPhrase.phrase}&rdquo;
            </p>
            <p className="mt-3 text-xs text-rose-300 flex items-center justify-center gap-1">
              — Bryan{" "}
              <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
            </p>
          </div>
        </div>
      )}

      {/* No phrase found (all drawn recently) */}
      {!currentPhrase && !isRevealing && !isPending && currentPhrase === null && (
        <div className="mt-4 text-center">
          <p className="text-xs text-rose-200">
            Clique no botão para sortear 💕
          </p>
        </div>
      )}
    </div>
  );
}
