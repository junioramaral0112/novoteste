"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = { label: string; href: string };
type Grupo = { ic: string; label: string; href?: string; sub?: Item[] };

const MENU: Grupo[] = [
  { ic: "📊", label: "Relatórios", href: "/admin" },
  {
    ic: "🎓",
    label: "Educação",
    sub: [
      { label: "Cursos", href: "/admin/cursos" },
      { label: "Aulas", href: "/admin/sec/aulas" },
      { label: "Combo de Treinamentos", href: "/admin/sec/combos" },
      { label: "Certificados Internos", href: "/admin/sec/certificados-internos" },
      { label: "Certificados Externos", href: "/admin/sec/certificados-externos" },
    ],
  },
  {
    ic: "👥",
    label: "Usuários e Matrículas",
    sub: [
      { label: "Alunos", href: "/admin/alunos" },
      { label: "Matrículas", href: "/admin/matriculas" },
      { label: "Restrições", href: "/admin/sec/restricoes" },
    ],
  },
  {
    ic: "🛒",
    label: "Vendas",
    sub: [
      { label: "Vendas", href: "/admin/sec/vendas" },
      { label: "Cupons", href: "/admin/sec/cupons" },
    ],
  },
  {
    ic: "🏢",
    label: "Gestores e empresas",
    sub: [
      { label: "Empresas", href: "/admin/empresas" },
      { label: "Uso dos planos", href: "/admin/sec/uso-planos" },
      { label: "Planos disponíveis", href: "/admin/sec/planos" },
    ],
  },
  {
    ic: "⚙️",
    label: "Configurações",
    sub: [
      { label: "Integrações", href: "/admin/sec/integracoes" },
      { label: "Personalizar", href: "/admin/sec/personalizar" },
    ],
  },
  {
    ic: "🔗",
    label: "Acesso",
    sub: [
      { label: "Blog", href: "/admin/sec/blog" },
      { label: "Área de acesso", href: "/admin/sec/area-acesso" },
      { label: "Suporte ao Aluno", href: "/admin/sec/suporte" },
    ],
  },
  {
    ic: "🔄",
    label: "Renovações e Validades",
    sub: [
      { label: "Rematrículas", href: "/admin/sec/rematriculas" },
      { label: "Validade dos Treinamentos", href: "/admin/sec/validades" },
    ],
  },
];

export default function AdminSidebar() {
  const path = usePathname();
  const [abertos, setAbertos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of MENU) if (g.sub?.some((s) => path.startsWith(s.href))) init[g.label] = true;
    return init;
  });

  function toggle(label: string) {
    setAbertos((a) => ({ ...a, [label]: !a[label] }));
  }
  const ativo = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  return (
    <aside className="adminsidebar">
      <nav className="anav">
        {MENU.map((g) =>
          !g.sub ? (
            <Link key={g.label} href={g.href!} className={`agrp ${ativo(g.href!) ? "active" : ""}`}>
              <span className="ic">{g.ic}</span> {g.label}
            </Link>
          ) : (
            <div key={g.label}>
              <button className={`agrp ${abertos[g.label] ? "open" : ""}`} onClick={() => toggle(g.label)}>
                <span className="ic">{g.ic}</span> {g.label}
                <span className="caret">▸</span>
              </button>
              {abertos[g.label] && (
                <div className="asub">
                  {g.sub.map((s) => (
                    <Link key={s.href} href={s.href} className={ativo(s.href) ? "active" : ""}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </nav>
    </aside>
  );
}
