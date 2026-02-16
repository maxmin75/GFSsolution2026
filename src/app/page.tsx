"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";

const SAVINGS_RATE_WITH_STORAGE = 0.85;
const SAVINGS_RATE_NO_STORAGE = 0.74;

const formatEuro = (value: number) =>
  value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export default function Home() {
  const [monthlyBill, setMonthlyBill] = useState(180);
  const [storageMode, setStorageMode] = useState<"with" | "without">("with");

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    abitazione: "",
    consumi: "",
    bolletta: "",
    tipologia: "",
    kw: "",
    email: "",
    telefono: "",
  });
  const [formSent, setFormSent] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStepValid = (step: number) => {
    if (step === 1) {
      return formData.nome.trim() !== "" && formData.cognome.trim() !== "";
    }
    if (step === 2) {
      return formData.tipologia.trim() !== "" && formData.kw.trim() !== "";
    }
    if (step === 3) {
      return true;
    }
    if (step === 4) {
      return (
        formData.email.trim() !== "" &&
        formData.telefono.trim() !== "" &&
        privacyAccepted
      );
    }
    return false;
  };

  const annualCost = useMemo(() => monthlyBill * 12, [monthlyBill]);
  const annualSavingsWithStorage = useMemo(
    () => Math.round(annualCost * SAVINGS_RATE_WITH_STORAGE),
    [annualCost],
  );
  const annualSavingsNoStorage = useMemo(
    () => Math.round(annualCost * SAVINGS_RATE_NO_STORAGE),
    [annualCost],
  );
  const annualSavings =
    storageMode === "with" ? annualSavingsWithStorage : annualSavingsNoStorage;
  const newAnnualCost = useMemo(
    () => Math.max(annualCost - annualSavings, 0),
    [annualCost, annualSavings],
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isStepValid(4)) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Invio non riuscito");
      }
      setFormSent(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invio non riuscito";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-bg min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header>
        <div className="border-b border-[var(--line)] bg-[#4d4d4d]">
          <nav className="mx-auto flex w-full items-center justify-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-[110px] w-[110px]">
                <Image src="/logo.png" alt="GFS Solution" fill className="object-contain" />
              </div>
            </div>
          </nav>
        </div>

        <section className="solar-gradient grain mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p
              className="text-fade-rise text-sm font-semibold uppercase tracking-[0.4em] text-[var(--leaf)]"
              style={{ animationDelay: "0.05s" }}
            >
              Energia solare per la tua casa
            </p>
            <h1
              className="text-fade-rise font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl text-shimmer"
              style={{ animationDelay: "0.15s" }}
            >
              Scopri subito quanto puoi risparmiare
            </h1>
            <p
              className="text-fade-rise mt-4 max-w-xl text-lg text-[var(--ink-muted)]"
              style={{ animationDelay: "0.25s" }}
            >
              Inserisci la tua spesa mensile attuale e ti mostriamo il risparmio
              stimato con un impianto fotovoltaico.
            </p>
            <div
              className="text-fade-rise mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "0.35s" }}
            >
              <a
                href="tel:800684460"
                className="focus-ring rounded-full bg-[#2ecc71] px-7 py-3 text-center text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#27ae60]"
              >
                Numero verde 800 684460
              </a>
              <a
                href="#lead"
                className="focus-ring rounded-full border border-[var(--foreground)] px-7 py-3 text-center text-sm font-semibold transition hover:bg-[var(--foreground)] hover:text-[var(--cream)]"
              >
                Richiedi un preventivo
              </a>
            </div>
            <div className="text-fade-rise mt-10 flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              <span>Padova e provincia</span>
              <span>Progettazione certificata</span>
              <span>Gestione incentivi</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 top-10 h-48 w-48 rounded-full bg-[var(--solar)] opacity-30 blur-3xl" />
            <div className="card-glow relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[var(--sun)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]">
                  Eco-smart
                </span>
              </div>
              <h3 className="mt-4 inline-flex rounded-2xl bg-[var(--sun)] px-4 py-2 font-display text-2xl text-[var(--foreground)]">
                Andamento dei costi nel tempo
              </h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Il fotovoltaico mantiene la spesa bassa, mentre la rete elettrica
                resta alta e crescente.
              </p>
              <svg viewBox="0 0 520 340" className="mt-5 h-56 w-full">
                <defs>
                  <linearGradient id="lineSolar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#2f9e6f" />
                    <stop offset="1" stopColor="#1c7ca6" />
                  </linearGradient>
                  <linearGradient id="lineGrid" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#ffb347" />
                    <stop offset="1" stopColor="#ff7a59" />
                  </linearGradient>
                </defs>
                <rect x="20" y="20" width="480" height="260" rx="22" fill="#f7fbff" />
                {[0, 1, 2, 3, 4].map((row) => (
                  <line
                    key={`grid-row-${row}`}
                    x1="50"
                    y1={60 + row * 45}
                    x2="470"
                    y2={60 + row * 45}
                    stroke="#d9e8df"
                    strokeDasharray="4 10"
                  />
                ))}
                {[0, 1, 2, 3, 4].map((col) => (
                  <line
                    key={`grid-col-${col}`}
                    x1={50 + col * 105}
                    y1="60"
                    x2={50 + col * 105}
                    y2="240"
                    stroke="#e6f0ea"
                  />
                ))}
                <path
                  className="chart-line chart-line-grid"
                  d="M50 220 C100 170, 140 235, 190 160 C240 110, 300 220, 350 145 C400 90, 430 210, 470 130"
                  stroke="url(#lineGrid)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  className="chart-line chart-line-solar"
                  d="M50 210 C140 214, 230 216, 320 214 C390 212, 430 213, 470 212"
                  stroke="url(#lineSolar)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                {[
                  { x: 50, y: 220 },
                  { x: 140, y: 235 },
                  { x: 240, y: 110 },
                  { x: 350, y: 145 },
                  { x: 470, y: 130 },
                ].map((point, index) => (
                  <circle
                    key={`grid-dot-${point.x}`}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#ff8f4f"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="chart-dot"
                    style={{ animationDelay: `${0.4 + index * 0.08}s` }}
                  />
                ))}
                {[
                  { x: 50, y: 210 },
                  { x: 165, y: 214 },
                  { x: 280, y: 216 },
                  { x: 395, y: 213 },
                  { x: 470, y: 212 },
                ].map((point, index) => (
                  <circle
                    key={`solar-dot-${point.x}`}
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#2f9e6f"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="chart-dot"
                    style={{ animationDelay: `${0.7 + index * 0.08}s` }}
                  />
                ))}
                <text x="50" y="270" fill="#6b7b72" fontSize="12">
                  kWh/anno
                </text>
                <text x="420" y="270" fill="#6b7b72" fontSize="12">
                  €/mese
                </text>
                <text
                  x="30"
                  y="55"
                  fill="#6b7b72"
                  fontSize="11"
                  transform="rotate(-90 30 55)"
                >
                  Spesa annua
                </text>
              </svg>
              <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--sun-deep)]" />
                    <span className="text-[var(--ink-muted)]">
                      Rete elettrica (€/mese)
                    </span>
                  </div>
                  <span className="font-semibold">{formatEuro(monthlyBill)} / mese</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--leaf)]" />
                    <span className="text-[var(--ink-muted)]">
                      Fotovoltaico (€/mese)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatEuro(Math.round(newAnnualCost / 12))} / mese
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-[var(--line)] pt-3 text-[var(--foreground)]">
                  <span className="font-semibold">
                    Risparmio fotovoltaico vs rete
                  </span>
                    <span className="font-display text-lg text-shimmer">
                      {formatEuro(Math.round(annualSavings / 12))} / mese
                    </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            title: "Installazione chiavi in mano",
            icon: "🛠️",
            desc:
              "Dalla progettazione all’avvio, seguiamo ogni fase. Tempo stimato di installazione: 20 giorni dalla firma del contratto.",
          },
          {
            title: "Garanzia fino a 25 anni",
            icon: "🛡️",
            desc:
              "Componenti selezionati per durare e proteggere il tuo investimento.",
          },
          {
            title: "Paghi solo a fine lavori",
            icon: "💶",
            desc: "Nessun anticipo: saldi l’intervento solo a installazione completata.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card-glow rounded-2xl border border-[var(--line)] bg-white p-6"
          >
            <div className="text-3xl">{item.icon}</div>
            <h3 className="mt-4 font-display text-xl">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.desc}</p>
          </div>
        ))}
      </section>

      <section id="lead" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="form-spotlight relative overflow-hidden rounded-3xl border border-[#ffd24d] p-3">
          <div className="form-panel grid gap-8 rounded-3xl bg-white p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--leaf)] text-fade-rise">
              Un nostro consulente creerà una offerta dedicata
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-shimmer text-fade-rise">
              Richiedi il tuo preventivo gratuito
            </h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              Compila il modulo e ricevi una valutazione con consumi reali,
              incentivi disponibili e sopralluogo digitale.
            </p>
            <div className="mt-6">
              <div className="relative h-2 w-full overflow-hidden rounded-full border border-[var(--line)] bg-[var(--cream)]">
                <div
                  className="h-full rounded-full bg-[var(--solar)] transition-all duration-300"
                  style={{ width: `${(formStep / 4) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-1">
                  {[1, 2, 3, 4].map((step) => (
                    <span
                      key={`tick-${step}`}
                      className={`h-4 w-[2px] rounded-full ${
                        formStep >= step ? "bg-[var(--foreground)]" : "bg-[var(--line)]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
            {formSent ? (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-6">
                <p className="font-display text-2xl">Richiesta inviata!</p>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">
                  Ti ricontatteremo al più presto con una proposta personalizzata.
                </p>
              </div>
            ) : (
              <>
                {formStep === 1 && (
                  <>
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3 text-base"
                      placeholder="Nome"
                      value={formData.nome}
                      onChange={(event) => handleChange("nome", event.target.value)}
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3 text-base"
                      placeholder="Cognome"
                      value={formData.cognome}
                      onChange={(event) =>
                        handleChange("cognome", event.target.value)
                      }
                    />
                  </>
                )}
                {formStep === 2 && (
                  <>
                    <select
                      className="focus-ring rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base"
                      value={formData.tipologia}
                      onChange={(event) =>
                        handleChange("tipologia", event.target.value)
                      }
                    >
                      <option value="">Tipologia abitazione</option>
                      <option value="casa-singola">Casa singola</option>
                      <option value="bifamiliare">Bifamiliare</option>
                      <option value="appartamento">Appartamento</option>
                    </select>
                    <select
                      className="focus-ring rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base"
                      value={formData.kw}
                      onChange={(event) => handleChange("kw", event.target.value)}
                    >
                      <option value="">kW installati</option>
                      {[2, 3, 4, 5, 6, 7, 8].map((kw) => (
                        <option key={kw} value={`${kw}`}>
                          {kw} kW
                        </option>
                      ))}
                    </select>
                  </>
                )}
                {formStep === 3 && (
                  <>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">
                        Allega la bolletta (immagine)
                      </label>
                      <input
                        className="focus-ring rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base"
                        type="file"
                        accept="image/*"
                      />
                    </div>
                  </>
                )}
                {formStep === 4 && (
                  <>
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3 text-base"
                      placeholder="Email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3 text-base"
                      placeholder="Telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(event) =>
                        handleChange("telefono", event.target.value)
                      }
                    />
                    {submitError ? (
                      <p className="rounded-2xl border border-[#f3b2b2] bg-[#fff4f4] px-4 py-3 text-sm text-[#b42318]">
                        {submitError}
                      </p>
                    ) : null}
                    <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={privacyAccepted}
                        onChange={(event) => setPrivacyAccepted(event.target.checked)}
                        required
                      />
                      <span>
                        Accetto la privacy policy e il trattamento dei dati personali.
                      </span>
                    </label>
                  </>
                )}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={formStep === 1}
                    onClick={() => setFormStep((prev) => Math.max(prev - 1, 1))}
                    className="w-full rounded-full border border-[var(--foreground)] px-5 py-2 text-sm font-semibold disabled:opacity-40 sm:w-auto"
                  >
                    Indietro
                  </button>
                  {formStep < 4 ? (
                    <button
                      type="button"
                      disabled={!isStepValid(formStep)}
                      onClick={() => setFormStep((prev) => Math.min(prev + 1, 4))}
                      className={`w-full rounded-full px-5 py-2 text-sm font-semibold sm:w-auto ${
                        isStepValid(formStep)
                          ? "bg-[var(--foreground)] text-[var(--cream)]"
                          : "cursor-not-allowed bg-[var(--line)] text-[var(--ink-muted)]"
                      }`}
                    >
                      Continua
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isStepValid(4) || isSubmitting}
                      className={`w-full rounded-full px-6 py-2 text-sm font-semibold sm:w-auto ${
                        isStepValid(4) && !isSubmitting
                          ? "bg-[var(--solar)]"
                          : "cursor-not-allowed bg-[var(--line)] text-[var(--ink-muted)]"
                      }`}
                    >
                      {isSubmitting ? "Invio in corso..." : "Richiedi preventivo gratuito"}
                    </button>
                  )}
                </div>
              </>
            )}
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ocean)] text-fade-rise">
              SERVIZI COMPLETI
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-fade-rise">
              Un unico partner per ogni fase
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Consulenza gratuita",
                icon: "💬",
                desc: "Un primo incontro chiaro per capire bisogni, obiettivi e budget.",
              },
              {
                title: "Analisi consumi e sopralluogo digitale",
                icon: "📊",
                desc: "Raccogliamo i dati reali per dimensionare l’impianto in modo preciso.",
              },
              {
                title: "Progettazione impianto personalizzato",
                icon: "📐",
                desc: "Soluzione su misura per massimizzare resa, estetica e risparmio.",
              },
              {
                title: "Installazione certificata",
                icon: "🛠️",
                desc: "Tecnici qualificati e lavori a regola d’arte con tempi certi.",
              },
              {
                title: "Assistenza e manutenzione",
                icon: "🧰",
                desc: "Monitoraggio e supporto continuo per prestazioni sempre ottimali.",
              },
              {
                title: "Gestione incentivi e detrazioni",
                icon: "🧾",
                desc: "Seguiamo tutta la pratica per ottenere bonus e agevolazioni.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-[var(--line)] bg-white p-5"
              >
                <div className="text-2xl text-[var(--leaf)]">{service.icon}</div>
                <p className="mt-3 font-semibold">{service.title}</p>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="simulazione"
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-[1fr_0.9fr]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ocean)] text-fade-rise">
            Simulazione semplice
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-fade-rise">
            Inserisci la tua spesa mensile attuale
          </h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Applichiamo una stima fissa di risparmio del{" "}
            {storageMode === "with" ? "85%" : "74%"}.
          </p>
          <div className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-6">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Sistema d’accumulo</label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStorageMode("with")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    storageMode === "with"
                      ? "bg-[var(--foreground)] text-[var(--cream)]"
                      : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Con accumulo
                </button>
                <button
                  type="button"
                  onClick={() => setStorageMode("without")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    storageMode === "without"
                      ? "bg-[var(--foreground)] text-[var(--cream)]"
                      : "border border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  Senza accumulo
                </button>
              </div>
            </div>
            <label className="text-sm font-semibold">Spesa mensile (€)</label>
            <input
              type="number"
              min={80}
              max={1200}
              value={monthlyBill}
              onChange={(event) => setMonthlyBill(Number(event.target.value))}
              className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
            />
            <input
              type="range"
              min={80}
              max={1200}
              step={10}
              value={monthlyBill}
              onChange={(event) => setMonthlyBill(Number(event.target.value))}
              className="accent-[var(--solar)]"
            />
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
              <span>80€</span>
              <span className="text-[var(--foreground)]">
                {monthlyBill}€
              </span>
              <span>1200€</span>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm">
              Risparmio stimato:{" "}
              <strong>{storageMode === "with" ? "85%" : "74%"}</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="card-glow rounded-3xl border border-[var(--line)] bg-[var(--cream)] p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Risparmio annuo stimato
            </p>
            <p className="mt-4 font-display text-5xl text-shimmer sm:text-6xl">
              {formatEuro(annualSavings)} / anno
            </p>
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              Spesa annua attuale: {formatEuro(annualCost)}
              <span className="mt-2 block text-base font-semibold text-[var(--foreground)]">
                Nuova spesa annua: {formatEuro(newAnnualCost)}
              </span>
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Risparmio mensile
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatEuro(Math.round(annualSavings / 12))}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Risparmio 10 anni
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatEuro(annualSavings * 10)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-[var(--ink-muted)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg text-[var(--foreground)]">
              GFS S.r.l. ©2026
            </p>
            <p>
              Sede Legale: via San Prosdocimo 29, 35030 Cervarese Santa Croce
              (PD)
            </p>
            <p>Pi. IT 050385302 - R.E.A. PD-43819682</p>
            <p>
              web:{" "}
              <a
                href="https://gfssolutions.it"
                className="underline underline-offset-2 hover:text-[var(--foreground)]"
              >
                gfssolutions.it
              </a>
            </p>
            <p>
              mail:{" "}
              <a
                href="mailto:info.gfspreventivi@gmail.com"
                className="underline underline-offset-2 hover:text-[var(--foreground)]"
              >
                info.gfspreventivi@gmail.com
              </a>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://gfssolutions.it/privacy-policy/"
              className="rounded-full border border-[var(--foreground)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-[var(--cream)]"
            >
              Privacy
            </a>
            <a
              href="https://gfssolutions.it/cookie-policy/"
              className="rounded-full border border-[var(--foreground)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-[var(--cream)]"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-full border border-[var(--line)] bg-white px-3 py-2 shadow-lg md:hidden">
        <div className="flex items-center justify-between gap-2">
          <a
            href="#simulazione"
            className="flex-1 rounded-full bg-[var(--foreground)] px-3 py-2 text-center text-xs font-semibold text-[var(--cream)]"
          >
            Calcola risparmio
          </a>
          <a
            href="#lead"
            className="flex-1 rounded-full bg-[var(--solar)] px-3 py-2 text-center text-xs font-semibold text-[var(--foreground)]"
          >
            Consulenza
          </a>
        </div>
      </div>
    </div>
  );
}
