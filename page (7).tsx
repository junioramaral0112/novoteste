import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { criarCurso } from "../actions";

export default async function CursosAdmin() {
  const cursos = db.select().from(schema.cursos).all();

  function nAulas(cursoId: string) {
    const mods = db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, cursoId)).all();
    let n = 0;
    for (const m of mods) n += db.select().from(schema.aulas).where(eq(schema.aulas.moduloId, m.id)).all().length;
    return n;
  }

  return (
    <>
      <h1>Cursos</h1>
      <p className="sub">Cada curso tem módulos, aulas (vídeo, slides ou texto) e prova.</p>

      <details className="card pad" style={{ marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>+ Adicionar curso</summary>
        <form action={criarCurso} style={{ marginTop: 14 }}>
          <div className="formgrid">
            <div className="field sm">
              <label>Código (ex.: NR-35)</label>
              <input name="codigo" required />
            </div>
            <div className="field sm" style={{ gridColumn: "span 2" }}>
              <label>Título</label>
              <input name="titulo" required />
            </div>
            <div className="field sm">
              <label>Categoria</label>
              <input name="categoria" defaultValue="NR - Formação" />
            </div>
            <div className="field sm">
              <label>Carga (horas)</label>
              <input name="cargaHoras" type="number" defaultValue={8} />
            </div>
            <div className="field sm">
              <label>Validade (meses)</label>
              <input name="validadeMeses" type="number" defaultValue={24} />
            </div>
            <div className="field sm">
              <label>Cor</label>
              <input name="cor" type="color" defaultValue="#1b3a8f" style={{ height: 42, padding: 4 }} />
            </div>
          </div>
          <button className="btn green" type="submit" style={{ marginTop: 12 }}>
            Criar e editar conteúdo
          </button>
        </form>
      </details>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="atable">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Aulas</th>
              <th>Carga</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ color: "var(--muted)" }}>Nenhum curso. Use &quot;Adicionar curso&quot; acima.</td>
              </tr>
            ) : (
              cursos.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="pill" style={{ background: c.cor || "#1b3a8f", color: "#fff" }}>{c.codigo}</span>
                  </td>
                  <td>
                    <strong>{c.titulo}</strong>
                  </td>
                  <td>{nAulas(c.id)}</td>
                  <td>{c.cargaHoras}h</td>
                  <td>
                    <span className={`pill ${c.publicado ? "ok" : "mut"}`}>{c.publicado ? "Publicado" : "Rascunho"}</span>
                  </td>
                  <td>
                    <Link className="btn ghost sm" href={`/admin/cursos/${c.id}`}>
                      Editar conteúdo
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
