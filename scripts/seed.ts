// Popula o banco com dados de exemplo: admin, empresa, aluno e cursos NR.
import { db, schema } from "../lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

function hash(s: string) {
  return bcrypt.hashSync(s, 10);
}

async function main() {
  // Limpa tudo (seed recomeça do zero)
  db.delete(schema.certificados).run();
  db.delete(schema.aulaProgresso).run();
  db.delete(schema.matriculas).run();
  db.delete(schema.questoes).run();
  db.delete(schema.aulas).run();
  db.delete(schema.modulos).run();
  db.delete(schema.cursos).run();
  db.delete(schema.users).run();
  db.delete(schema.empresas).run();

  // Empresa de exemplo
  const empresaId = randomUUID();
  db.insert(schema.empresas)
    .values({
      id: empresaId,
      nome: "Construtora Alvorada Ltda",
      cnpj: "12.345.678/0001-90",
      gestorNome: "Marcos Lima",
      plano: "Plano Empresa 50",
      matriculasTotal: 50,
      matriculasUsadas: 1,
      status: "Ativo",
    })
    .run();

  // Usuários
  db.insert(schema.users)
    .values({
      nome: "Administrador SST Solut",
      email: "admin@sstsolut.com",
      senhaHash: hash("admin123"),
      role: "ADMIN",
    })
    .run();

  const alunoId = randomUUID();
  db.insert(schema.users)
    .values({
      id: alunoId,
      nome: "João Silva",
      email: "joao@exemplo.com",
      cpf: "123.456.789-00",
      senhaHash: hash("aluno123"),
      role: "ALUNO",
      empresaId,
    })
    .run();

  // ---- Cursos ----
  type AulaSeed = { titulo: string; tipo: string; duracao: string; conteudo?: string; videoUrl?: string };
  type ModuloSeed = { titulo: string; aulas: AulaSeed[] };
  type CursoSeed = {
    codigo: string;
    titulo: string;
    cargaHoras: number;
    cor: string;
    modulos: ModuloSeed[];
    questoes: { enunciado: string; opcoes: string[]; correta: number }[];
  };

  const cursos: CursoSeed[] = [
    {
      codigo: "NR-35",
      titulo: "Trabalho em Altura",
      cargaHoras: 8,
      cor: "#3ea845",
      modulos: [
        {
          titulo: "Módulo 1 — Fundamentos",
          aulas: [
            { titulo: "Apresentação do curso", tipo: "VIDEO", duracao: "5 min", videoUrl: "" },
            {
              titulo: "O que diz a NR-35",
              tipo: "SLIDES",
              duracao: "9 min",
              conteudo: JSON.stringify({
                titulo: "O que diz a NR-35",
                topicos: [
                  "Aplica-se a trabalho acima de 2,00 m com risco de queda",
                  "Define responsabilidades do empregador e do trabalhador",
                  "Exige capacitação, Análise de Risco (AR) e Permissão de Trabalho (PT)",
                  "Carga horária mínima de 8 horas",
                ],
              }),
            },
            {
              titulo: "Responsabilidades",
              tipo: "TEXTO",
              duracao: "6 min",
              conteudo:
                "O empregador deve garantir a capacitação dos trabalhadores, fornecer os EPIs adequados e assegurar a supervisão. O trabalhador deve cumprir os procedimentos, usar corretamente os equipamentos e interromper atividades diante de risco grave e iminente.",
            },
          ],
        },
        {
          titulo: "Módulo 2 — Equipamentos",
          aulas: [
            { titulo: "EPIs para trabalho em altura", tipo: "VIDEO", duracao: "12 min", videoUrl: "" },
            {
              titulo: "Sistemas de ancoragem",
              tipo: "SLIDES",
              duracao: "10 min",
              conteudo: JSON.stringify({
                titulo: "Sistemas de ancoragem",
                topicos: [
                  "O ponto de ancoragem deve resistir à carga prevista",
                  "Cinturão tipo paraquedista é obrigatório",
                  "Talabarte com absorvedor de energia",
                  "Inspecione os EPIs antes de cada uso",
                ],
              }),
            },
          ],
        },
      ],
      questoes: [
        { enunciado: "A partir de qual altura a NR-35 se aplica?", opcoes: ["1,80 m", "2,00 m", "3,00 m", "Qualquer altura"], correta: 1 },
        { enunciado: "Qual EPI é obrigatório no trabalho em altura?", opcoes: ["Cinturão abdominal", "Cinturão tipo paraquedista", "Apenas capacete", "Luva isolante"], correta: 1 },
        { enunciado: "A capacitação da NR-35 tem carga horária mínima de:", opcoes: ["4 horas", "6 horas", "8 horas", "16 horas"], correta: 2 },
      ],
    },
    {
      codigo: "NR-06",
      titulo: "Equipamentos de Proteção Individual (EPI)",
      cargaHoras: 4,
      cor: "#1b3a8f",
      modulos: [
        {
          titulo: "Módulo único",
          aulas: [
            { titulo: "O que é EPI", tipo: "VIDEO", duracao: "6 min", videoUrl: "" },
            {
              titulo: "Tipos de EPI",
              tipo: "SLIDES",
              duracao: "9 min",
              conteudo: JSON.stringify({
                titulo: "Tipos de EPI",
                topicos: [
                  "Proteção da cabeça: capacete",
                  "Proteção visual: óculos e protetor facial",
                  "Proteção respiratória: máscaras e respiradores",
                  "Proteção dos membros: luvas, botas, mangotes",
                ],
              }),
            },
            {
              titulo: "Guarda e conservação",
              tipo: "TEXTO",
              duracao: "5 min",
              conteudo:
                "O EPI deve ser higienizado, guardado em local adequado e substituído quando danificado. O trabalhador é responsável pela guarda e conservação, e o empregador pela reposição sempre que necessário.",
            },
          ],
        },
      ],
      questoes: [
        { enunciado: "A quem cabe fornecer o EPI gratuitamente?", opcoes: ["Ao trabalhador", "Ao empregador", "Ao sindicato", "Ao governo"], correta: 1 },
        { enunciado: "O que o CA de um EPI representa?", opcoes: ["Código de Acesso", "Certificado de Aprovação", "Cadastro Anual", "Classe de Atividade"], correta: 1 },
      ],
    },
  ];

  for (const c of cursos) {
    const cursoId = randomUUID();
    db.insert(schema.cursos)
      .values({ id: cursoId, codigo: c.codigo, titulo: c.titulo, cargaHoras: c.cargaHoras, cor: c.cor })
      .run();

    c.questoes.forEach((q, i) => {
      db.insert(schema.questoes)
        .values({ cursoId, enunciado: q.enunciado, opcoes: JSON.stringify(q.opcoes), correta: q.correta, ordem: i })
        .run();
    });

    c.modulos.forEach((m, mi) => {
      const moduloId = randomUUID();
      db.insert(schema.modulos).values({ id: moduloId, cursoId, titulo: m.titulo, ordem: mi }).run();
      m.aulas.forEach((a, ai) => {
        db.insert(schema.aulas)
          .values({
            moduloId,
            titulo: a.titulo,
            tipo: a.tipo,
            duracao: a.duracao,
            conteudo: a.conteudo ?? null,
            videoUrl: a.videoUrl ?? null,
            ordem: ai,
          })
          .run();
      });
    });

    // Matricula o aluno João no primeiro curso (NR-35), em andamento
    if (c.codigo === "NR-35") {
      db.insert(schema.matriculas).values({ userId: alunoId, cursoId, status: "EM_ANDAMENTO" }).run();
    }
  }

  console.log("Seed concluído.");
  console.log("Admin:  admin@sstsolut.com / admin123");
  console.log("Aluno:  joao@exemplo.com / aluno123");
}

main();
