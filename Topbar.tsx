import { lerSessao } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import Link from "next/link";

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
}

export default async function Topbar() {
  const s = await lerSessao();
  return (
    <div className="topbar">
      <Link href={s?.role === "ADMIN" ? "/admin" : "/painel"} className="logo">
        <span className="mark">SST</span>
        <span className="nm">
          SST <b>SOLUT</b>
          <small>CONSULTORIA</small>
        </span>
      </Link>

      {s?.role === "ALUNO" && (
        <nav className="topnav">
          <Link href="/painel">Meus treinamentos</Link>
          <Link href="/certificados">Meus certificados</Link>
        </nav>
      )}

      <div className="spacer" />
      {s && (
        <div className="userchip">
          <span>{s.nome}</span>
          <span className="avatar">{iniciais(s.nome)}</span>
          <form action={logoutAction}>
            <button className="btn ghost sm" type="submit">
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
