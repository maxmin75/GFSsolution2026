"use client";

import { useMemo, useState, type FormEvent } from "react";

const ZONE_COEFFICIENTS: Record<string, number> = {
  Nord: 1100,
  Centro: 1300,
  Sud: 1500,
};

const HOME_TYPES = ["Appartamento", "Casa indipendente", "Villa"];

const FEED_IN_TARIFF = 0.1;
const PANEL_DEGRADATION = 0.005;
const YEARS = 25;

const formatEuro = (value: number) =>
  value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const formatPct = (value: number) =>
  `${value.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%`;

const formatPayback = (value: number) =>
  Number.isFinite(value) ? `${value.toFixed(1)} anni` : "n.d.";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const buildPath = (values: number[], width: number, height: number) => {
  const maxValue = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

const evaluateInvestment = (paybackYears: number) => {
  if (paybackYears <= 7) {
    return { label: "Ottimo investimento", color: "bg-emerald-500" };
  }
  if (paybackYears <= 11) {
    return { label: "Buono", color: "bg-amber-400" };
  }
  return { label: "Poco conveniente", color: "bg-rose-500" };
};

type ScenarioResult = {
  annualSavings: number;
  annualSavingsPct: number;
  annualSavingsTotal: number;
  payback: number;
  roi: number;
  totalSavings25: number;
  totalSavings20: number;
  totalSavings10: number;
  yearlyTraditional: number[];
  yearlySolar: number[];
};

export default function Home() {
  const [homeData, setHomeData] = useState({
    superficie: 120,
    persone: 3,
    zona: "Nord",
    tipo: HOME_TYPES[0],
  });
  const [manualConsumption, setManualConsumption] = useState(false);
  const [consumoAnnuale, setConsumoAnnuale] = useState(3200);
  const [costoEnergia, setCostoEnergia] = useState(0.28);
  const [inflazione, setInflazione] = useState(4);
  const [potenzaImpianto, setPotenzaImpianto] = useState(4.5);
  const [costoImpianto, setCostoImpianto] = useState(8500);
  const [hasBattery, setHasBattery] = useState(true);
  const [batteriaCapacita, setBatteriaCapacita] = useState(8);
  const [costoBatteria, setCostoBatteria] = useState(4500);
  const [useIncentive, setUseIncentive] = useState(true);
  const [financingMonths, setFinancingMonths] = useState(0);

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

  const consumoStimato = useMemo(() => {
    const base = homeData.superficie * 35 + homeData.persone * 500;
    return Math.max(base, 1200);
  }, [homeData]);

  const consumoFinale = useMemo(() => {
    if (manualConsumption && consumoAnnuale > 0) {
      return consumoAnnuale;
    }
    return consumoStimato;
  }, [manualConsumption, consumoAnnuale, consumoStimato]);

  const costoNettoImpianto = useMemo(() => {
    const total = costoImpianto + (hasBattery ? costoBatteria : 0);
    return useIncentive ? total * 0.5 : total;
  }, [costoImpianto, costoBatteria, hasBattery, useIncentive]);

  const scenarioCalculator = (withBattery: boolean): ScenarioResult => {
    const zoneCoeff = ZONE_COEFFICIENTS[homeData.zona] ?? 1100;
    const autoconsumo = withBattery ? 0.75 : 0.35;
    const costTotal = costoImpianto + (withBattery ? costoBatteria : 0);
    const netCost = useIncentive ? costTotal * 0.5 : costTotal;

    const yearlyTraditional: number[] = [];
    const yearlySolar: number[] = [];
    let totalSavings = 0;
    let savingsAt10 = 0;
    let savingsAt20 = 0;

    for (let year = 1; year <= YEARS; year += 1) {
      const price = costoEnergia * (1 + inflazione / 100) ** (year - 1);
      const production =
        potenzaImpianto * zoneCoeff * (1 - PANEL_DEGRADATION) ** (year - 1);
      const autoconsumed = Math.min(consumoFinale, production * autoconsumo);
      const gridCost = (consumoFinale - autoconsumed) * price;
      const feedInRevenue = Math.max(production - autoconsumed, 0) * FEED_IN_TARIFF;
      const solarCost = Math.max(gridCost - feedInRevenue, 0);
      const traditionalCost = consumoFinale * price;

      yearlyTraditional.push(traditionalCost);
      yearlySolar.push(solarCost);

      const savings = traditionalCost - solarCost;
      totalSavings += savings;

      if (year === 10) savingsAt10 = totalSavings;
      if (year === 20) savingsAt20 = totalSavings;
    }

    const annualSavings = yearlyTraditional[0] - yearlySolar[0];
    const annualSavingsPct = clamp((annualSavings / yearlyTraditional[0]) * 100, 0, 100);
    const payback = annualSavings > 0 ? netCost / annualSavings : Number.POSITIVE_INFINITY;
    const roi = netCost > 0 ? ((totalSavings - netCost) / netCost) * 100 : 0;

    return {
      annualSavings,
      annualSavingsPct,
      annualSavingsTotal: yearlyTraditional[0],
      payback,
      roi,
      totalSavings25: totalSavings,
      totalSavings20: savingsAt20,
      totalSavings10: savingsAt10,
      yearlyTraditional,
      yearlySolar,
    };
  };

  const mainScenario = useMemo(
    () => scenarioCalculator(hasBattery),
    [
      hasBattery,
      homeData.zona,
      consumoFinale,
      costoEnergia,
      inflazione,
      potenzaImpianto,
      costoImpianto,
      costoBatteria,
      useIncentive,
    ],
  );

  const noBatteryScenario = useMemo(
    () => scenarioCalculator(false),
    [
      homeData.zona,
      consumoFinale,
      costoEnergia,
      inflazione,
      potenzaImpianto,
      costoImpianto,
      costoBatteria,
      useIncentive,
    ],
  );

  const withBatteryScenario = useMemo(
    () => scenarioCalculator(true),
    [
      homeData.zona,
      consumoFinale,
      costoEnergia,
      inflazione,
      potenzaImpianto,
      costoImpianto,
      costoBatteria,
      useIncentive,
    ],
  );

  const evaluation = evaluateInvestment(
    Number.isFinite(mainScenario.payback) ? mainScenario.payback : 99,
  );

  const chartWidth = 520;
  const chartHeight = 220;
  const chartPathTraditional = buildPath(
    mainScenario.yearlyTraditional,
    chartWidth,
    chartHeight,
  );
  const chartPathSolar = buildPath(
    mainScenario.yearlySolar,
    chartWidth,
    chartHeight,
  );

  const monthlyInstallment = useMemo(() => {
    if (financingMonths <= 0) return 0;
    return costoNettoImpianto / financingMonths;
  }, [costoNettoImpianto, financingMonths]);

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
              Simula il risparmio reale con il tuo impianto fotovoltaico
            </h1>
            <p className="mt-4 max-w-xl text-lg text-[var(--ink-muted)]">
              Inserisci i tuoi dati e confronta in pochi secondi i costi con rete
              tradizionale, impianto fotovoltaico e batteria di accumulo.
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
        className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ocean)]">
              Simulatore risparmio fotovoltaico
            </p>
            <h2 className="font-display text-3xl sm:text-4xl">
              Confronta rete tradizionale e fotovoltaico in 25 anni
            </h2>
            <p className="mt-3 text-[var(--ink-muted)]">
              Inserisci i tuoi dati. Il simulatore applica produzione per zona,
              autoconsumo e incremento annuo energia per mostrarti un risparmio
              reale.
            </p>
          </div>

          <div className="grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Dati casa
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Superficie (mq)
                  <input
                    type="number"
                    min={40}
                    max={400}
                    value={homeData.superficie}
                    onChange={(event) =>
                      setHomeData((prev) => ({
                        ...prev,
                        superficie: Number(event.target.value),
                      }))
                    }
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Numero persone
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={homeData.persone}
                    onChange={(event) =>
                      setHomeData((prev) => ({
                        ...prev,
                        persone: Number(event.target.value),
                      }))
                    }
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Zona geografica
                  <select
                    value={homeData.zona}
                    onChange={(event) =>
                      setHomeData((prev) => ({
                        ...prev,
                        zona: event.target.value,
                      }))
                    }
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3"
                  >
                    {Object.keys(ZONE_COEFFICIENTS).map((zone) => (
                      <option key={zone}>{zone}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Tipo abitazione
                  <select
                    value={homeData.tipo}
                    onChange={(event) =>
                      setHomeData((prev) => ({
                        ...prev,
                        tipo: event.target.value,
                      }))
                    }
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3"
                  >
                    {HOME_TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Consumi
              </p>
              <div className="mt-4 grid gap-4">
                <label className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold">
                  Inserisci consumi manualmente
                  <button
                    type="button"
                    onClick={() => setManualConsumption((prev) => !prev)}
                    className={`relative h-7 w-14 rounded-full border border-[var(--line)] transition ${
                      manualConsumption ? "bg-[var(--solar)]" : "bg-[var(--cream)]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                        manualConsumption ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </label>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm">
                  Consumo stimato: <strong>{consumoStimato.toLocaleString("it-IT")}</strong> kWh/anno
                </div>
                {manualConsumption && (
                  <label className="text-sm font-semibold">
                    Consumo annuo manuale (kWh)
                    <input
                      type="number"
                      min={1000}
                      max={12000}
                      value={consumoAnnuale}
                      onChange={(event) => setConsumoAnnuale(Number(event.target.value))}
                      className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Costo energia
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  Costo energia €/kWh
                  <input
                    type="number"
                    step={0.01}
                    min={0.15}
                    max={0.6}
                    value={costoEnergia}
                    onChange={(event) => setCostoEnergia(Number(event.target.value))}
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Aumento medio annuo (%)
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={12}
                    value={inflazione}
                    onChange={(event) => setInflazione(Number(event.target.value))}
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Impianto fotovoltaico
              </p>
              <div className="mt-4 grid gap-4">
                <label className="text-sm font-semibold">
                  Potenza impianto (kW)
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={0.5}
                    value={potenzaImpianto}
                    onChange={(event) => setPotenzaImpianto(Number(event.target.value))}
                    className="mt-3 w-full accent-[var(--solar)]"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    <span>2 kW</span>
                    <span className="text-[var(--foreground)]">
                      {potenzaImpianto} kW
                    </span>
                    <span>12 kW</span>
                  </div>
                </label>
                <label className="text-sm font-semibold">
                  Costo impianto (€)
                  <input
                    type="number"
                    min={4000}
                    max={25000}
                    value={costoImpianto}
                    onChange={(event) => setCostoImpianto(Number(event.target.value))}
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
                <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold">
                  Batteria di accumulo
                  <button
                    type="button"
                    onClick={() => setHasBattery((prev) => !prev)}
                    className={`relative h-8 w-16 rounded-full border border-[var(--line)] transition ${
                      hasBattery ? "bg-[var(--leaf)]" : "bg-[var(--cream)]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                        hasBattery ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
                {hasBattery && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Capacità batteria (kWh)
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={batteriaCapacita}
                        onChange={(event) =>
                          setBatteriaCapacita(Number(event.target.value))
                        }
                        className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                      />
                    </label>
                    <label className="text-sm font-semibold">
                      Costo batteria (€)
                      <input
                        type="number"
                        min={2000}
                        max={12000}
                        value={costoBatteria}
                        onChange={(event) => setCostoBatteria(Number(event.target.value))}
                        className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                Incentivi & finanziamento
              </p>
              <div className="mt-4 grid gap-4">
                <label className="flex items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-sm font-semibold">
                  Detrazione fiscale 50%
                  <input
                    type="checkbox"
                    checked={useIncentive}
                    onChange={(event) => setUseIncentive(event.target.checked)}
                    className="h-5 w-5 accent-[var(--solar)]"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Finanziamento a rate (mesi)
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={financingMonths}
                    onChange={(event) => setFinancingMonths(Number(event.target.value))}
                    className="focus-ring mt-2 w-full rounded-xl border border-[var(--line)] px-4 py-3"
                  />
                </label>
                {financingMonths > 0 && (
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] px-4 py-3 text-sm">
                    Rata indicativa: <strong>{formatEuro(monthlyInstallment)}</strong> / mese
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glow rounded-3xl border border-[var(--line)] bg-[var(--cream)] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Risultato principale
            </p>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-sm text-[var(--ink-muted)]">Risparmio annuo</p>
                <p className="font-display text-4xl">
                  {formatEuro(mainScenario.annualSavings)}
                </p>
                <p className="text-sm text-[var(--ink-muted)]">
                  Riduzione costi: {formatPct(mainScenario.annualSavingsPct)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    Rientro investimento
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatPayback(mainScenario.payback)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    ROI stimato
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatPct(mainScenario.roi)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    Risparmio 10 anni
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatEuro(mainScenario.totalSavings10)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    Risparmio 20 anni
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatEuro(mainScenario.totalSavings20)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    Risparmio 25 anni
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {formatEuro(mainScenario.totalSavings25)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold">
                <span>Indice investimento</span>
                <span
                  className={`rounded-full px-3 py-1 text-[var(--cream)] ${evaluation.color}`}
                >
                  {evaluation.label}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                  Confronto grafico
                </p>
                <h3 className="font-display text-xl">
                  Costo energia tradizionale vs fotovoltaico
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-[var(--foreground)]" />
                  Tradizionale
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-6 rounded-full bg-[var(--solar)]" />
                  Fotovoltaico
                </span>
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-4">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-52 w-full"
              >
                <path
                  d={chartPathTraditional}
                  fill="none"
                  stroke="#0f1f14"
                  strokeWidth="3"
                />
                <path
                  d={chartPathSolar}
                  fill="none"
                  stroke="#2f89ff"
                  strokeWidth="3"
                />
              </svg>
              <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                <span>Anno 1</span>
                <span>Anno 25</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-white p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Confronto con / senza batteria
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Senza batteria", data: noBatteryScenario },
                { label: "Con batteria", data: withBatteryScenario },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--cream)] p-4"
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <div className="mt-3 grid gap-2 text-sm text-[var(--ink-muted)]">
                    <div className="flex justify-between">
                      <span>Risparmio annuo</span>
                      <strong className="text-[var(--foreground)]">
                        {formatEuro(item.data.annualSavings)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payback</span>
                      <strong className="text-[var(--foreground)]">
                        {formatPayback(item.data.payback)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Risparmio 25 anni</span>
                      <strong className="text-[var(--foreground)]">
                        {formatEuro(item.data.totalSavings25)}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)] bg-[var(--cream)] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Extra avanzati
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-[var(--foreground)] px-4 py-2 text-sm font-semibold"
              >
                Salva PDF
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-[var(--foreground)] px-4 py-2 text-sm font-semibold"
              >
                Stampa
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = `Risparmio annuo stimato: ${formatEuro(
                    mainScenario.annualSavings,
                  )}. Payback: ${mainScenario.payback.toFixed(1)} anni.`;
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, "_blank");
                }}
                className="rounded-full border border-[var(--foreground)] px-4 py-2 text-sm font-semibold"
              >
                Condividi WhatsApp
              </button>
            </div>
            <p className="mt-3 text-xs text-[var(--ink-muted)]">
              Nota: PDF e stampa usano la funzione del browser. Incentivo fiscale
              calcolato al 50% sul costo totale.
            </p>
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
