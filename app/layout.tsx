import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SST Solut — Treinamentos",
  description: "Plataforma de treinamentos de segurança do trabalho",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
