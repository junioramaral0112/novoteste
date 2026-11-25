// Consultas ao banco de dados usadas pelas telas.
import { db, schema } from "./db";
import { eq, and, asc } from "drizzle-orm";

export function getCursoCompleto(cursoId: string) {
  const curso = db.select().from(schema.cursos).where(eq(schema.cursos.id, cursoId)).get();
  if (!curso) return null;
  const mods = db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, cursoId)).orderBy(asc(schema.modulos.ordem)).all();
  const modulos = mods.map((m) => ({
    ...m,
    aulas: db.select().from(schema.aulas).where(eq(schema.aulas.moduloId, m.id)).orderBy(asc(schema.aulas.ordem)).all(),
  }));
  const questoes = db.select().from(schema.questoes).where(eq(schema.questoes.cursoId, cursoId)).orderBy(asc(schema.questoes.ordem)).all();
  const totalAulas = modulos.reduce((n, m) => n + m.aulas.length, 0);
  return { curso, modulos, questoes, totalAulas };
}

export function getMatricula(userId: string, cursoId: string) {
  return db
    .select()
    .from(schema.matriculas)
    .where(and(eq(schema.matriculas.userId, userId), eq(schema.matriculas.cursoId, cursoId)))
    .get();
}

export function getMatriculaPorId(id: string) {
  return db.select().from(schema.matriculas).where(eq(schema.matriculas.id, id)).get();
}

export function getProgressoIds(matriculaId: string): Set<string> {
  const rows = db.select().from(schema.aulaProgresso).where(eq(schema.aulaProgresso.matriculaId, matriculaId)).all();
  return new Set(rows.map((r) => r.aulaId));
}

export function getMinhasMatriculas(userId: string) {
  const mats = db.select().from(schema.matriculas).where(eq(schema.matriculas.userId, userId)).all();
  return mats.map((mat) => {
    const curso = db.select().from(schema.cursos).where(eq(schema.cursos.id, mat.cursoId)).get()!;
    const mods = db.select().from(schema.modulos).where(eq(schema.modulos.cursoId, mat.cursoId)).all();
    let totalAulas = 0;
    for (const m of mods) {
      totalAulas += db.select().from(schema.aulas).where(eq(schema.aulas.moduloId, m.id)).all().length;
    }
    const feitas = getProgressoIds(mat.id).size;
    const pct = mat.status === "CONCLUIDO" ? 100 : totalAulas ? Math.round((feitas / totalAulas) * 100) : 0;
    return { matricula: mat, curso, totalAulas, feitas, pct };
  });
}

export function getUser(userId: string) {
  return db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
}

export function getCertificadoPorCodigo(codigo: string) {
  const cert = db.select().from(schema.certificados).where(eq(schema.certificados.codigo, codigo.trim().toUpperCase())).get();
  if (!cert) return null;
  const mat = getMatriculaPorId(cert.matriculaId);
  if (!mat) return null;
  const curso = db.select().from(schema.cursos).where(eq(schema.cursos.id, mat.cursoId)).get()!;
  const user = getUser(mat.userId)!;
  return { cert, mat, curso, user };
}
