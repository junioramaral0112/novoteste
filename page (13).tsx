import { getCertificadoPorCodigo } from "@/lib/queries";
import Link from "next/link";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function ValidarPage({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  const resultado = codigo ? getCertificadoPorCodigo(codigo) : null;
  const dentroValidade = resultado?.mat.validadeAte ? new Date(resultado.mat.validadeAte) >= new Date() : true;

  return (
    <div className="auth">
      <div className="box" style={{ maxWidth: 520 }}>
        <div className="logo" style={{ justifyContent: "center", marginBottom: 14 }}>
          <span className="mark">SST</span>
          <span className="nm">
            SST <b>SOLUT</b>
          </span>
        </div>
        <h1 style={{ fontSize: 20, textAlign: "center" }}>Validador de Certificado</h1>
        <p className="sub" style={{ textAlign: "center" }}>Digite o código do certificado ou use o QR code.</p>

        <form method="get">
          <div className="field">
            <input name="codigo" defaultValue={codigo || ""} placeholder="Ex.: SST-NR35-2026-AB12C" />
          </div>
          <button className="btn block" type="submit">
            Validar certificado
          </button>
        </form>

        {codigo && (
          <div style={{ marginTop: 18 }}>
            {resultado ? (
              <>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span className={`pill ${dentroValidade ? "ok" : "warn"}`}>
                    {dentroValidade ? "✓ Certificado válido" : "⚠ Certificado vencido"}
                  </span>
                </div>
                <div className="card pad">
                  <Linha k="Aluno" v={resultado.user.nome} />
                  <Linha k="Treinamento" v={`${resultado.curso.codigo} — ${resultado.curso.titulo}`} />
                  <Linha k="Carga horária" v={`${resultado.curso.cargaHoras} horas`} />
                  <Linha k="Conclusão" v={fmt(resultado.mat.concluidoEm)} />
                  <Linha k="Validade" v={fmt(resultado.mat.validadeAte)} />
                  <Linha k="Nota" v={`${resultado.mat.nota}%`} />
                  <Linha k="Emitido por" v="SST Solut Consultoria" />
                </div>
              </>
            ) : (
              <div className="err">Certificado não encontrado. Confira o código digitado.</div>
            )}
          </div>
        )}

        <p className="muted" style={{ marginTop: 16, textAlign: "center" }}>
          <Link href="/entrar">Entrar na plataforma</Link>
        </p>
      </div>
    </div>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--muted)" }}>{k}</span>
      <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}
