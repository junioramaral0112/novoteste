import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function AdminDashboard() {
  const cursos = db.select().from(schema.cursos).all();
  const alunos = db.select().from(schema.users).all().filter((u) => u.role === "ALUNO");
  const empresas = db.select().from(schema.empresas).all();
  const certs = db.select().from(schema.certificados).all();
  const matriculas = db.select().from(schema.matriculas).all();

  const stat = (k: string, v: number) => (
    <div className="card pad" style={{ flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>{k}</div>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{v}</div>
    </div>
  );

  function nomeAluno(id: string) {
    return db.select().from(schema.users).where(eq(schema.users.id, id)).get()?.nome ?? "—";
  }
  function tituloCurso(id: string) {
    return db.select().from(schema.cursos).where(eq(schema.cursos.id, id)).get()?.titulo ?? "—";
  }

  return (
    <>
      <h1>Dashboard de Matrículas</h1>
      <p className="sub">Visão geral da operação em tempo real.</p>
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 22 }}>
        {stat("Matrículas", matriculas.length)}
        {stat("Cursos", cursos.length)}
        {stat("Alunos", alunos.length)}
        {stat("Empresas", empresas.length)}
        {stat("Certificados", certs.length)}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Matrículas recentes</div>
        <table className="atable">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Status</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {matriculas.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ color: "var(--muted)" }}>Nenhuma matrícula ainda.</td>
              </tr>
            ) : (
              matriculas.map((m) => (
                <tr key={m.id}>
                  <td>{nomeAluno(m.userId)}</td>
                  <td>{tituloCurso(m.cursoId)}</td>
                  <td>
                    <span className={`pill ${m.status === "CONCLUIDO" ? "ok" : m.status === "REPROVADO" ? "warn" : "mut"}`}>{m.status}</span>
                  </td>
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
