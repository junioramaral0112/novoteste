import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { criarEmpresa } from "../actions";

export default async function EmpresasAdmin() {
  const empresas = db.select().from(schema.empresas).all();

  function usados(empresaId: string) {
    return db.select().from(schema.users).where(eq(schema.users.empresaId, empresaId)).all().length;
  }

  return (
    <>
      <h1>Empresas</h1>
      <p className="sub">Clientes com alunos vinculados e planos de matrícula.</p>

      <details className="card pad" style={{ marginBottom: 18 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>+ Nova empresa</summary>
        <form action={criarEmpresa} style={{ marginTop: 14 }}>
          <div className="formgrid">
            <div className="field sm" style={{ gridColumn: "span 2" }}>
              <label>Nome</label>
              <input name="nome" required />
            </div>
            <div className="field sm">
              <label>CNPJ</label>
              <input name="cnpj" required />
            </div>
            <div className="field sm">
              <label>Gestor responsável</label>
              <input name="gestorNome" />
            </div>
            <div className="field sm">
              <label>Plano</label>
              <input name="plano" defaultValue="Plano Empresa" />
            </div>
            <div className="field sm">
              <label>Matrículas do plano</label>
              <input name="matriculasTotal" type="number" defaultValue={0} />
            </div>
          </div>
          <button className="btn green" type="submit" style={{ marginTop: 12 }}>Criar empresa</button>
        </form>
      </details>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="atable">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>CNPJ</th>
              <th>Gestor</th>
              <th>Plano</th>
              <th>Alunos</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length === 0 ? (
              <tr><td colSpan={5} style={{ color: "var(--muted)" }}>Nenhuma empresa cadastrada.</td></tr>
            ) : (
              empresas.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.nome}</strong></td>
                  <td>{e.cnpj}</td>
                  <td>{e.gestorNome || "—"}</td>
                  <td>{e.plano}</td>
                  <td>{usados(e.id)}{e.matriculasTotal ? ` / ${e.matriculasTotal}` : ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
