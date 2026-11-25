import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { criarAluno } from "../actions";

export default async function AlunosAdmin() {
  const alunos = db.select().from(schema.users).all().filter((u) => u.role === "ALUNO");

  function nCursos(userId: string) {
    return db.select().from(schema.matriculas).where(eq(schema.matriculas.userId, userId)).all().length;
  }

  return (
    <>
      <h1>Alunos</h1>
      <p className="sub">Colaboradores que acessam os treinamentos.</p>

      <details className="card pad" style={{ marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>+ Novo aluno</summary>
        <form action={criarAluno} style={{ marginTop: 14 }}>
          <div className="formgrid">
            <div className="field sm">
              <label>Nome</label>
              <input name="nome" required />
            </div>
            <div className="field sm">
              <label>E-mail</label>
              <input name="email" type="email" required />
            </div>
            <div className="field sm">
              <label>CPF</label>
              <input name="cpf" />
            </div>
            <div className="field sm">
              <label>Senha inicial</label>
              <input name="senha" required />
            </div>
          </div>
          <button className="btn green" type="submit" style={{ marginTop: 12 }}>Criar aluno</button>
        </form>
      </details>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="atable">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cursos</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr><td colSpan={3} style={{ color: "var(--muted)" }}>Nenhum aluno cadastrado.</td></tr>
            ) : (
              alunos.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.nome}</strong></td>
                  <td>{a.email}</td>
                  <td>{nCursos(a.id)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
