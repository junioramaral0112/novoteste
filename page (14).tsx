import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCursoCompleto, getMatricula, getProgressoIds } from "@/lib/queries";
import Topbar from "@/components/Topbar";
import Player from "./Player";

export default async function CursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await lerSessao();
  if (!s) redirect("/entrar");

  const dados = getCursoCompleto(id);
  if (!dados) redirect("/painel");

  const mat = getMatricula(s.userId, id);
  if (!mat) {
    return (
      <>
        <Topbar />
        <div className="container">
          <div className="card pad">Você não está matriculado neste curso.</div>
        </div>
      </>
    );
  }

  // Se já concluído, mostra atalho para o certificado
  if (mat.status === "CONCLUIDO") {
    const done = [...getProgressoIds(mat.id)];
    return (
      <>
        <Topbar />
        <div className="container">
          <div className="banner">
            Você já concluiu este treinamento.{" "}
            <a href={`/certificado/${mat.id}`}>Ver certificado →</a>
          </div>
          <Player
            cursoId={id}
            codigo={dados.curso.codigo}
            titulo={dados.curso.titulo}
            modulos={dados.modulos}
            matriculaId={mat.id}
            doneInicial={done}
            totalAulas={dados.totalAulas}
          />
        </div>
      </>
    );
  }

  const done = [...getProgressoIds(mat.id)];
  return (
    <>
      <Topbar />
      <div className="container">
        <Player
          cursoId={id}
          codigo={dados.curso.codigo}
          titulo={dados.curso.titulo}
          modulos={dados.modulos}
          matriculaId={mat.id}
          doneInicial={done}
          totalAulas={dados.totalAulas}
        />
      </div>
    </>
  );
}
