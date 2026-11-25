import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMinhasMatriculas } from "@/lib/queries";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Topbar from "@/components/Topbar";
import Link from "next/link";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function CertificadosPage() {
  const s = await lerSessao();
  if (!s) redirect("/entrar");
  if (s.role === "ADMIN") redirect("/admin");

  const concluidos = getMinhasMatriculas(s.userId).filter((i) => i.matricula.status === "CONCLUIDO");

  return (
    <>
      <Topbar />
      <div className="container">
        <h1>Meus certificados</h1>
        <p className="sub">Certificados emitidos, com QR code de validação.</p>

        {concluidos.length === 0 ? (
          <div className="card pad">
            Você ainda não tem certificados. Conclua um treinamento (aulas + prova) para emiti-lo.{" "}
            <Link href="/painel">Ver meus treinamentos →</Link>
          </div>
        ) : (
          <div className="tablecard card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafbfc", color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Treinamento</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Carga</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}>Validade</th>
                  <th style={{ textAlign: "left", padding: "12px 16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {concluidos.map(({ matricula, curso }) => {
                  const cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, matricula.id)).get();
                  return (
                    <tr key={matricula.id} style={{ borderTop: "1px solid var(--line)", fontSize: 14 }}>
                      <td style={{ padding: "12px 16px" }}>
                        <strong>{curso.codigo}</strong> — {curso.titulo}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{curso.cargaHoras}h</td>
                      <td style={{ padding: "12px 16px" }}>{fmt(matricula.validadeAte)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {cert && (
                          <Link className="btn ghost sm" href={`/certificado/${matricula.id}`}>
                            Ver / baixar
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
