"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null as { erro?: string } | null);
  return (
    <form action={action}>
      {state?.erro && <div className="err">{state.erro}</div>}
      <div className="field">
        <label>E-mail</label>
        <input name="email" type="email" required placeholder="voce@empresa.com" autoComplete="email" />
      </div>
      <div className="field">
        <label>Senha</label>
        <input name="senha" type="password" required autoComplete="current-password" />
      </div>
      <button className="btn block" type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
