import Link from "next/link";

type Opt = { id: string; nome?: string; codigo?: string; titulo?: string };

export default function MatriculaFiltros({
  action,
  alunos,
  cursos,
  v,
}: {
  action: string;
  alunos: Opt[];
  cursos: Opt[];
  v: { aluno?: string; curso?: string; status?: string; de?: string; ate?: string };
}) {
  return (
    <form method="get" action={action} className="card pad" style={{ marginBottom: 18 }}>
      <div className="formgrid">
        <div className="field sm">
          <label>Aluno</label>
          <select name="aluno" defaultValue={v.aluno || ""}>
            <option value="">Todos</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        </div>
        <div className="field sm">
          <label>Curso</label>
          <select name="curso" defaultValue={v.curso || ""}>
            <option value="">Todos</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>{c.codigo} — {c.titulo}</option>
            ))}
          </select>
        </div>
        <div className="field sm">
          <label>Status</label>
          <select name="status" defaultValue={v.status || ""}>
            <option value="">Todos</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="REPROVADO">Reprovado</option>
          </select>
        </div>
        <div className="field sm">
          <label>Data inicial</label>
          <input type="date" name="de" defaultValue={v.de || ""} />
        </div>
        <div className="field sm">
          <label>Data final</label>
          <input type="date" name="ate" defaultValue={v.ate || ""} />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button className="btn" type="submit">Pesquisar</button>
        <Link className="btn ghost" href={action}>Limpar</Link>
      </div>
    </form>
  );
}
