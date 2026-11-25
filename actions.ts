"use server";

import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { lerSessao } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

async function exigirAdmin() {
  const s = await lerSessao();
  if (!s || s.role !== "ADMIN") redirect("/entrar");
  return s;
}

/* -------- Cursos -------- */
export async function criarCurso(formData: FormData) {
  await exigirAdmin();
  const codigo = String(formData.get("codigo") || "").trim();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!codigo || !titulo) return;
  const rows = db
    .insert(schema.cursos)
    .values({
      codigo,
      titulo,
      categoria: String(formData.get("categoria") || "NR - Formação"),
      cargaHoras: Number(formData.get("cargaHoras") || 8),
      cor: String(formData.get("cor") || "#1b3a8f"),
      validadeMeses: Number(formData.get("validadeMeses") || 24),
    })
    .returning({ id: schema.cursos.id })
    .all();
  revalidatePath("/admin/cursos");
  redirect(`/admin/cursos/${rows[0].id}`);
}

export async function atualizarCurso(id: string, formData: FormData) {
  await exigirAdmin();
  db.update(schema.cursos)
    .set({
      codigo: String(formData.get("codigo") || ""),
      titulo: String(formData.get("titulo") || ""),
      categoria: String(formData.get("categoria") || ""),
      cargaHoras: Number(formData.get("cargaHoras") || 8),
      cor: String(formData.get("cor") || "#1b3a8f"),
      validadeMeses: Number(formData.get("validadeMeses") || 24),
      publicado: formData.get("publicado") === "on",
    })
    .where(eq(schema.cursos.id, id))
    .run();
  revalidatePath(`/admin/cursos/${id}`);
}

export async function excluirCurso(id: string) {
  await exigirAdmin();
  db.delete(schema.cursos).where(eq(schema.cursos.id, id)).run();
  revalidatePath("/admin/cursos");
  redirect("/admin/cursos");
}

/* -------- Módulos / Aulas -------- */
export async function criarModulo(cursoId: string, formData: FormData) {
  await exigirAdmin();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;
  const n = db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, cursoId)).all().length;
  db.insert(schema.modulos).values({ cursoId, titulo, ordem: n }).run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

export async function excluirModulo(moduloId: string, cursoId: string) {
  await exigirAdmin();
  db.delete(schema.modulos).where(eq(schema.modulos.id, moduloId)).run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

export async function criarAula(moduloId: string, cursoId: string, formData: FormData) {
  await exigirAdmin();
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;
  const tipo = String(formData.get("tipo") || "VIDEO");
  const n = db.select().from(schema.aulas).where(eq(schema.aulas.moduloId, moduloId)).all().length;
  let conteudo: string | null = null;
  const texto = String(formData.get("conteudo") || "").trim();
  if (tipo === "SLIDES") {
    const topicos = texto.split("\n").map((t) => t.trim()).filter(Boolean);
    conteudo = JSON.stringify({ titulo, topicos });
  } else if (tipo === "TEXTO") {
    conteudo = texto;
  }
  db.insert(schema.aulas)
    .values({
      moduloId,
      titulo,
      tipo,
      duracao: String(formData.get("duracao") || ""),
      videoUrl: tipo === "VIDEO" ? String(formData.get("videoUrl") || "") : null,
      conteudo,
      ordem: n,
    })
    .run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

export async function excluirAula(aulaId: string, cursoId: string) {
  await exigirAdmin();
  db.delete(schema.aulas).where(eq(schema.aulas.id, aulaId)).run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

/* -------- Questões -------- */
export async function criarQuestao(cursoId: string, formData: FormData) {
  await exigirAdmin();
  const enunciado = String(formData.get("enunciado") || "").trim();
  const opcoes = [0, 1, 2, 3].map((i) => String(formData.get(`op${i}`) || "").trim()).filter(Boolean);
  if (!enunciado || opcoes.length < 2) return;
  const correta = Number(formData.get("correta") || 0);
  const n = db.select().from(schema.questoes).where(eq(schema.questoes.cursoId, cursoId)).all().length;
  db.insert(schema.questoes).values({ cursoId, enunciado, opcoes: JSON.stringify(opcoes), correta, ordem: n }).run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

export async function excluirQuestao(id: string, cursoId: string) {
  await exigirAdmin();
  db.delete(schema.questoes).where(eq(schema.questoes.id, id)).run();
  revalidatePath(`/admin/cursos/${cursoId}`);
}

/* -------- Alunos / Empresas / Matrículas -------- */
export async function criarAluno(formData: FormData) {
  await exigirAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const senha = String(formData.get("senha") || "").trim();
  if (!nome || !email || !senha) return;
  const existe = db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  if (existe) return;
  const empresaId = String(formData.get("empresaId") || "");
  db.insert(schema.users)
    .values({
      nome,
      email,
      cpf: String(formData.get("cpf") || ""),
      senhaHash: bcrypt.hashSync(senha, 10),
      role: "ALUNO",
      empresaId: empresaId || null,
    })
    .run();
  revalidatePath("/admin/alunos");
}

export async function criarEmpresa(formData: FormData) {
  await exigirAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const cnpj = String(formData.get("cnpj") || "").trim();
  if (!nome || !cnpj) return;
  const existe = db.select().from(schema.empresas).where(eq(schema.empresas.cnpj, cnpj)).get();
  if (existe) return;
  db.insert(schema.empresas)
    .values({
      nome,
      cnpj,
      gestorNome: String(formData.get("gestorNome") || ""),
      plano: String(formData.get("plano") || "Plano Empresa"),
      matriculasTotal: Number(formData.get("matriculasTotal") || 0),
    })
    .run();
  revalidatePath("/admin/empresas");
}

export async function matricular(formData: FormData) {
  await exigirAdmin();
  const userId = String(formData.get("userId") || "");
  const cursoId = String(formData.get("cursoId") || "");
  if (!userId || !cursoId) return;
  const existe = db
    .select()
    .from(schema.matriculas)
    .where(and(eq(schema.matriculas.userId, userId), eq(schema.matriculas.cursoId, cursoId)))
    .get();
  if (!existe) db.insert(schema.matriculas).values({ userId, cursoId }).run();
  revalidatePath("/admin/matriculas");
}
