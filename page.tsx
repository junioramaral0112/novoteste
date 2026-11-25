import LoginForm from "./LoginForm";
import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EntrarPage() {
  const s = await lerSessao();
  if (s) redirect(s.role === "ADMIN" ? "/admin" : "/painel");
  return (
    <div className="auth">
      <div className="box">
        <div className="logo" style={{ justifyContent: "center", marginBottom: 18 }}>
          <span className="mark">SST</span>
          <span className="nm">
            SST <b>SOLUT</b>
          </span>
        </div>
        <h1 style={{ fontSize: 20, textAlign: "center" }}>Entrar</h1>
        <p className="sub" style={{ textAlign: "center" }}>Acesse seus treinamentos</p>
        <LoginForm />
        <p className="muted" style={{ marginTop: 18, textAlign: "center" }}>
          Valide um certificado em <Link href="/validar">validação pública</Link>.
        </p>
        <p className="muted" style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
          Teste — aluno: <b>joao@exemplo.com</b> / aluno123 · admin: <b>admin@sstsolut.com</b> / admin123
        </p>
      </div>
    </div>
  );
}
