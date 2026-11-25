// Autenticação: sessão em cookie assinado (JWT) + verificação de senha.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db, schema } from "./db";
import { eq } from "drizzle-orm";

const COOKIE = "sst_sessao";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "segredo-de-desenvolvimento-troque-em-producao"
);

export type Sessao = { userId: string; role: string; nome: string };

export async function autenticar(email: string, senha: string): Promise<Sessao | null> {
  const user = db.select().from(schema.users).where(eq(schema.users.email, email.trim().toLowerCase())).get();
  if (!user) return null;
  if (!bcrypt.compareSync(senha, user.senhaHash)) return null;
  return { userId: user.id, role: user.role, nome: user.nome };
}

export async function criarSessao(s: Sessao) {
  const token = await new SignJWT(s)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.userId as string, role: payload.role as string, nome: payload.nome as string };
  } catch {
    return null;
  }
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
