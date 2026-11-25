import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import Topbar from "@/components/Topbar";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await lerSessao();
  if (!s) redirect("/entrar");
  if (s.role !== "ADMIN") redirect("/painel");
  return (
    <>
      <Topbar />
      <div className="adminshell">
        <AdminSidebar />
        <main className="adminmain">{children}</main>
      </div>
    </>
  );
}
