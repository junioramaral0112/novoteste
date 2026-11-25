import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/auth";

export default async function Home() {
  const s = await lerSessao();
  if (!s) redirect("/entrar");
  redirect(s.role === "ADMIN" ? "/admin" : "/painel");
}
