"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { concluirAula } from "@/app/actions";

type Aula = { id: string; titulo: string; tipo: string; conteudo: string | null; videoUrl: string | null; duracao: string | null };
type Modulo = { id: string; titulo: string; aulas: Aula[] };

export default function Player({
  cursoId,
  codigo,
  titulo,
  modulos,
  matriculaId,
  doneInicial,
  totalAulas,
}: {
  cursoId: string;
  codigo: string;
  titulo: string;
  modulos: Modulo[];
  matriculaId: string;
  doneInicial: string[];
  totalAulas: number;
}) {
  const flat = modulos.flatMap((m) => m.aulas);
  const [done, setDone] = useState<Set<string>>(new Set(doneInicial));
  const [atual, setAtual] = useState<string>(flat[0]?.id ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();

  const aula = flat.find((a) => a.id === atual) ?? flat[0];
  const idx = flat.findIndex((a) => a.id === aula?.id);
  const todasFeitas = done.size >= totalAulas;

  function marcarConcluida() {
    if (!aula) return;
    start(async () => {
      await concluirAula(matriculaId, aula.id);
      const novo = new Set(done);
      novo.add(aula.id);
      setDone(novo);
      const prox = flat[idx + 1];
      if (prox) setAtual(prox.id);
      router.refresh();
    });
  }

  function renderStage() {
    if (!aula) return null;
    if (aula.tipo === "VIDEO") {
      return (
        <div className="video">
          <div className="play">▶</div>
        </div>
      );
    }
    if (aula.tipo === "SLIDES" && aula.conteudo) {
      try {
        const s = JSON.parse(aula.conteudo) as { titulo: string; topicos: string[] };
        return (
          <div className="slidebox">
            <h2>{s.titulo}</h2>
            <ul>
              {s.topicos.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        );
      } catch {
        /* cai no texto */
      }
    }
    return (
      <div className="slidebox">
        <h2>{aula.titulo}</h2>
        <p style={{ color: "var(--muted)" }}>{aula.conteudo || "Conteúdo da aula."}</p>
      </div>
    );
  }

  const tipoLabel = aula?.tipo === "VIDEO" ? "Aula em vídeo" : aula?.tipo === "SLIDES" ? "Aula em slides" : "Aula em texto";

  return (
    <>
      <Link href="/painel" className="back">
        ← Meus treinamentos
      </Link>
      <div className="crumb">
        {codigo} · {titulo}
      </div>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>{aula?.titulo}</h1>

      <div className="player-wrap">
        <div className="lesson-list">
          {modulos.map((m) => (
            <div key={m.id}>
              <div className="mod-title">{m.titulo}</div>
              {m.aulas.map((a) => {
                const feita = done.has(a.id);
                const ativa = a.id === aula?.id;
                const icon = a.tipo === "VIDEO" ? "▶ vídeo" : a.tipo === "SLIDES" ? "▦ slides" : "≡ texto";
                return (
                  <button key={a.id} className={`lesson ${feita ? "done" : ""} ${ativa ? "active" : ""}`} onClick={() => setAtual(a.id)}>
                    <span className="tick">{feita ? "✓" : ""}</span>
                    <span>{a.titulo}</span>
                    <span className="ltype">
                      {icon} · {a.duracao}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          <div style={{ padding: "14px 15px" }}>
            {todasFeitas ? (
              <Link href={`/prova/${cursoId}`} className="btn green block">
                Fazer prova final
              </Link>
            ) : (
              <button className="btn green block" disabled>
                Conclua todas as aulas
              </button>
            )}
          </div>
        </div>

        <div className="stage">
          {renderStage()}
          <div className="ctrl">
            <span>
              {tipoLabel} · {aula?.duracao}
            </span>
            <span className="spacer" />
            <button className="btn ghost sm" disabled={idx <= 0} onClick={() => setAtual(flat[idx - 1].id)}>
              Anterior
            </button>
            <button className="btn sm" onClick={marcarConcluida} disabled={pending}>
              {done.has(aula?.id ?? "") ? "Concluída ✓" : pending ? "Salvando..." : "Marcar como concluída ✓"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
