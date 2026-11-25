import { getAlunos, getCursosLista, listarMatriculas } from "@/lib/queries";
import { matricular } from "../actions";
import MatriculaFiltros from "@/components/MatriculaFiltros";

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

export default async function MatriculasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string; curso?: string; status?: string; de?: string; ate?: string }>;
}) {
  const v = await searchParams;
  const alunos = getAlunos();
  const cursos = getCursosLista();
  const lista = listarMatriculas(v);

  return (
    <>
      <h1>Matrículas</h1>
      <p className="sub">Vincule alunos aos cursos, filtre e acompanhe o andamento.</p>

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

      <MatriculaFiltros action="/admin/matriculas" alunos={alunos} cursos={cursos} v={v} />

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="atable">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Início</th>
              <th>Status</th>
              <th>Nota</th>
              <th>Validade</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={6} style={{ color: "var(--muted)" }}>Nenhuma matrícula encontrada para o filtro.</td></tr>
            ) : (
              lista.map(({ matricula: m, alunoNome, curso }) => (
                <tr key={m.id}>
                  <td><strong>{alunoNome}</strong></td>
                  <td>{curso ? `${curso.codigo} — ${curso.titulo}` : "—"}</td>
                  <td>{fmt(m.criadoEm)}</td>
                  <td><span className={`pill ${m.status === "CONCLUIDO" ? "ok" : m.status === "REPROVADO" ? "warn" : "mut"}`}>{m.status}</span></td>
                  <td>{m.nota != null ? `${m.nota}%` : "—"}</td>
                  <td>{fmt(m.validadeAte)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
