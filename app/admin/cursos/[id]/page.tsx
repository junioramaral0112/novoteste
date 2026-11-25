import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  atualizarCurso,
  excluirCurso,
  criarModulo,
  excluirModulo,
  criarAula,
  excluirAula,
  criarQuestao,
  excluirQuestao,
} from "../../actions";

export default async function EditarCurso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const curso = db.select().from(schema.cursos).where(eq(schema.cursos.id, id)).get();
  if (!curso) redirect("/admin/cursos");

  const modulos = db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, id)).orderBy(asc(schema.modulos.ordem)).all();
  const questoes = db.select().from(schema.questoes).where(eq(schema.questoes.cursoId, id)).orderBy(asc(schema.questoes.ordem)).all();

  return (
    <>
      <Link href="/admin/cursos" className="back">
        ← Cursos
      </Link>
      <h1>
        {curso.codigo} — {curso.titulo}
      </h1>
      <p className="sub">Edite os dados, monte os módulos e as aulas e configure a prova.</p>

      {/* Dados do curso */}
      <div className="card pad" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Dados do curso</h2>
        <form action={atualizarCurso.bind(null, id)}>
          <div className="formgrid">
            <div className="field sm">
              <label>Código</label>
              <input name="codigo" defaultValue={curso.codigo} />
            </div>
            <div className="field sm" style={{ gridColumn: "span 2" }}>
              <label>Título</label>
              <input name="titulo" defaultValue={curso.titulo} />
            </div>
            <div className="field sm">
              <label>Categoria</label>
              <input name="categoria" defaultValue={curso.categoria ?? ""} />
            </div>
            <div className="field sm">
              <label>Carga (horas)</label>
              <input name="cargaHoras" type="number" defaultValue={curso.cargaHoras ?? 8} />
            </div>
            <div className="field sm">
              <label>Validade (meses)</label>
              <input name="validadeMeses" type="number" defaultValue={curso.validadeMeses ?? 24} />
            </div>
            <div className="field sm">
              <label>Cor</label>
              <input name="cor" type="color" defaultValue={curso.cor ?? "#1b3a8f"} style={{ height: 42, padding: 4 }} />
            </div>
            <div className="field sm">
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" name="publicado" defaultChecked={!!curso.publicado} style={{ width: "auto" }} /> Publicado
              </label>
            </div>
          </div>
          <button className="btn" type="submit" style={{ marginTop: 12 }}>
            Salvar dados
          </button>
        </form>
      </div>

      {/* Módulos e aulas */}
      <div className="card pad" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Módulos e aulas</h2>
        {modulos.length === 0 && <p className="muted">Nenhum módulo ainda. Adicione o primeiro abaixo.</p>}

        {modulos.map((m) => {
          const aulas = db.select().from(schema.aulas).where(eq(schema.aulas.moduloId, m.id)).orderBy(asc(schema.aulas.ordem)).all();
          return (
            <div key={m.id} className="card" style={{ marginBottom: 14, overflow: "hidden" }}>
              <div className="mod-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{m.titulo}</span>
                <form action={excluirModulo.bind(null, m.id, id)}>
                  <button className="btn ghost sm" type="submit">Excluir módulo</button>
                </form>
              </div>
              {aulas.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
                  <span>{a.tipo === "VIDEO" ? "▶" : a.tipo === "SLIDES" ? "▦" : "≡"}</span>
                  <span>{a.titulo}</span>
                  <span className="muted" style={{ marginLeft: "auto" }}>{a.tipo} · {a.duracao}</span>
                  <form action={excluirAula.bind(null, a.id, id)}>
                    <button className="btn ghost sm" type="submit">✕</button>
                  </form>
                </div>
              ))}
              {/* Nova aula */}
              <form action={criarAula.bind(null, m.id, id)} style={{ padding: "12px 15px", background: "#fafbfc" }}>
                <div className="formgrid">
                  <div className="field sm" style={{ gridColumn: "span 2" }}>
                    <label>Nova aula — título</label>
                    <input name="titulo" required />
                  </div>
                  <div className="field sm">
                    <label>Tipo</label>
                    <select name="tipo">
                      <option value="VIDEO">Vídeo</option>
                      <option value="SLIDES">Slides</option>
                      <option value="TEXTO">Texto</option>
                    </select>
                  </div>
                  <div className="field sm">
                    <label>Duração</label>
                    <input name="duracao" placeholder="ex.: 8 min" />
                  </div>
                  <div className="field sm">
                    <label>Link do vídeo (se vídeo)</label>
                    <input name="videoUrl" placeholder="https://..." />
                  </div>
                </div>
                <div className="field sm" style={{ marginTop: 10 }}>
                  <label>Conteúdo (se texto; ou 1 tópico por linha, se slides)</label>
                  <textarea name="conteudo" rows={3} />
                </div>
                <button className="btn green sm" type="submit" style={{ marginTop: 10 }}>+ Adicionar aula</button>
              </form>
            </div>
          );
        })}

        {/* Novo módulo */}
        <form action={criarModulo.bind(null, id)} style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input name="titulo" placeholder="Nome do novo módulo (ex.: Módulo 1 — Fundamentos)" style={{ flex: 1, padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 9 }} />
          <button className="btn" type="submit">+ Novo módulo</button>
        </form>
      </div>

      {/* Prova */}
      <div className="card pad" style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Prova final ({questoes.length} questões · aprovação 70%)</h2>
        {questoes.map((q, qi) => {
          const ops = JSON.parse(q.opcoes) as string[];
          return (
            <div key={q.id} style={{ borderTop: "1px solid var(--line)", padding: "12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{qi + 1}. {q.enunciado}</strong>
                <form action={excluirQuestao.bind(null, q.id, id)}>
                  <button className="btn ghost sm" type="submit">✕</button>
                </form>
              </div>
              <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
                {ops.map((o, oi) => (
                  <li key={oi} style={{ color: oi === q.correta ? "var(--ok)" : "var(--muted)", fontWeight: oi === q.correta ? 600 : 400 }}>
                    {o} {oi === q.correta ? "✓" : ""}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <form action={criarQuestao.bind(null, id)} style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <div className="field sm">
            <label>Nova questão — enunciado</label>
            <input name="enunciado" required />
          </div>
          <div className="formgrid" style={{ marginTop: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div className="field sm" key={i}>
                <label>Opção {String.fromCharCode(65 + i)}</label>
                <input name={`op${i}`} />
              </div>
            ))}
          </div>
          <div className="field sm" style={{ marginTop: 10, maxWidth: 220 }}>
            <label>Qual é a correta?</label>
            <select name="correta">
              <option value="0">A</option>
              <option value="1">B</option>
              <option value="2">C</option>
              <option value="3">D</option>
            </select>
          </div>
          <button className="btn green sm" type="submit" style={{ marginTop: 10 }}>+ Adicionar questão</button>
        </form>
      </div>

      {/* Excluir curso */}
      <form action={excluirCurso.bind(null, id)}>
        <button className="btn ghost" type="submit" style={{ color: "var(--danger)", borderColor: "#f3c9c9" }}>
          Excluir curso
        </button>
      </form>
    </>
  );
}
