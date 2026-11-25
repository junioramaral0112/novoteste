// Esquema do banco de dados (tabelas) usando Drizzle ORM.
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID());

const agora = () =>
  text("criadoEm").$defaultFn(() => new Date().toISOString());

export const empresas = sqliteTable("empresas", {
  id: id(),
  nome: text("nome").notNull(),
  cnpj: text("cnpj").notNull().unique(),
  gestorNome: text("gestorNome"),
  plano: text("plano").default("Plano Empresa"),
  matriculasTotal: integer("matriculasTotal").default(0),
  matriculasUsadas: integer("matriculasUsadas").default(0),
  status: text("status").default("Ativo"),
  criadoEm: agora(),
});

export const users = sqliteTable("users", {
  id: id(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  cpf: text("cpf"),
  senhaHash: text("senhaHash").notNull(),
  role: text("role").notNull().default("ALUNO"), // ALUNO | ADMIN
  empresaId: text("empresaId"),
  criadoEm: agora(),
});

export const cursos = sqliteTable("cursos", {
  id: id(),
  codigo: text("codigo").notNull(),
  titulo: text("titulo").notNull(),
  categoria: text("categoria").default("NR - Formação"),
  cargaHoras: integer("cargaHoras").default(8),
  cor: text("cor").default("#1b3a8f"),
  validadeMeses: integer("validadeMeses").default(24),
  publicado: integer("publicado", { mode: "boolean" }).default(true),
  criadoEm: agora(),
});

export const modulos = sqliteTable("modulos", {
  id: id(),
  cursoId: text("cursoId").notNull(),
  titulo: text("titulo").notNull(),
  ordem: integer("ordem").default(0),
});

export const aulas = sqliteTable("aulas", {
  id: id(),
  moduloId: text("moduloId").notNull(),
  titulo: text("titulo").notNull(),
  tipo: text("tipo").notNull().default("VIDEO"), // VIDEO | TEXTO | SLIDES
  conteudo: text("conteudo"),
  videoUrl: text("videoUrl"),
  duracao: text("duracao").default(""),
  ordem: integer("ordem").default(0),
});

export const questoes = sqliteTable("questoes", {
  id: id(),
  cursoId: text("cursoId").notNull(),
  enunciado: text("enunciado").notNull(),
  opcoes: text("opcoes").notNull(), // JSON: ["A","B","C","D"]
  correta: integer("correta").notNull(),
  ordem: integer("ordem").default(0),
});

export const matriculas = sqliteTable("matriculas", {
  id: id(),
  userId: text("userId").notNull(),
  cursoId: text("cursoId").notNull(),
  status: text("status").notNull().default("EM_ANDAMENTO"), // EM_ANDAMENTO | CONCLUIDO | REPROVADO
  nota: integer("nota"),
  concluidoEm: text("concluidoEm"),
  validadeAte: text("validadeAte"),
  criadoEm: agora(),
});

export const aulaProgresso = sqliteTable("aulaProgresso", {
  id: id(),
  matriculaId: text("matriculaId").notNull(),
  aulaId: text("aulaId").notNull(),
  concluidaEm: agora(),
});

export const certificados = sqliteTable("certificados", {
  id: id(),
  matriculaId: text("matriculaId").notNull().unique(),
  codigo: text("codigo").notNull().unique(),
  emitidoEm: agora(),
});
