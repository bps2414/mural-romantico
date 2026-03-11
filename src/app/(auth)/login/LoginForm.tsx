"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock } from "lucide-react";

// Client component so we can use state & Framer Motion if desired later
export default function LoginForm({ verifyAction }: { verifyAction: (secret: string) => Promise<boolean> }) {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const success = await verifyAction(secret);
    
    if (success) {
      router.push("/");
    } else {
      setError(true);
      setSecret("");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-rose-50 text-center">
      <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-sm w-full bg-white px-8 py-10 rounded-3xl shadow-sm border border-rose-100">
        
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-medium tracking-tight text-rose-950">
            Acesso Restrito
          </h1>
          <p className="text-sm text-rose-800/70">
            Qual é a nossa senha secreta?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 mt-2">
          <div className="space-y-2">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Digite o segredo..."
              className={`w-full px-4 py-3 rounded-2xl bg-rose-50 border transition-all outline-none focus:ring-2 focus:ring-rose-200 text-center text-rose-950 placeholder:text-rose-300 font-medium ${
                error ? "border-red-300 animate-shake" : "border-rose-100"
              }`}
              disabled={loading}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 animate-in fade-in">
                Ops... senha incorreta. Tente novamente!
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white py-3 rounded-2xl font-medium disabled:opacity-50 disabled:active:scale-100 shadow-sm shadow-rose-500/20"
          >
            {loading ? "Entrando..." : "Entrar no Cantinho"}
            {!loading && <Heart className="w-4 h-4 fill-white flex-shrink-0" />}
          </button>
        </form>
      </div>
    </div>
  );
}
