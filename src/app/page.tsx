"use client";

import { useMemo, useState, type FormEvent } from "react";

const SAVINGS_RATE = 0.85;

const formatEuro = (value: number) =>
  value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export default function Home() {
  const [monthlyBill, setMonthlyBill] = useState(180);

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    abitazione: "",
    consumi: "",
    bolletta: "",
    email: "",
    telefono: "",
  });
  const [formSent, setFormSent] = useState(false);

  const annualCost = useMemo(() => monthlyBill * 12, [monthlyBill]);
  const annualSavings = useMemo(
    () => Math.round(annualCost * SAVINGS_RATE),
    [annualCost],
  );
  const newAnnualCost = useMemo(
    () => Math.max(annualCost - annualSavings, 0),
    [annualCost, annualSavings],
  );

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="solar-gradient grain border-b border-[var(--line)]">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--foreground)] text-[var(--cream)] font-semibold">
              GF
            </div>
            <div>
              <p className="font-display text-lg">GFS Solution 2026</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                Fotovoltaico Intelligente
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#simulazione"
              className="rounded-full border border-[var(--foreground)] px-5 py-2 text-sm font-semibold transition hover:bg-[var(--foreground)] hover:text-[var(--cream)]"
            >
              Calcola il tuo risparmio
            </a>
            <a
              href="#lead"
              className="rounded-full bg-[var(--solar)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] shadow-lg transition hover:bg-[var(--solar-deep)]"
            >
              Richiedi una consulenza
            </a>
          </div>
        </nav>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--leaf)]">
              Energia solare per la tua casa
            </p>
            <h1 className="font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
              Scopri subito quanto puoi risparmiare
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[var(--ink-muted)]">
              Inserisci la tua spesa mensile attuale e ti mostriamo il risparmio
              stimato con un impianto fotovoltaico.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#simulazione"
                className="focus-ring rounded-full bg-[var(--foreground)] px-7 py-3 text-center text-sm font-semibold text-[var(--cream)] transition hover:translate-y-[-1px]"
              >
                Vai al simulatore
              </a>
              <a
                href="#lead"
                className="focus-ring rounded-full border border-[var(--foreground)] px-7 py-3 text-center text-sm font-semibold transition hover:bg-[var(--foreground)] hover:text-[var(--cream)]"
              >
                Richiedi una consulenza
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              <span>Padova e provincia</span>
              <span>Progettazione certificata</span>
              <span>Gestione incentivi</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-10 top-10 h-48 w-48 rounded-full bg-[var(--solar)] opacity-30 blur-3xl" />
            <div className="card-glow relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6">
              <svg viewBox="0 0 520 420" className="h-64 w-full">
                <defs>
                  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#1a3552" />
                    <stop offset="1" stopColor="#0f1f33" />
                  </linearGradient>
                </defs>
                <rect x="40" y="40" width="440" height="260" rx="20" fill="#13263f" />
                <g opacity="0.8">
                  {[0, 1, 2, 3].map((row) => (
                    <g key={row}>
                      {[0, 1, 2, 3].map((col) => (
                        <rect
                          key={`${row}-${col}`}
                          x={70 + col * 95}
                          y={70 + row * 55}
                          width="80"
                          height="40"
                          rx="6"
                          fill="url(#panel)"
                          stroke="#25466b"
                        />
                      ))}
                    </g>
                  ))}
                </g>
                <circle cx="420" cy="70" r="35" fill="#f6b416" />
                <path
                  d="M80 340c60-25 140-20 200 5 70 30 130 20 200-10"
                  stroke="#1f7a57"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              </svg>
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--ink-muted)]">
                <span>Monitoraggio produzione in tempo reale</span>
                <span className="rounded-full bg-[var(--leaf)] px-3 py-1 text-[var(--cream)]">
                  Eco-smart
                </span>
              </div>
            </div>
          </div>
        </section>
      </header>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-3">
        {[
          {
            title: "Installazione chiavi in mano",
            icon: "⚡",
            desc: "Dalla progettazione all’avvio, seguiamo ogni fase.",
          },
          {
            title: "Tecnici certificati",
            icon: "🛠️",
            desc: "Squadre specializzate con standard di sicurezza elevati.",
          },
          {
            title: "Garanzia fino a 25 anni",
            icon: "🛡️",
            desc: "Componenti selezionati per durare e proteggere il tuo investimento.",
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

      <section
        id="simulazione"
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-[1fr_0.9fr]"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ocean)]">
            Simulazione semplice
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">
            Inserisci la tua spesa mensile attuale
          </h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            Applichiamo una stima fissa di risparmio del 85%.
          </p>
          <div className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-white p-6">
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
              Risparmio stimato: <strong>85%</strong>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="card-glow rounded-3xl border border-[var(--line)] bg-[var(--cream)] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Risultato principale
            </p>
            <p className="mt-3 font-display text-4xl">
              {formatEuro(annualSavings)} / anno
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Spesa annua attuale: {formatEuro(annualCost)} · Nuova spesa annua:
              {" "}
              {formatEuro(newAnnualCost)}
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

      <section id="lead" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-8 rounded-3xl border border-[var(--line)] bg-white p-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--leaf)]">
              Vuoi una simulazione personalizzata?
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">
              Richiedi il tuo preventivo gratuito
            </h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              Compila il modulo e ricevi una valutazione con consumi reali,
              incentivi disponibili e sopralluogo digitale.
            </p>
            <div className="mt-6 flex gap-3 text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              <span className={formStep === 1 ? "text-[var(--foreground)]" : ""}>
                Step 1
              </span>
              <span className={formStep === 2 ? "text-[var(--foreground)]" : ""}>
                Step 2
              </span>
              <span className={formStep === 3 ? "text-[var(--foreground)]" : ""}>
                Step 3
              </span>
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
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Nome"
                      value={formData.nome}
                      onChange={(event) => handleChange("nome", event.target.value)}
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
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
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Anagrafica abitazione"
                      value={formData.abitazione}
                      onChange={(event) =>
                        handleChange("abitazione", event.target.value)
                      }
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Consumi (kWh annui)"
                      value={formData.consumi}
                      onChange={(event) =>
                        handleChange("consumi", event.target.value)
                      }
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Bolletta media (€)"
                      value={formData.bolletta}
                      onChange={(event) =>
                        handleChange("bolletta", event.target.value)
                      }
                    />
                  </>
                )}
                {formStep === 3 && (
                  <>
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Email"
                      type="email"
                      value={formData.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                    />
                    <input
                      className="focus-ring rounded-xl border border-[var(--line)] px-4 py-3"
                      placeholder="Telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(event) =>
                        handleChange("telefono", event.target.value)
                      }
                    />
                  </>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={formStep === 1}
                    onClick={() => setFormStep((prev) => Math.max(prev - 1, 1))}
                    className="rounded-full border border-[var(--foreground)] px-5 py-2 text-sm font-semibold disabled:opacity-40"
                  >
                    Indietro
                  </button>
                  {formStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setFormStep((prev) => Math.min(prev + 1, 3))}
                      className="rounded-full bg-[var(--foreground)] px-5 py-2 text-sm font-semibold text-[var(--cream)]"
                    >
                      Continua
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--solar)] px-6 py-2 text-sm font-semibold"
                    >
                      Richiedi preventivo gratuito
                    </button>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ocean)]">
              Servizi completi
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">
              Un unico partner per ogni fase
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Consulenza gratuita",
              "Analisi consumi e sopralluogo digitale",
              "Progettazione impianto personalizzato",
              "Installazione certificata",
              "Assistenza e manutenzione",
              "Gestione incentivi e detrazioni",
              "Paghi solo a fine lavori",
            ].map((service) => (
              <div
                key={service}
                className="rounded-2xl border border-[var(--line)] bg-white p-5"
              >
                <div className="h-8 w-8 rounded-full bg-[var(--solar)]" />
                <p className="mt-3 font-semibold">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-[var(--ink-muted)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg text-[var(--foreground)]">
              GFS Solution 2026
            </p>
            <p>© 2026 · Tutti i diritti riservati</p>
            <p>Sede legale: Via dell’Energia 12, 35100 Padova</p>
            <p>Contatti: info@gfssolution2026.it · 049 123 4567</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--foreground)]">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--foreground)]">
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
