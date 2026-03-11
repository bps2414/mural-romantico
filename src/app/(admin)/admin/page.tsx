"use client";

import { useState, useEffect } from "react";
import { uploadImage, createPost, createNote } from "@/lib/admin-actions";
import { createDailyMessage, getDailyMessage } from "@/lib/daily-message-actions";
import { addPhrases, getPhraseCount } from "@/lib/love-jar-actions";
import { addTrack } from "@/lib/playlist-actions";
import { Heart, Upload, Image as ImageIcon, StickyNote, Camera, MessageCircleHeart, Sparkles, Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import imageCompression from "browser-image-compression";

type AdminMode = "photo" | "note" | "daily" | "jar" | "music";

export default function AdminPage() {
  const [mode, setMode] = useState<AdminMode>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const [dailyText, setDailyText] = useState("");
  const [jarText, setJarText] = useState("");
  const [jarCategory, setJarCategory] = useState("motivo");
  const [jarCount, setJarCount] = useState(0);
  const [musicLink, setMusicLink] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [todayMessage, setTodayMessage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getDailyMessage().then((msg) => setTodayMessage(msg));
    getPhraseCount().then((c) => setJarCount(c));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione uma foto nossa ❤️");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.85,
        useWebWorker: true,
      });

      const imageUrl = await uploadImage(compressed);
      if (!imageUrl) throw new Error("Falha ao subir a imagem");

      const success = await createPost(imageUrl, message);
      if (!success) throw new Error("Falha ao criar o post");

      setFile(null);
      setMessage("");
      fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "📸 Foto Nova", body: "Bryan postou uma foto nova!", url: "/" }) }).catch(() => {});
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro amor...");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      setError("Escreva algo na cartinha 💌");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await createNote(noteText);
      if (!success) throw new Error("Falha ao criar a cartinha");

      setNoteText("");
      fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "💌 Cartinha Nova", body: "Bryan deixou uma cartinha pra você!", url: "/" }) }).catch(() => {});
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col p-4 w-full">
      {/* Header with back and logout */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-4 mb-8">
        <div className="relative w-10">
          <LogoutButton />
        </div>
        <button onClick={() => router.push("/")} className="text-sm font-medium text-rose-500 hover:text-rose-600">
          Voltar pro Mural
        </button>
      </header>

      <div className="bg-white max-w-md w-full mx-auto rounded-3xl p-8 shadow-sm border border-rose-100 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
        
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-heading font-medium text-rose-950 mb-1">
          Painel do Bryan
        </h1>
        <p className="text-sm text-rose-800/70 mb-6 text-center">
          O que você quer enviar?
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-1 bg-rose-100/60 rounded-2xl p-1 w-full mb-6">
          <button
            type="button"
            onClick={() => { setMode("photo"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "photo"
                ? "bg-white text-rose-900 shadow-sm"
                : "text-rose-400 hover:text-rose-600"
            }`}
          >
            <Camera className="w-4 h-4" />
            Foto
          </button>
          <button
            type="button"
            onClick={() => { setMode("note"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === "note"
                ? "bg-white text-rose-900 shadow-sm"
                : "text-rose-400 hover:text-rose-600"
            }`}
          >
            <StickyNote className="w-4 h-4" />
            Cartinha
        </button>
        <button
          type="button"
          onClick={() => { setMode("daily"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "daily"
              ? "bg-white text-rose-900 shadow-sm"
              : "text-rose-400 hover:text-rose-600"
          }`}
        >
          <MessageCircleHeart className="w-4 h-4" />
          Frase
        </button>
        <button
          type="button"
          onClick={() => { setMode("jar"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "jar"
              ? "bg-white text-rose-900 shadow-sm"
              : "text-rose-400 hover:text-rose-600"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Potinho
        </button>
        <button
          type="button"
          onClick={() => { setMode("music"); setError(""); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            mode === "music"
              ? "bg-white text-rose-900 shadow-sm"
              : "text-rose-400 hover:text-rose-600"
          }`}
        >
          <Music className="w-4 h-4" />
          Música
        </button>
      </div>

        {/* Photo Form */}
        {mode === "photo" && (
          <form onSubmit={handleSubmitPhoto} className="w-full space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Foto:</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-rose-200 rounded-2xl bg-rose-50/50 cursor-pointer hover:bg-rose-50 transition-colors text-rose-500"
                >
                  {file ? (
                    <span className="text-sm font-medium text-rose-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> {file.name}
                    </span>
                  ) : (
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Escolher Foto
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Mensagem (opcional):</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva algo bonitinho..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white py-3.5 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-rose-500/20 mt-2"
            >
              {loading ? "Enviando Amor..." : "Postar no Mural"}
            </button>
          </form>
        )}

        {/* Note Form */}
        {mode === "note" && (
          <form onSubmit={handleSubmitNote} className="w-full space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Sua cartinha:</label>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escreva uma cartinha de amor..."
                rows={5}
                className="w-full px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200 outline-none focus:ring-2 focus:ring-amber-200 text-gray-700 placeholder:text-amber-300 resize-none font-handwriting text-lg leading-relaxed"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !noteText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 active:scale-95 transition-all text-white py-3.5 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-amber-400/20 mt-2"
            >
              {loading ? "Escrevendo..." : "💌 Colar no Mural"}
            </button>
          </form>
        )}

        {/* Daily Message Form */}
        {mode === "daily" && (
          <div className="w-full space-y-5">
            {todayMessage ? (
              <div className="w-full text-center space-y-3">
                <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
                  <p className="text-sm text-rose-400 mb-1">Frase de hoje:</p>
                  <p className="font-handwriting text-lg text-rose-900">&ldquo;{todayMessage.text}&rdquo;</p>
                </div>
                <p className="text-xs text-rose-300">✅ Já enviou a frase de hoje!</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!dailyText.trim()) { setError("Escreva a frase do dia 💬"); return; }
                setLoading(true);
                setError("");
                try {
                  const result = await createDailyMessage(dailyText);
                  if (!result.success) throw new Error(result.error ?? "Erro");
                  setDailyText("");
                  router.push("/");
                } catch (err: any) {
                  setError(err.message || "Ocorreu um erro...");
                } finally {
                  setLoading(false);
                }
              }} className="w-full space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-rose-900 ml-1">Frase do dia:</label>
                  <textarea
                    value={dailyText}
                    onChange={(e) => setDailyText(e.target.value)}
                    placeholder="Escreva algo especial para a Tata hoje..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 resize-none font-handwriting text-lg"
                  />
                </div>

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !dailyText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white py-3.5 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-rose-500/20 mt-2"
                >
                  {loading ? "Enviando..." : "💬 Enviar Frase do Dia"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Love Jar Form */}
        {mode === "jar" && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!jarText.trim()) { setError("Escreva pelo menos uma frase 🫙"); return; }
            setLoading(true);
            setError("");
            try {
              const result = await addPhrases(jarText, jarCategory);
              if (!result.success) throw new Error("Erro ao adicionar");
              setJarText("");
              setJarCount((prev) => prev + result.count);
              setError("");
            } catch (err: any) {
              setError(err.message || "Ocorreu um erro...");
            } finally {
              setLoading(false);
            }
          }} className="w-full space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">
                Frases (uma por linha):
              </label>
              <textarea
                value={jarText}
                onChange={(e) => setJarText(e.target.value)}
                placeholder={"Eu te amo porque...\nVocê é especial quando...\nLembro de quando..."}
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 resize-none"
              />
            </div>

            <div className="flex gap-2">
              {["motivo", "lembranca", "elogio"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setJarCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    jarCategory === cat
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                  }`}
                >
                  {cat === "motivo" ? "💕 Motivo" : cat === "lembranca" ? "📸 Lembrança" : "✨ Elogio"}
                </button>
              ))}
            </div>

            <p className="text-xs text-rose-300 text-center">
              {jarCount} {jarCount === 1 ? "frase" : "frases"} no potinho
            </p>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !jarText.trim()}
              className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white py-3.5 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-rose-500/20 mt-2"
            >
              {loading ? "Adicionando..." : "🫙 Adicionar ao Potinho"}
            </button>
          </form>
        )}

        {/* Music Form */}
        {mode === "music" && (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!musicLink.trim() || !musicTitle.trim() || !musicArtist.trim()) {
              setError("Preencha todos os campos 🎵");
              return;
            }
            setLoading(true);
            setError("");
            try {
              const result = await addTrack(musicLink, musicTitle, musicArtist);
              if (!result.success) throw new Error(result.error ?? "Erro");
              setMusicLink("");
              setMusicTitle("");
              setMusicArtist("");
              router.push("/");
            } catch (err: any) {
              setError(err.message || "Ocorreu um erro...");
            } finally {
              setLoading(false);
            }
          }} className="w-full space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Link do Spotify:</label>
              <input
                type="text"
                value={musicLink}
                onChange={(e) => setMusicLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Título:</label>
              <input
                type="text"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="Nome da música..."
                className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-rose-900 ml-1">Artista:</label>
              <input
                type="text"
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="Nome do artista..."
                className="w-full px-4 py-3 rounded-2xl bg-rose-50 border border-rose-100 outline-none focus:ring-2 focus:ring-rose-200 text-rose-950 placeholder:text-rose-300 text-sm"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || !musicLink.trim() || !musicTitle.trim() || !musicArtist.trim()}
              className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white py-3.5 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-rose-500/20 mt-2"
            >
              {loading ? "Adicionando..." : "🎵 Adicionar Música"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
