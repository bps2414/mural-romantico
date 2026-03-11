"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleLike(postId: string) {
  const supabase = await createClient();

  // First check if already liked (in this simple version, anyone can add a row,
  // to make it true "toggle" for the whole app we just add or remove a like row.
  // For simplicity since there's no real User session, we just insert a like 
  // and we'll rely on local state to prevent spam if we want.
  
  const { error } = await supabase.from('likes').insert({ post_id: postId })
  
  if (error) {
    console.error("Error toggling like:", error)
    return false;
  }
  
  return true;
}

import { getAuthCookie } from "@/app/actions";

export async function addComment(postId: string, text: string) {
  const supabase = await createClient();
  const role = await getAuthCookie();
  
  if (!role) return null;
  const authorName = role === "admin" ? "Bryan" : "Tata";
  
  const { data, error } = await supabase.from('comments').insert({
    post_id: postId,
    text,
    author: authorName
  }).select().single();
  
  if (error) {
    console.error("Error adding comment:", error)
    return null;
  }
  
  return data;
}

export async function getPosts() {
  const supabase = await createClient();
  
  // We fetch posts, and we can also fetch likes and comments counts if we do a join
  // but for simplicity we'll fetch them and then map counts.
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      likes:likes(count),
      comments:comments(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error)
    return [];
  }
  
  return data;
}

export async function getComments(postId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error)
    return [];
  }
  
  return data;
}

export async function deletePost(postId: string) {
  const role = await getAuthCookie();
  if (role !== "admin") return false;

  const supabase = await createClient();

  // Get the post to find the image path
  const { data: post } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', postId)
    .single();

  // Delete related likes and comments first (foreign key constraints)
  await supabase.from('likes').delete().eq('post_id', postId);
  await supabase.from('comments').delete().eq('post_id', postId);

  // Delete the post
  const { error } = await supabase.from('posts').delete().eq('id', postId);

  if (error) {
    console.error("Error deleting post:", error);
    return false;
  }

  // Remove image from storage if it exists
  if (post?.image_url) {
    try {
      const url = new URL(post.image_url);
      const path = url.pathname.split('/images/').pop();
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }
    } catch {
      // Ignore storage cleanup errors
    }
  }

  return true;
}

export async function getNotes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  return data;
}

export async function deleteNote(noteId: string) {
  const role = await getAuthCookie();
  if (role !== "admin") return false;

  const supabase = await createClient();

  const { error } = await supabase.from('notes').delete().eq('id', noteId);

  if (error) {
    console.error("Error deleting note:", error);
    return false;
  }

  return true;
}
