import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { matricular } from "../actions";

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

export default async function MatriculasAdmin() {
  const matriculas = db.select().from(schema.matriculas).all();
  const alunos = db.select().from(schema.users).all().filter((u) => u.role === "ALUNO");
  const cursos = db.select().from(schema.cursos).all();

  const nome = (id: string) => db.select().from(schema.users).where(eq(schema.users.id, id)).get()?.nome ?? "—";
  const curso = (id: string) => db.select().from(schema.cursos).where(eq(schema.cursos.id, id)).get();

  return (
    <>
      <h1>Matrículas</h1>
      <p className="sub">Vincule alunos aos cursos e acompanhe o andamento.</p>

      <details className="card pad" style={{ marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>+ Matricular aluno</summary>
        <form action={matricular} style={{ marginTop: 14 }}>
          <div className="formgrid">
            <div className="field sm">
              <label>Aluno</label>
              <select name="userId" required>
                <option value="">— selecione —</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
            <div className="field sm">
              <label>Curso</label>
              <select name="cursoId" required>
                <option value="">— selecione —</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>{c.codigo} — {c.titulo}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn green" type="submit" style={{ marginTop: 12 }}>Matricular</button>
        </form>
      </details>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="atable">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Status</th>
              <th>Nota</th>
              <th>Validade</th>
            </tr>
          </thead>
          <tbody>
            {matriculas.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Nenhuma matrícula.</td></tr>
            ) : (
              matriculas.map((m) => {
                const c = curso(m.cursoId);
                return (
                  <tr key={m.id}>
                    <td><strong>{nome(m.userId)}</strong></td>
                    <td>{c ? `${c.codigo} — ${c.titulo}` : "—"}</td>
                    <td><span className={`pill ${m.status === "CONCLUIDO" ? "ok" : m.status === "REPROVADO" ? "warn" : "mut"}`}>{m.status}</span></td>
                    <td>{m.nota != null ? `${m.nota}%` : "—"}</td>
                    <td>{fmt(m.validadeAte)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
