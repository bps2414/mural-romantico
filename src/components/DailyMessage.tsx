"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Heart } from "lucide-react";
import { markMessageAsRead } from "@/lib/daily-message-actions";

interface DailyMessageProps {
  message: {
    id: string;
    text: string;
    date: string;
    is_read: boolean;
  } | null;
}

export function DailyMessage({ message }: DailyMessageProps) {
  const [isRevealed, setIsRevealed] = useState(message?.is_read ?? false);
  const [isPending, startTransition] = useTransition();

  // Estado 3: Sem mensagem hoje
  if (!message) {
    return (
      <div className="mx-4 mt-3">
        <div className="daily-empty relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/60 px-5 py-4 text-center">
          <p className="text-sm text-rose-300 font-medium">
            Bryan ainda não escreveu a frase de hoje... 😢
          </p>
        </div>
      </div>
    );
  }

  const handleReveal = () => {
    if (isRevealed) return;

    setIsRevealed(true);
    startTransition(async () => {
      await markMessageAsRead(message.id);
    });
  };

  // Estado 1: Nova mensagem — não lida
  if (!isRevealed) {
    return (
      <div className="mx-4 mt-3">
        <button
          onClick={handleReveal}
          disabled={isPending}
          className="daily-unread group w-full relative overflow-hidden rounded-2xl border border-rose-200 bg-white px-5 py-4 text-center transition-all hover:scale-105 active:scale-95 duration-200 ease-out cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-5 h-5 text-rose-500 group-hover:hidden transition-opacity" />
            <MailOpen className="w-5 h-5 text-rose-500 hidden group-hover:block transition-opacity" />
            <span className="text-sm font-medium text-rose-700">
              💌 Você tem uma frase nova hoje!
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl pointer-events-none daily-glow" />
        </button>
      </div>
    );
  }

  // Estado 2: Mensagem lida — revelar frase
  return (
    <div className="mx-4 mt-3">
      <div className="daily-read relative overflow-hidden rounded-2xl border border-rose-100 bg-white px-6 py-5 text-center">
        <p className="text-lg font-handwriting text-rose-900 leading-relaxed daily-fade-in">
          &ldquo;{message.text}&rdquo;
        </p>
        <p className="mt-2 text-xs text-rose-400 flex items-center justify-center gap-1 daily-fade-in delay-200">
          — Bryan <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
        </p>
      </div>
    </div>
  );
}
