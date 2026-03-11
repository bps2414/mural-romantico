"use client";

import { useState, useEffect } from "react";
import { Bell, X, Share, PlusSquare } from "lucide-react";
import { saveSubscription } from "@/lib/push-actions";

const DISMISS_KEY = "push-prompt-dismissed";
const DISMISS_DAYS = 3;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check platforms and PWA status
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
                             ("standalone" in navigator && (navigator as any).standalone === true);
    setIsStandalone(isStandaloneMode);

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const diffDays = (new Date().getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < DISMISS_DAYS) return;
    }

    if (Notification.permission === "denied") return;

    // Show prompt if Push is supported OR if it's iOS not in standalone (fallback to installation promo)
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscribed(true);
          } else {
            setShow(true);
          }
        });
      });
    } else if (isIOSDevice && !isStandaloneMode) {
      // In iOS web (not PWA), Push is generally NOT supported until installed
      setShow(true);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShow(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      });

      await saveSubscription(subscription as any);
      setSubscribed(true);
      setShow(false);
    } catch (err) {
      console.error("Push subscription failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setShow(false);
  };

  // Already subscribed — show subtle confirmation
  if (subscribed) {
    return null;
  }

  if (!show) return null;

  return (
    <div className="mx-4 mt-3 mb-1">
      <div className="relative bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200/50 rounded-2xl p-4 shadow-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-rose-300 hover:text-rose-500 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-200/50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            {(!("PushManager" in window) && isIOS && !isStandalone) ? (
              // iOS non-PWA fallback message
              <>
                <p className="text-sm font-medium text-rose-900 mb-0.5">
                  Instale nosso App! 📱
                </p>
                <p className="text-xs text-rose-600 mb-3 leading-relaxed">
                  Para ativar as notificações e instalar o aplicativo no seu iPhone, toque em <Share className="inline w-3 h-3 text-blue-500 mx-0.5" /> e depois em <strong className="text-rose-800">"Adicionar à Tela de Início"</strong> <PlusSquare className="inline w-3 h-3 mx-0.5" />.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-xl transition-all shadow-sm shadow-rose-500/20"
                  >
                    Entendi!
                  </button>
                </div>
              </>
            ) : (
              // Normal Push subscription
              <>
                <p className="text-sm font-medium text-rose-900 mb-0.5">
                  Quer receber avisos? 💕
                </p>
                <p className="text-xs text-rose-500 mb-3 leading-relaxed">
                  Te aviso quando tiver algo novo pra você aqui no mural!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-rose-500/20"
                  >
                    {loading ? "..." : "Sim, me avisa! 🔔"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 text-xs text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    Agora não
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
