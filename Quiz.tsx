"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enviarProva } from "@/app/actions";

type Questao = { enunciado: string; opcoes: string[] };
type Resultado = { aprovado: boolean; pct: number; acertos: number; total: number; matriculaId: string; codigo?: string };

export default function Quiz({ cursoId, codigo, titulo, questoes }: { cursoId: string; codigo: string; titulo: string; questoes: Questao[] }) {
  const [resp, setResp] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string>("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function enviar() {
    if (Object.keys(resp).length < questoes.length) {
      setErro("Responda todas as questões antes de enviar.");
      return;
    }
    setErro("");
    const respostas = questoes.map((_, i) => resp[i]);
    start(async () => {
      const r = await enviarProva(cursoId, respostas);
      if (!r.ok) {
        setErro("Não foi possível enviar. Verifique se concluiu todas as aulas.");
        return;
      }
      setResultado(r as Resultado);
      router.refresh();
    });
  }

  if (resultado) {
    return (
      <div className={`banner ${resultado.aprovado ? "" : "bad"}`} style={{ padding: 22 }}>
        <strong style={{ fontSize: 18 }}>{resultado.aprovado ? "✅ Aprovado!" : "❌ Não atingiu a nota mínima"}</strong>
        <p style={{ margin: "6px 0 12px", color: "var(--muted)" }}>
          Você acertou {resultado.acertos} de {resultado.total} ({resultado.pct}%).
        </p>
        {resultado.aprovado ? (
          <Link className="btn green" href={`/certificado/${resultado.matriculaId}`}>
            Ver certificado 📜
          </Link>
        ) : (
          <button className="btn ghost" onClick={() => { setResultado(null); setResp({}); }}>
            Refazer prova
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <Link href={`/curso/${cursoId}`} className="back">
        ← Voltar ao curso
      </Link>
      <h1 style={{ fontSize: 20 }}>
        Prova final · {codigo} {titulo}
      </h1>
      <p className="sub">Nota mínima para aprovação: 70%.</p>
      {erro && <div className="err">{erro}</div>}
      <div className="card">
        {questoes.map((q, qi) => (
          <div className="q" key={qi}>
            <p className="qt">
              {qi + 1}. {q.enunciado}
            </p>
            {q.opcoes.map((o, oi) => (
              <div key={oi} className={`opt ${resp[qi] === oi ? "sel" : ""}`} onClick={() => setResp({ ...resp, [qi]: oi })}>
                {String.fromCharCode(65 + oi)}) {o}
              </div>
            ))}
          </div>
        ))}
        <div style={{ padding: "18px 20px" }}>
          <button className="btn green" onClick={enviar} disabled={pending}>
            {pending ? "Enviando..." : "Enviar respostas"}
          </button>
        </div>
      </div>
    </>
  );
}
