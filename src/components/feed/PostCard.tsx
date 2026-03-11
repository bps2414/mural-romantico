"use client";

import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { toggleLike, addComment, getComments, deletePost } from "@/lib/actions";
import { useRouter } from "next/navigation";

export interface PostProps {
  id: string;
  image_url: string;
  message: string;
  created_at: string;
  author: string;
  likes: { role: string }[];
  comments: { count: number }[];
}

export function PostCard({ post, currentUserRole }: { post: PostProps, currentUserRole: "tata" | "admin" }) {
  const initialLiked = post.likes ? post.likes.some(l => l.role === currentUserRole) : false;
  const initialLikesCount = post.likes ? post.likes.length : 0;

  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [commentsCount, setCommentsCount] = useState(post.comments?.[0]?.count || 0);
  
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Tem certeza que quer apagar essa lembrança?")) return;
    setDeleting(true);
    const ok = await deletePost(post.id);
    if (ok) {
      setDeleted(true);
      router.refresh();
    } else {
      setDeleting(false);
    }
  };

  if (deleted) return null;

  // Format date
  const dateObj = new Date(post.created_at);
  const dateStr = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const handleLike = async () => {
    // Optimistic toggle
    const newHasLiked = !hasLiked;
    setHasLiked(newHasLiked);
    setLikesCount((prev) => newHasLiked ? prev + 1 : prev - 1);
    
    const ok = await toggleLike(post.id);
    if (!ok) {
      // Revert if failed
      setHasLiked(!newHasLiked);
      setLikesCount((prev) => !newHasLiked ? prev + 1 : prev - 1);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && commentsList.length === 0) {
      setLoadingComments(true);
      const comments = await getComments(post.id);
      setCommentsList(comments);
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = newComment;
    setNewComment("");
    
    const myName = currentUserRole === "admin" ? "Bryan" : "Tata";

    // Optimistic UI update
    const optimisticComment = {
      id: Math.random().toString(),
      text: tempComment,
      author: myName,
      created_at: new Date().toISOString()
    };
    
    setCommentsList((prev) => [...prev, optimisticComment]);
    setCommentsCount((prev) => prev + 1);

    const saved = await addComment(post.id, tempComment);
    if (!saved) {
      // Revert if failed (simplified logic)
      setCommentsList((prev) => prev.filter(c => c.id !== optimisticComment.id));
      setCommentsCount((prev) => prev - 1);
      setNewComment(tempComment);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden flex flex-col mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 font-bold font-heading">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-medium text-rose-950 leading-tight">
              {post.author === 'admin' ? 'Bryan' : post.author}
            </span>
            <span className="text-xs text-rose-400 capitalize">{dateStr}</span>
          </div>
        </div>
        {currentUserRole === "admin" && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-3 -mr-2 rounded-full text-rose-300 hover:text-red-500 hover:bg-red-50 active:scale-95 transition-all duration-200 disabled:opacity-50"
            title="Excluir post"
          >
            <Trash2 className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Image Area */}
      <div className="w-full bg-rose-50 relative border-y border-rose-50 flex items-center justify-center text-rose-300">
        {post.image_url ? (
          <img src={post.image_url} alt="Nossa foto" className="w-full h-auto block rounded-none" />
        ) : (
          <span className="text-sm py-20">Imagem não encontrada</span>
        )}
      </div>

      {/* Actions (Like & Comment) */}
      <div className="px-3 py-2 flex items-center gap-2">
        <button 
          onClick={handleLike}
          className="flex items-center justify-center gap-1.5 text-rose-950 group transition-transform active:scale-90 duration-200 p-2 min-h-[44px]"
        >
          <Heart 
            className={`w-7 h-7 transition-colors ${hasLiked ? 'fill-rose-500 text-rose-500' : 'group-active:fill-rose-500 group-active:text-rose-500'}`} 
            strokeWidth={1.5} 
          />
          <span className="font-medium text-[15px]">{likesCount}</span>
        </button>
        <button 
          onClick={handleToggleComments}
          className="flex items-center justify-center gap-1.5 text-rose-950 group transition-transform active:scale-90 duration-200 p-2 min-h-[44px]"
        >
          <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
          <span className="font-medium text-[15px]">{commentsCount}</span>
        </button>
      </div>

      {/* Message Area */}
      {post.message && (
        <div className="px-5 pb-4">
          <p className="text-rose-900 leading-relaxed text-[15px]">
            <span className="font-heading font-semibold mr-2">
              {post.author === 'admin' ? 'Bryan' : post.author}
            </span>
            {post.message}
          </p>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-5 pt-2 border-t border-rose-50 animate-in fade-in slide-in-from-top-2">
          {loadingComments ? (
            <p className="text-xs text-rose-400 py-2">Carregando comentários...</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
              {commentsList.map((c) => {
                const isMine = (c.author === "Tata" && currentUserRole === "tata") || (c.author === "Bryan" && currentUserRole === "admin");
                return (
                  <div key={c.id} className="text-[14px] leading-tight flex gap-2">
                    <span className="font-heading font-semibold text-rose-900 shrink-0">
                      {isMine ? 'Você' : c.author}
                    </span>
                    <span className="text-rose-800 break-words">{c.text}</span>
                  </div>
                );
              })}
              {commentsList.length === 0 && (
                <p className="text-xs text-rose-400 italic">Nenhum comentário ainda.</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitComment} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 bg-rose-50 rounded-full px-4 py-2 text-sm text-rose-900 placeholder:text-rose-400 outline-none focus:ring-1 focus:ring-rose-200 border border-transparent focus:border-rose-200 transition-all"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="text-rose-500 font-medium text-sm px-2 disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
