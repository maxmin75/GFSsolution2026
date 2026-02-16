import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const EMAIL_TO = process.env.LEAD_TO_EMAIL ?? "info.gfspreventivi@gmail.com";
const EMAIL_FROM = process.env.LEAD_FROM_EMAIL ?? "info@gfssolutions.it";

type LeadPayload = {
  nome: string;
  cognome: string;
  abitazione: string;
  consumi: string;
  bolletta: string;
  tipologia: string;
  kw: string;
  email: string;
  telefono: string;
};

const formatLine = (label: string, value: string) =>
  `${label}: ${value && value.trim() !== "" ? value : "-"}`;

const buildLeadLines = (body: LeadPayload) => [
  formatLine("Nome", body.nome),
  formatLine("Cognome", body.cognome),
  formatLine("Tipologia impianto", body.tipologia),
  formatLine("Potenza (kW)", body.kw),
  formatLine("Abitazione", body.abitazione),
  formatLine("Consumi annui", body.consumi),
  formatLine("Bolletta", body.bolletta),
  formatLine("Email", body.email),
  formatLine("Telefono", body.telefono),
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadPayload;

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { ok: false, error: "RESEND_API_KEY non configurata" },
        { status: 500 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const leadLines = buildLeadLines(body);
    const subject = `Nuova richiesta preventivo - ${body.nome} ${body.cognome}`.trim();
    const text = [
      "Nuova richiesta dal form GFS Solution",
      "",
      ...leadLines,
    ].join("\n");

    await prisma.lead.create({
      data: {
        nome: body.nome,
        cognome: body.cognome,
        abitazione: body.abitazione || null,
        consumi: body.consumi || null,
        bolletta: body.bolletta || null,
        tipologia: body.tipologia || null,
        kw: body.kw || null,
        email: body.email || null,
        telefono: body.telefono || null,
      },
    });

    const { error } = await resend.emails.send({
      from: `GFS Solution <${EMAIL_FROM}>`,
      to: [EMAIL_TO],
      reply_to: body.email ? body.email : undefined,
      subject,
      text,
    });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (body.email && body.email.trim() !== "") {
      const customerSubject = "Abbiamo ricevuto la tua richiesta";
      const customerText = [
        "Grazie per aver richiesto il nostro parere. Di solito rispondiamo entro una o due ore, al massimo entro 24 ore. GFSsolutions.it",
        "",
        "Dati inviati:",
        ...leadLines,
      ].join("\n");

      const { error: customerError } = await resend.emails.send({
        from: `GFS Solution <${EMAIL_FROM}>`,
        to: [body.email],
        subject: customerSubject,
        text: customerText,
      });

      if (customerError) {
        return Response.json(
          { ok: false, error: customerError.message },
          { status: 500 },
        );
      }
    }

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
