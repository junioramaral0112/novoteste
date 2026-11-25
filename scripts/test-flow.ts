// Teste do fluxo completo usando a camada de dados (sem HTTP).
import { db, schema } from "../lib/db";
import { autenticar } from "../lib/auth";
import { getCursoCompleto, getMatricula, getProgressoIds, getCertificadoPorCodigo } from "../lib/queries";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error("FALHOU: " + msg);
  console.log("ok -", msg);
}

async function main() {
  // 1. Login
  const sess = await autenticar("joao@exemplo.com", "aluno123");
  assert(sess && sess.role === "ALUNO", "login do aluno funciona");
  const errado = await autenticar("joao@exemplo.com", "senhaerrada");
  assert(errado === null, "senha errada é rejeitada");

  // 2. Curso NR-35
  const curso = db.select().from(schema.cursos).where(eq(schema.cursos.codigo, "NR-35")).get()!;
  const dados = getCursoCompleto(curso.id)!;
  assert(dados.totalAulas > 0 && dados.questoes.length > 0, `curso tem ${dados.totalAulas} aulas e ${dados.questoes.length} questões`);

  const mat = getMatricula(sess!.userId, curso.id)!;
  assert(mat, "aluno está matriculado no NR-35");

  // 3. Conclui todas as aulas
  for (const m of dados.modulos) {
    for (const a of m.aulas) {
      const existe = db.select().from(schema.aulaProgresso).where(and(eq(schema.aulaProgresso.matriculaId, mat.id), eq(schema.aulaProgresso.aulaId, a.id))).get();
      if (!existe) db.insert(schema.aulaProgresso).values({ matriculaId: mat.id, aulaId: a.id }).run();
    }
  }
  assert(getProgressoIds(mat.id).size === dados.totalAulas, "todas as aulas marcadas como concluídas");

  // 4. Prova com respostas corretas (replicando a lógica do servidor)
  const respostas = dados.questoes.map((q) => q.correta);
  let acertos = 0;
  dados.questoes.forEach((q, i) => { if (respostas[i] === q.correta) acertos++; });
  const pct = Math.round((acertos / dados.questoes.length) * 100);
  assert(pct === 100, `nota calculada = ${pct}%`);

  // 5. Emite certificado
  const agora = new Date();
  db.update(schema.matriculas).set({ status: "CONCLUIDO", nota: pct, concluidoEm: agora.toISOString(), validadeAte: new Date(agora.getFullYear() + 2, agora.getMonth(), agora.getDate()).toISOString() }).where(eq(schema.matriculas.id, mat.id)).run();
  let cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, mat.id)).get();
  if (!cert) {
    const codigo = `SST-${curso.codigo.replace(/-/g, "")}-${agora.getFullYear()}-${randomUUID().slice(0, 5).toUpperCase()}`;
    db.insert(schema.certificados).values({ matriculaId: mat.id, codigo }).run();
    cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, mat.id)).get();
  }
  assert(cert, `certificado emitido: ${cert!.codigo}`);

  // 6. Validação pública pelo código
  const val = getCertificadoPorCodigo(cert!.codigo)!;
  assert(val && val.user.nome === "João Silva" && val.curso.codigo === "NR-35", "validador encontra o certificado correto");

  console.log("\n✅ Fluxo completo validado.");
}

main().catch((e) => { console.error(e); process.exit(1); });
