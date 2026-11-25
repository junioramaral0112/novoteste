import { lerSessao } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getMatriculaPorId, getUser } from "@/lib/queries";
import Topbar from "@/components/Topbar";
import PrintButton from "./PrintButton";
import QRCode from "qrcode";
import Link from "next/link";

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function CertificadoPage({ params }: { params: Promise<{ matriculaId: string }> }) {
  const { matriculaId } = await params;
  const s = await lerSessao();
  if (!s) redirect("/entrar");

  const mat = getMatriculaPorId(matriculaId);
  if (!mat) redirect("/painel");
  if (mat.userId !== s.userId && s.role !== "ADMIN") redirect("/painel");
  if (mat.status !== "CONCLUIDO") redirect(`/curso/${mat.cursoId}`);

  const curso = db.select().from(schema.cursos).where(eq(schema.cursos.id, mat.cursoId)).get()!;
  const user = getUser(mat.userId)!;
  const cert = db.select().from(schema.certificados).where(eq(schema.certificados.matriculaId, mat.id)).get();
  if (!cert) redirect(`/curso/${mat.cursoId}`);

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const urlValidacao = `${proto}://${host}/validar?codigo=${cert.codigo}`;
  const qr = await QRCode.toDataURL(urlValidacao, { margin: 1, width: 200 });

  return (
    <>
      <Topbar />
      <div className="container">
        <Link href="/painel" className="back">
          ← Voltar
        </Link>
        <div className="cert">
          <div className="band" />
          <div className="inner">
            <h2>Certificado de Conclusão</h2>
            <p className="line">Certificamos que</p>
            <div className="name">{user.nome}</div>
            <p className="line">concluiu com aproveitamento o treinamento</p>
            <div className="course">
              {curso.codigo} — {curso.titulo}
            </div>
            <p className="line">
              com carga horária de <strong>{curso.cargaHoras} horas</strong>, em conformidade com a Norma Regulamentadora vigente.
            </p>
            <p className="line">
              Conclusão: {fmt(mat.concluidoEm)} · Validade: {fmt(mat.validadeAte)} · Nota: {mat.nota}%
            </p>
            <div className="foot">
              <div className="qrbox">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR de validação" width={92} height={92} />
                <div className="code">{cert.codigo}</div>
              </div>
              <div className="sig">
                Responsável Técnico
                <br />
                <span style={{ color: "var(--muted)", fontSize: 12 }}>Eng. de Segurança · CREA 000000</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <PrintButton />
        </div>
      </div>
    </>
  );
}
