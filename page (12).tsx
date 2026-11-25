import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMinhasMatriculas } from "@/lib/queries";
import Topbar from "@/components/Topbar";
import Link from "next/link";

export default async function PainelPage() {
  const s = await lerSessao();
  if (!s) redirect("/entrar");
  if (s.role === "ADMIN") redirect("/admin");

  const itens = getMinhasMatriculas(s.userId);
  const primeiroNome = s.nome.split(/\s+/)[0];

  return (
    <>
      <Topbar />
      <div className="container">
        <h1>Olá, {primeiroNome} 👋</h1>
        <p className="sub">Seus treinamentos de segurança do trabalho.</p>

        {itens.length === 0 ? (
          <div className="card pad">Você ainda não está matriculado em nenhum curso.</div>
        ) : (
          <div className="courses">
            {itens.map(({ matricula, curso, pct }) => {
              const label = pct === 100 ? "Ver certificado" : pct === 0 ? "Começar" : "Continuar";
              return (
                <div className="ccard" key={matricula.id}>
                  <div className="thumb" style={{ background: `linear-gradient(135deg, ${curso.cor}, #0e1a33)` }}>
                    {curso.codigo}
                  </div>
                  <div className="body">
                    <h3>{curso.titulo}</h3>
                    <div className="meta">
                      {curso.codigo} · {curso.cargaHoras}h
                    </div>
                    <div className="progress">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <div className="pct">{pct}% concluído</div>
                    <div style={{ marginTop: "auto" }}>
                      <Link className="btn sm block" href={`/curso/${curso.id}`}>
                        {label}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
