"use server";

import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { autenticar, criarSessao, encerrarSessao, lerSessao } from "@/lib/auth";
import { getCursoCompleto, getMatricula, getProgressoIds } from "@/lib/queries";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "");
  const senha = String(formData.get("senha") || "");
  const sessao = await autenticar(email, senha);
  if (!sessao) return { erro: "E-mail ou senha incorretos." };
  await criarSessao(sessao);
  redirect(sessao.role === "ADMIN" ? "/admin" : "/painel");
}

export async function logoutAction() {
  await encerrarSessao();
  redirect("/entrar");
}

export async function concluirAula(matriculaId: string, aulaId: string) {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false };
  const mat = db.select().from(schema.matriculas).where(eq(schema.matriculas.id, matriculaId)).get();
  if (!mat || mat.userId !== sessao.userId) return { ok: false };
  const existe = db
    .select()
    .from(schema.aulaProgresso)
    .where(and(eq(schema.aulaProgresso.matriculaId, matriculaId), eq(schema.aulaProgresso.aulaId, aulaId)))
    .get();
  if (!existe) {
    db.insert(schema.aulaProgresso).values({ matriculaId, aulaId }).run();
  }
  revalidatePath(`/curso/${mat.cursoId}`);
  return { ok: true };
}

export async function enviarProva(cursoId: string, respostas: number[]) {
  const sessao = await lerSessao();
  if (!sessao) return { ok: false as const };
  const mat = getMatricula(sessao.userId, cursoId);
  if (!mat) return { ok: false as const };
  const dados = getCursoCompleto(cursoId);
  if (!dados) return { ok: false as const };

  // Exige todas as aulas concluídas
  const feitas = getProgressoIds(mat.id);
  if (feitas.size < dados.totalAulas) return { ok: false as const, motivo: "aulas_incompletas" };

  let acertos = 0;
  dados.questoes.forEach((q, i) => {
    if (respostas[i] === q.correta) acertos++;
  });
  const total = dados.questoes.length;
  const pct = total ? Math.round((acertos / total) * 100) : 0;
  const aprovado = pct >= 70;

  if (aprovado) {
    const agora = new Date();
    const validade = new Date(agora);
    validade.setMonth(validade.getMonth() + (dados.curso.validadeMeses || 24));
    db.update(schema.matriculas)
      .set({ status: "CONCLUIDO", nota: pct, concluidoEm: agora.toISOString(), validadeAte: validade.toISOString() })
      .where(eq(schema.matriculas.id, mat.id))
      .run();

    // Emite certificado (se ainda não existe)
    let cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, mat.id)).get();
    if (!cert) {
      const codigo = `SST-${dados.curso.codigo.replace(/-/g, "")}-${agora.getFullYear()}-${randomUUID().slice(0, 5).toUpperCase()}`;
      db.insert(schema.certificados).values({ matriculaId: mat.id, codigo }).run();
      cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, mat.id)).get();
    }
    revalidatePath("/painel");
    return { ok: true as const, aprovado, pct, acertos, total, matriculaId: mat.id, codigo: cert!.codigo };
  } else {
    db.update(schema.matriculas).set({ status: "REPROVADO", nota: pct }).where(eq(schema.matriculas.id, mat.id)).run();
    return { ok: true as const, aprovado, pct, acertos, total, matriculaId: mat.id };
  }
}
