import { PostCard } from "@/components/feed/PostCard";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { TabNavigation } from "@/components/TabNavigation";
import { TimeTogether } from "@/components/TimeTogether";
import { DailyMessage } from "@/components/DailyMessage";
import { LoveJar } from "@/components/LoveJar";
import { PlaylistTab } from "@/components/PlaylistTab";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { LogoutButton } from "@/components/LogoutButton";
import { Heart, Plus } from "lucide-react";
import { getPosts, getNotes } from "@/lib/actions";
import { getDailyMessage } from "@/lib/daily-message-actions";
import { getPhraseCount } from "@/lib/love-jar-actions";
import { getTracks } from "@/lib/playlist-actions";
import { getAuthCookie } from "@/app/actions";
import Link from "next/link";

export default async function FeedPage() {
  const [posts, notes, role, dailyMessage, phraseCount, tracks] = await Promise.all([
    getPosts(),
    getNotes(),
    getAuthCookie(),
    getDailyMessage(),
    getPhraseCount(),
    getTracks(),
  ]);

  const isAdmin = role === "admin";

  const feedContent = (
    <>
      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as any} currentUserRole={role as "tata" | "admin"} />
          ))}
          <div className="py-8 text-center text-rose-300 text-sm font-medium">
            Isso é tudo, meu bem!
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center text-center text-rose-300">
          <Heart className="w-12 h-12 mb-4 opacity-50" strokeWidth={1} />
          <p className="font-heading font-medium text-lg">Mural vazio...</p>
          <p className="text-sm">Ainda não há nenhuma lembrança aqui.</p>
        </div>
      )}
    </>
  );

  const notesContent = (
    <NotesGrid notes={notes} isAdmin={isAdmin} />
  );

  const jarContent = (
    <LoveJar phraseCount={phraseCount} isAdmin={isAdmin} />
  );

  const musicContent = (
    <PlaylistTab tracks={tracks} isAdmin={isAdmin} />
  );

  return (
    <div className="min-h-screen bg-rose-50 pb-20">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex items-center justify-center relative">
        <LogoutButton />
        <h1 className="text-xl font-heading font-semibold text-rose-950 flex items-center gap-2">
          Nosso Mural
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
        </h1>
      </header>

      {/* Time Together Banner */}
      <TimeTogether />

      {/* Daily Message */}
      <DailyMessage message={dailyMessage} />

      {/* Notification Opt-In */}
      <NotificationPrompt />

      {/* Tab Navigation */}
      <TabNavigation feedContent={feedContent} notesContent={notesContent} jarContent={jarContent} musicContent={musicContent} />

      {/* Admin FAB (Floating Action Button) */}
      {isAdmin && (
        <Link 
          href="/admin" 
          className="fixed bottom-24 right-4 z-40 bg-rose-500 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(225,29,72,0.3)] hover:bg-rose-600 active:scale-90 transition-all duration-200 flex items-center justify-center group"
          title="Adicionar conteúdo"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
