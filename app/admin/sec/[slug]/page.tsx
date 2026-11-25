import { redirect } from "next/navigation";

const INFO: Record<string, { titulo: string; desc: string }> = {
  aulas: { titulo: "Aulas", desc: "As aulas são criadas e organizadas dentro de cada curso, em Educação → Cursos → Editar conteúdo." },
  combos: { titulo: "Combo de Treinamentos", desc: "Agrupar vários cursos num pacote com preço único. Entra numa próxima etapa." },
  "certificados-internos": { titulo: "Certificados Internos", desc: "Modelo dos certificados emitidos pela plataforma (já funcional na área do aluno). Personalização de modelo entra numa próxima etapa." },
  "certificados-externos": { titulo: "Certificados Externos", desc: "Registrar certificados feitos fora da plataforma, para centralizar o histórico do aluno. Próxima etapa." },
  restricoes: { titulo: "Restrições", desc: "Regras de pré-requisito e de acesso a cursos (por empresa, plano ou curso anterior). Próxima etapa." },
  vendas: { titulo: "Vendas", desc: "Pedidos e faturamento da venda online de cursos. Depende da etapa de pagamento (Pix, cartão, boleto)." },
  cupons: { titulo: "Cupons", desc: "Cupons de desconto para a venda online. Depende da etapa de pagamento." },
  "uso-planos": { titulo: "Uso dos planos", desc: "Quantas matrículas cada empresa já consumiu do pacote contratado. Próxima etapa." },
  planos: { titulo: "Planos disponíveis", desc: "Cadastro dos pacotes de matrícula vendidos às empresas. Próxima etapa." },
  integracoes: { titulo: "Integrações", desc: "Conexão com meio de pagamento, e-mail e outras ferramentas. Próxima etapa." },
  personalizar: { titulo: "Personalizar", desc: "Logotipo, cores e nome da plataforma. Hoje isso é ajustado no código; a tela de personalização entra numa próxima etapa." },
  blog: { titulo: "Blog", desc: "Publicação de artigos sobre SST para atrair alunos e melhorar o SEO. Próxima etapa." },
  "area-acesso": { titulo: "Área de acesso", desc: "Configuração de login, recuperação de senha e primeiro acesso. Já funcional; a tela de ajustes entra numa próxima etapa." },
  suporte: { titulo: "Suporte ao Aluno", desc: "Canal de atendimento e chamados dos alunos. Próxima etapa." },
  rematriculas: { titulo: "Rematrículas", desc: "Alunos com treinamento perto de vencer, para reciclagem. A validade já é calculada no certificado; os avisos entram numa próxima etapa." },
  validades: { titulo: "Validade dos Treinamentos", desc: "Prazo de cada NR até a reciclagem. Hoje é definido por curso (campo Validade). A central de validades entra numa próxima etapa." },
};

export default async function SecaoAdmin({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const info = INFO[slug];
  if (!info) redirect("/admin");
  return (
    <>
      <h1>{info.titulo}</h1>
      <p className="sub">{info.desc}</p>
      <div className="card pad" style={{ color: "var(--muted)" }}>
        Esta seção faz parte do menu completo e já está no lugar certo. O conteúdo funcional dela
        será construído na etapa indicada acima — o núcleo (cursos, aulas, provas, alunos, matrículas e certificados) já está operando.
      </div>
    </>
  );
}
