import { createClient } from "@/lib/supabase/client";

export async function uploadImage(file: File) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function createPost(imageUrl: string, message: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase.from('posts').insert({
    image_url: imageUrl,
    message,
    author: 'admin'
  }).select().single();
  
  if (error) {
    console.error("Error creating post:", error);
    return false;
  }
  
  return true;
}

const NOTE_COLORS = ['yellow', 'pink', 'blue', 'mint', 'peach', 'lavender'];

export async function createNote(text: string) {
  const supabase = createClient();
  const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];

  const { error } = await supabase.from('notes').insert({
    text,
    color,
  });

  if (error) {
    console.error("Error creating note:", error);
    return false;
  }

  return true;
}
