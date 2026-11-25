# Plataforma de Treinamentos — SST Solut

Sistema próprio de treinamentos de segurança do trabalho (EAD), com login de aluno,
cursos com aulas em vídeo/slides/texto, prova, certificado com QR code e validador público.
Construído do zero — é seu, sem depender de plataforma alugada.

Esta é a **primeira versão (MVP)**, com o núcleo do aluno funcionando.

---

## Como rodar no seu computador (passo a passo)

Você precisa ter o **Node.js** instalado (versão 20 ou mais nova) — baixe em https://nodejs.org (opção "LTS").

Depois, abra o terminal na pasta do projeto e rode, uma linha de cada vez:

```bash
npm install        # instala as dependências (só na primeira vez)
npm run setup      # cria o banco de dados e os dados de exemplo (só na primeira vez)
npm run dev        # liga a plataforma
```

Pronto. Abra no navegador: **http://localhost:3000**

### Acessos de teste

- **Aluno:** `joao@exemplo.com` / `aluno123`
- **Administrador:** `admin@sstsolut.com` / `admin123`

Faça o caminho completo como aluno: abra o curso NR-35, conclua as aulas,
faça a prova (acerte para ser aprovado) e emita o certificado. O QR do certificado
abre o **validador público** (também acessível em `/validar`).

---

## O que já está pronto nesta versão

- Login seguro (senha criptografada + sessão)
- Área do aluno: "Meus treinamentos" com progresso
- Player de aula: vídeo, slides e texto, com marcação de conclusão
- Prova final com correção automática (nota mínima 70%)
- Emissão de certificado em PDF (botão imprimir/salvar) com QR code
- Validador público de certificado por código ou QR
- Página inicial de administração (visão geral)

## O que entra nas próximas etapas

- Painel administrativo completo (cadastrar cursos, aulas, provas, alunos)
- Área de empresas e gestores (planos, matrícula em lote, relatórios)
- Upload e hospedagem protegida dos vídeos
- Pagamento online (Pix, cartão, boleto)
- Publicação no seu domínio próprio

---

## Tecnologia

- **Next.js** (React) — front-end e back-end juntos
- **SQLite** (via Drizzle ORM) — banco de dados local, fácil de rodar
- Para **publicar na internet**, troca-se o SQLite por um PostgreSQL online
  (ex.: Neon) e sobe-se na Vercel. Posso te guiar nesse passo.

## Estrutura das pastas

- `app/` — as telas e as rotas
- `lib/` — banco de dados, login e consultas
- `scripts/` — criação de dados de exemplo e teste do fluxo
