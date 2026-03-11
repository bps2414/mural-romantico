"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("Tem certeza que quer sair?")) return;
    await logout();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute left-4 p-2 bg-rose-100/50 hover:bg-rose-200 transition-colors rounded-full text-rose-500"
      title="Sair da conta"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
