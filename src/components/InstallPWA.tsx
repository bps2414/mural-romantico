"use client";

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showiOSPrompt, setShowiOSPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches || 
        ("standalone" in navigator && (navigator as any).standalone === true)) {
      setIsStandalone(true);
      return;
    }

    // iOS detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    // Android/Chrome install prompt listener
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowiOSPrompt(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      // Se clicou e não tem prompt (Pode já estar instalado ou Chrome não liberou)
      alert("Para instalar neste celular, acesse o menu do Chrome e toque em 'Adicionar à tela inicial' ou 'Instalar aplicativo'.");
    }
  };

  if (isStandalone) return null; // Already installed!

  return (
    <div className="mx-4 mt-6 mb-4">
      <button
        onClick={handleInstallClick}
        className="w-full bg-white border-2 border-rose-200 border-dashed hover:border-rose-400 text-rose-700 p-4 rounded-2xl flex items-center gap-4 transition-colors active:scale-95 duration-200 shadow-sm"
      >
        <div className="bg-rose-100 p-3 rounded-full text-rose-600 flex-shrink-0">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-heading font-bold text-base text-rose-800">Instalar Aplicativo</p>
          <p className="text-sm text-rose-500 font-medium">Baixe para a tela de início</p>
        </div>
      </button>

      {/* iOS Manual Install Instructions Dialog */}
      {showiOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm relative mt-4">
            <button
              onClick={() => setShowiOSPrompt(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-semibold text-lg text-rose-950 mb-2">Instalar no iPhone</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Para instalar o Nosso Mural, toque no ícone de Compartilhar <Share className="inline w-4 h-4 text-blue-500 mx-1" /> na barra de navegação e depois escolha <strong>&quot;Adicionar à Tela de Início&quot;</strong> <PlusSquare className="inline w-4 h-4 mx-1" />.
            </p>
            <button
              onClick={() => setShowiOSPrompt(false)}
              className="w-full bg-rose-500 text-white font-medium py-3 rounded-xl hover:bg-rose-600 active:scale-95 transition-all"
            >
              Entendi!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
