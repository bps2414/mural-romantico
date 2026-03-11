import { setAuthCookie } from "@/app/actions";
import LoginForm from "./LoginForm";

// Segredos configurados no .env.local
const TATA_SECRET = process.env.ROMANTIC_SECRET || "123";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "meu-amor";

export default function LoginPage() {
  
  // Ação de servidor que verifica o segredo fornecido
  async function verifySecret(input: string) {
    "use server";
    const cleanedInput = input.trim().toLowerCase();
    
    // Verifica a senha correspondente e define o cookie
    if (cleanedInput === ADMIN_SECRET.toLowerCase()) {
      await setAuthCookie("admin");
      return true;
    }
    
    if (cleanedInput === TATA_SECRET.toLowerCase()) {
      await setAuthCookie("tata");
      return true;
    }
    
    // Fake delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return false;
  }

  return <LoginForm verifyAction={verifySecret} />;
}
