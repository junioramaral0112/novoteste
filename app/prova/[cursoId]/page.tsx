import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCursoCompleto, getMatricula, getProgressoIds } from "@/lib/queries";
import Topbar from "@/components/Topbar";
import Quiz from "./Quiz";

export default async function ProvaPage({ params }: { params: Promise<{ cursoId: string }> }) {
  const { cursoId } = await params;
  const s = await lerSessao();
  if (!s) redirect("/entrar");

  const dados = getCursoCompleto(cursoId);
  if (!dados) redirect("/painel");
  const mat = getMatricula(s.userId, cursoId);
  if (!mat) redirect("/painel");

  const feitas = getProgressoIds(mat.id).size;
  if (feitas < dados.totalAulas) redirect(`/curso/${cursoId}`);

  // Envia apenas enunciado e opções (a correção é feita no servidor)
  const questoes = dados.questoes.map((q) => ({ enunciado: q.enunciado, opcoes: JSON.parse(q.opcoes) as string[] }));

  return (
    <>
      <Topbar />
      <div className="container">
        <Quiz cursoId={cursoId} codigo={dados.curso.codigo} titulo={dados.curso.titulo} questoes={questoes} />
      </div>
    </>
  );
}
