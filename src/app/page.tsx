import { PostCard } from "@/components/feed/PostCard";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { TabNavigation } from "@/components/TabNavigation";
import { TimeTogether } from "@/components/TimeTogether";
import { LogoutButton } from "@/components/LogoutButton";
import { Heart, Plus } from "lucide-react";
import { getPosts, getNotes } from "@/lib/actions";
import { getAuthCookie } from "@/app/actions";
import Link from "next/link";

export default async function FeedPage() {
  const [posts, notes, role] = await Promise.all([
    getPosts(),
    getNotes(),
    getAuthCookie(),
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

  return (
    <div className="min-h-screen bg-rose-50 pb-20">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex items-center justify-center relative">
        <LogoutButton />
        <h1 className="text-xl font-heading font-semibold text-rose-950 flex items-center gap-2">
          Nosso Mural
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
        </h1>
        {isAdmin && (
          <Link href="/admin" className="absolute right-4 p-2 bg-rose-100/50 hover:bg-rose-200 transition-colors rounded-full text-rose-600">
            <Plus className="w-5 h-5" />
          </Link>
        )}
      </header>

      {/* Time Together Banner */}
      <TimeTogether />

      {/* Tab Navigation */}
      <TabNavigation feedContent={feedContent} notesContent={notesContent} />
    </div>
  );
}
