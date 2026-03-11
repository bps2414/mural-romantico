"use server";

import { cookies } from "next/headers";

export type Role = "tata" | "admin" | null;

export async function setAuthCookie(role: "tata" | "admin") {
  const cookieStore = await cookies();
  cookieStore.set("mural_auth_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<Role> {
  const cookieStore = await cookies();
  const role = cookieStore.get("mural_auth_role")?.value;
  if (role === "tata" || role === "admin") return role;
  return null;
}
