import { db, schema } from "@/lib/db";
import { getAlunos, getCursosLista, listarMatriculas } from "@/lib/queries";
import MatriculaFiltros from "@/components/MatriculaFiltros";

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string; curso?: string; status?: string; de?: string; ate?: string }>;
}) {
  const v = await searchParams;
  const alunos = getAlunos();
  const cursos = getCursosLista();
  const lista = listarMatriculas(v);
  const certs = db.select().from(schema.certificados).all();

  const stat = (k: string, n: number) => (
    <div className="card pad" style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{k}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{n}</div>
    </div>
  );

  return (
    <>
      <h1>Dashboard de Matrículas</h1>
      <p className="sub">Visão geral da operação. Use os filtros para refinar.</p>

      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 22 }}>
        {stat("Matrículas (filtro)", lista.length)}
        {stat("Cursos", cursos.length)}
        {stat("Alunos", alunos.length)}
        {stat("Certificados", certs.length)}
      </div>

      <MatriculaFiltros action="/admin" alunos={alunos} cursos={cursos} v={v} />

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Matrículas</div>
        <table className="atable">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Início</th>
              <th>Status</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Nenhuma matrícula para o filtro.</td></tr>
            ) : (
              lista.map(({ matricula: m, alunoNome, curso }) => (
                <tr key={m.id}>
                  <td>{alunoNome}</td>
                  <td>{curso ? `${curso.codigo} — ${curso.titulo}` : "—"}</td>
                  <td>{fmt(m.criadoEm)}</td>
                  <td><span className={`pill ${m.status === "CONCLUIDO" ? "ok" : m.status === "REPROVADO" ? "warn" : "mut"}`}>{m.status}</span></td>
                  <td>{m.nota != null ? `${m.nota}%` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
