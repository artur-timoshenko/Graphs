import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Plus, Minus, User, Activity, Target, Wallet, X, Clock, CheckCircle2, AlertCircle, Loader2, Trash2, CreditCard } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Trading" },
      { name: "description", content: "Live trading account dashboard" },
    ],
  }),
  component: Index,
});

type Lang = "fr" | "en" | "ru" | "es" | "de" | "ko" | "it" | "mx";
type WStatus = "completed" | "pending" | "processing" | "error";
type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  status: WStatus;
  date: string; // ISO
};
type Bank = { id: string; name: string; icon: string };
type Theme = "modern" | "terminal" | "neon" | "paper" | "heatmap" | "ocean" | "matrix" | "glass";
type AppSettings = {
  name: string;
  avatar: string;
  currency: string;
  lang: Lang;
  initial: number;
  target: number;
  investment: number;
  duration: number;
  withdrawals: Withdrawal[];
  banks: Partial<Record<Lang, Bank[]>>;
  theme: Theme;
  themeAccent: number;
};

const INVEST_STEP = 50;
const PAYMENT_METHODS = ["Bank", "PayPal", "Crypto"];

// 4 palette variants per theme — each shifts the hue of the entire view through CSS
// filters. Filters apply uniformly so accents, gradients, ring colors and decorative
// elements stay visually coherent across the new palette.
const ACCENT_FILTERS = [
  "none",
  "hue-rotate(60deg) saturate(1.1)",
  "hue-rotate(180deg) saturate(1.05)",
  "hue-rotate(270deg) saturate(1.15)",
  "hue-rotate(30deg) saturate(0.85) brightness(0.95)",
  "saturate(0)",
] as const;
const ACCENT_NAMES = ["По умолчанию", "Цитрус", "Океан", "Виолет", "Лес", "Моно"] as const;
const ACCENT_SWATCHES: [string, string, string][] = [
  ["#34d399", "#22d3ee", "#0ea5e9"],
  ["#facc15", "#f97316", "#ef4444"],
  ["#f472b6", "#a78bfa", "#6366f1"],
  ["#c084fc", "#7c3aed", "#312e81"],
  ["#365314", "#4d7c0f", "#84cc16"],
  ["#3f3f46", "#71717a", "#d4d4d8"],
];

const DEFAULTS: AppSettings = {
  name: "Tom Bernard",
  avatar: "",
  currency: "$",
  lang: "fr",
  initial: 7100,
  target: 9000,
  investment: 350,
  duration: 15,
  withdrawals: [],
  banks: {},
  theme: "modern",
  themeAccent: 0,
};


const T = {
  fr: { account: "Compte de trading", profit: "Profit", goal: "Objectif", invest: "Investissement", stop: "Arrêter", start: "Démarrer", settings: "Paramètres", name: "Nom", avatar: "Avatar (URL)", currency: "Devise", language: "Langue", initial: "Somme initiale", target: "Objectif", step: "Pas", save: "Enregistrer", reset: "Réinitialiser", live: "EN DIRECT", idle: "EN PAUSE", duration: "Durée (sec)", earned: "Gagné", withdraw: "Retirer", paymentMethod: "Méthode de paiement", history: "Historique des retraits", withdrawals: "Retraits", addWithdrawal: "Ajouter un retrait", amount: "Montant", status: "Statut", method: "Méthode", date: "Date", completed: "Effectué", pending: "En attente", processing: "En cours", error: "Erreur" },
  en: { account: "Trading account", profit: "Profit", goal: "Goal", invest: "Investment", stop: "Stop", start: "Start", settings: "Settings", name: "Name", avatar: "Avatar (URL)", currency: "Currency", language: "Language", initial: "Initial amount", target: "Target amount", step: "Step", save: "Save", reset: "Reset", live: "LIVE", idle: "PAUSED", duration: "Duration (sec)", earned: "Earned", withdraw: "Withdraw", paymentMethod: "Payment method", history: "Withdrawal history", withdrawals: "Withdrawals", addWithdrawal: "Add withdrawal", amount: "Amount", status: "Status", method: "Method", date: "Date", completed: "Completed", pending: "Pending", processing: "Processing", error: "Error" },
  ru: { account: "Торговый счёт", profit: "Прибыль", goal: "Цель", invest: "Инвестиция", stop: "Остановить", start: "Старт", settings: "Настройки", name: "Имя", avatar: "Аватар (URL)", currency: "Валюта", language: "Язык", initial: "Начальная сумма", target: "Цель", step: "Шаг", save: "Сохранить", reset: "Сброс", live: "В ЭФИРЕ", idle: "ПАУЗА", duration: "Длительность (сек)", earned: "Заработано", withdraw: "Вывод", paymentMethod: "Способ оплаты", history: "История выводов", withdrawals: "Выводы", addWithdrawal: "Добавить вывод", amount: "Сумма", status: "Статус", method: "Способ", date: "Дата", completed: "Выведено", pending: "Ожидание", processing: "В обработке", error: "Ошибка" },
  es: { account: "Cuenta de trading", profit: "Beneficio", goal: "Meta", invest: "Inversión", stop: "Parar", start: "Iniciar", settings: "Ajustes", name: "Nombre", avatar: "Avatar (URL)", currency: "Moneda", language: "Idioma", initial: "Cantidad inicial", target: "Objetivo", step: "Paso", save: "Guardar", reset: "Restablecer", live: "EN VIVO", idle: "PAUSA", duration: "Duración (seg)", earned: "Ganado", withdraw: "Retirar", paymentMethod: "Método de pago", history: "Historial de retiros", withdrawals: "Retiros", addWithdrawal: "Añadir retiro", amount: "Cantidad", status: "Estado", method: "Método", date: "Fecha", completed: "Completado", pending: "Pendiente", processing: "En proceso", error: "Error" },
  de: { account: "Trading-Konto", profit: "Gewinn", goal: "Ziel", invest: "Investition", stop: "Stoppen", start: "Starten", settings: "Einstellungen", name: "Name", avatar: "Avatar (URL)", currency: "Währung", language: "Sprache", initial: "Anfangsbetrag", target: "Zielbetrag", step: "Schritt", save: "Speichern", reset: "Zurücksetzen", live: "LIVE", idle: "PAUSIERT", duration: "Dauer (Sek)", earned: "Verdient", withdraw: "Auszahlen", paymentMethod: "Zahlungsmethode", history: "Auszahlungshistorie", withdrawals: "Auszahlungen", addWithdrawal: "Auszahlung hinzufügen", amount: "Betrag", status: "Status", method: "Methode", date: "Datum", completed: "Abgeschlossen", pending: "Ausstehend", processing: "In Bearbeitung", error: "Fehler" },
  ko: { account: "트레이딩 계좌", profit: "수익", goal: "목표", invest: "투자금", stop: "중지", start: "시작", settings: "설정", name: "이름", avatar: "아바타 (URL)", currency: "통화", language: "언어", initial: "초기 금액", target: "목표 금액", step: "단위", save: "저장", reset: "초기화", live: "라이브", idle: "일시정지", duration: "기간 (초)", earned: "수익금", withdraw: "출금", paymentMethod: "결제 수단", history: "출금 내역", withdrawals: "출금", addWithdrawal: "출금 추가", amount: "금액", status: "상태", method: "수단", date: "날짜", completed: "완료", pending: "대기 중", processing: "처리 중", error: "오류" },
  it: { account: "Conto di trading", profit: "Profitto", goal: "Obiettivo", invest: "Investimento", stop: "Ferma", start: "Avvia", settings: "Impostazioni", name: "Nome", avatar: "Avatar (URL)", currency: "Valuta", language: "Lingua", initial: "Importo iniziale", target: "Importo obiettivo", step: "Passo", save: "Salva", reset: "Reimposta", live: "IN DIRETTA", idle: "IN PAUSA", duration: "Durata (sec)", earned: "Guadagnato", withdraw: "Preleva", paymentMethod: "Metodo di pagamento", history: "Cronologia prelievi", withdrawals: "Prelievi", addWithdrawal: "Aggiungi prelievo", amount: "Importo", status: "Stato", method: "Metodo", date: "Data", completed: "Completato", pending: "In attesa", processing: "In corso", error: "Errore" },
  mx: { account: "Cuenta de trading", profit: "Ganancia", goal: "Meta", invest: "Inversión", stop: "Detener", start: "Iniciar", settings: "Ajustes", name: "Nombre", avatar: "Avatar (URL)", currency: "Moneda", language: "Idioma", initial: "Monto inicial", target: "Monto objetivo", step: "Paso", save: "Guardar", reset: "Reiniciar", live: "EN VIVO", idle: "EN PAUSA", duration: "Duración (seg)", earned: "Ganado", withdraw: "Retirar", paymentMethod: "Método de pago", history: "Historial de retiros", withdrawals: "Retiros", addWithdrawal: "Agregar retiro", amount: "Monto", status: "Estado", method: "Método", date: "Fecha", completed: "Completado", pending: "Pendiente", processing: "En proceso", error: "Error" },
};

function fmt(n: number, cur: string) {
  const s = n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${s} ${cur}`;
}

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("trading-settings");
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

const FPS = 24;
const FRAME_MS = 1000 / FPS;
const CANDLE_POINTS = 6;
const VISIBLE_CANDLES = 28;
const MAX_POINTS = CANDLE_POINTS * (VISIBLE_CANDLES + 4);

function appendChartPoint(arr: number[], next: number) {
  const nextPoints = [...arr, next];
  return nextPoints.length > MAX_POINTS ? nextPoints.slice(CANDLE_POINTS) : nextPoints;
}

function Index() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [balance, setBalance] = useState<number>(DEFAULTS.initial);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [points, setPoints] = useState<number[]>([DEFAULTS.initial]);
  const [notif, setNotif] = useState<{ id: number; method: string; amount: number; balance: number; bank: Bank | null } | null>(null);

  // refs for the rAF loop (don't trigger re-renders)
  const lastFrameRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const balanceRef = useRef<number>(DEFAULTS.initial);
  const velRef = useRef<number>(0);
  const trendRef = useRef<number>(0);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    const savedBal = typeof window !== "undefined" ? localStorage.getItem("trading-balance") : null;
    const start = savedBal ? parseFloat(savedBal) : s.initial;
    setBalance(start);
    balanceRef.current = start;
    setPoints([start]);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("trading-balance", String(balance));
  }, [balance]);

  const t = T[settings.lang];

  // 24 fps growth loop
  useEffect(() => {
    if (!running) return;
    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastFrameRef.current;
      if (dt >= FRAME_MS) {
        lastFrameRef.current = now - (dt % FRAME_MS);
        phaseRef.current += 1;

        const b = balanceRef.current;
        const remaining = settings.target - b;
        if (remaining <= 0.01) {
          balanceRef.current = settings.target;
          setBalance(settings.target);
          setPoints((arr) => appendChartPoint(arr, settings.target));
          setRunning(false);
          setShowWithdraw(true);
          return;
        }
        
        // Realistic random-walk that ALWAYS reaches target at the specified duration.
        // Strategy: compute expected trajectory point for this frame, add bounded noise.
        const totalFrames = Math.max(1, (settings.duration || 15) * FPS);
        const progress = Math.min(1, phaseRef.current / totalFrames);
        const span = settings.target - settings.initial;
        const expected = settings.initial + span * progress;

        // noise envelope shrinks as we approach the end so we land exactly on target
        const envelope = (1 - progress) * Math.abs(span) * 0.18;
        const rnd = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        trendRef.current = trendRef.current * 0.97 + (Math.random() - 0.5) * envelope * 0.8;
        velRef.current = velRef.current * 0.75 + (rnd * envelope * 1.2 + trendRef.current) * 0.25;

        let next = expected + velRef.current;
        if (progress >= 1) next = settings.target;
        balanceRef.current = next;
        setBalance(next);
        setPoints((arr) => appendChartPoint(arr, next));
        if (progress >= 1) { setRunning(false); setShowWithdraw(true); return; }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, settings.target, settings.investment]);

  const profit = balance - settings.initial;
  const progress = useMemo(() => {
    const span = settings.target - settings.initial;
    if (span <= 0) return 0;
    return Math.max(0, Math.min(1, (balance - settings.initial) / span));
  }, [balance, settings.initial, settings.target]);

  const reset = () => {
    setRunning(false);
    setBalance(settings.initial);
    balanceRef.current = settings.initial;
    phaseRef.current = 0;
    setPoints([settings.initial]);
  };

  const isTerminal = settings.theme === "terminal";
  const isNeon = settings.theme === "neon";
  const isPaper = settings.theme === "paper";
  const isHeatmap = settings.theme === "heatmap";
  const isOcean = settings.theme === "ocean";
  const isMatrix = settings.theme === "matrix";
  const isGlass = settings.theme === "glass";

  const shellBg = isTerminal
    ? "bg-[#f5f6f7] text-slate-900"
    : isNeon
    ? "bg-[#0c0d10] text-zinc-100"
    : isPaper
    ? "bg-[#f4f1ec] text-stone-900"
    : isHeatmap
    ? "bg-[#0a0a0a] text-zinc-100"
    : isOcean
    ? "bg-[#04111f] text-sky-100"
    : isMatrix
    ? "bg-black text-emerald-300"
    : isGlass
    ? "text-slate-900"
    : "bg-[#0a0e1a] text-slate-100";

  const accentFilter = ACCENT_FILTERS[settings.themeAccent ?? 0] ?? "none";

  return (
    <div
      className={`h-[100dvh] w-full flex justify-center overflow-hidden ${shellBg}`}
      style={isGlass ? { background: "linear-gradient(135deg, #fce7f3 0%, #ddd6fe 50%, #bae6fd 100%)" } : undefined}
    >
      <div
        className="relative w-full h-full flex justify-center"
        style={{ filter: accentFilter }}
      >
      {!isTerminal && !isNeon && !isPaper && !isHeatmap && !isOcean && !isMatrix && !isGlass && (
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-40 -left-20 w-[420px] h-[420px] rounded-full blur-3xl bg-emerald-500/20" />
          <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full blur-3xl bg-cyan-500/10" />
        </div>
      )}


      {isNeon && (
        <div className="pointer-events-none fixed inset-0 opacity-60">
          <div className="absolute -top-32 -left-10 w-[360px] h-[360px] rounded-full blur-3xl bg-violet-600/10" />
        </div>
      )}

      {isOcean && (
        <div className="pointer-events-none fixed inset-0 opacity-80">
          <div className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl bg-sky-500/20" />
          <div className="absolute bottom-0 -right-32 w-[460px] h-[460px] rounded-full blur-3xl bg-cyan-400/15" />
        </div>
      )}

      {isGlass && (
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-32 left-10 w-[420px] h-[420px] rounded-full blur-3xl bg-pink-300/30" />
          <div className="absolute bottom-10 -right-20 w-[460px] h-[460px] rounded-full blur-3xl bg-sky-300/30" />
        </div>
      )}




      {isTerminal ? (
        <div className="relative w-full max-w-[440px] h-full px-3 pt-3 pb-3 flex flex-col gap-2.5">
          {/* Top bar — Binance-style */}
          <div className="flex items-center justify-between bg-white rounded-2xl px-3 py-2 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#fcd535] overflow-hidden flex items-center justify-center ring-2 ring-[#f0b90b]/40">
                {settings.avatar ? (
                  <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-slate-900" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm leading-tight truncate text-slate-900">{settings.name}</div>
                <div className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">VIP · {t.account}</div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 shrink-0"
              aria-label={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Ticker row */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">BTC/USDT</span>
                <span className="text-[10px] text-slate-500">Spot</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${running ? "bg-[#02c076]/10 text-[#02c076]" : "bg-slate-100 text-slate-500"}`}>
                  {running ? "● " + t.live : "○ " + t.idle}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-slate-100">1m</span>
                <span className="px-1.5 py-0.5">5m</span>
                <span className="px-1.5 py-0.5">1h</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className={`text-[26px] leading-none font-bold tabular-nums ${profit >= 0 ? "text-[#02c076]" : "text-[#f6465d]"}`}>
                  {fmt(balance, settings.currency)}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 tabular-nums">≈ {settings.currency} {balance.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">24h {t.profit}</div>
                <div className={`text-sm font-bold tabular-nums ${profit >= 0 ? "text-[#02c076]" : "text-[#f6465d]"}`}>
                  {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
                </div>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px]">
              <div className="bg-slate-50 rounded-lg p-1.5">
                <div className="text-slate-500">24h High</div>
                <div className="font-semibold tabular-nums text-slate-900">{fmt(Math.max(balance, settings.target), settings.currency)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-1.5">
                <div className="text-slate-500">24h Low</div>
                <div className="font-semibold tabular-nums text-slate-900">{fmt(settings.initial, settings.currency)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-1.5">
                <div className="text-slate-500">{t.goal}</div>
                <div className="font-semibold tabular-nums text-[#f0b90b]">{Math.floor(progress * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Candle chart */}
          <div className="relative flex-1 min-h-0 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden p-2">
            <CandleChart points={points} target={settings.target} initial={settings.initial} />
          </div>

          {/* Order panel */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">{t.invest}</div>
              <div className="flex gap-1 text-[10px] font-semibold">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">25%</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">50%</span>
                <span className="px-1.5 py-0.5 rounded bg-[#f0b90b]/15 text-[#a07a07]">100%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 ring-1 ring-slate-200">
              <button
                onClick={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-700 shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center text-lg font-bold tabular-nums text-slate-900">
                {fmt(settings.investment, settings.currency)}
              </div>
              <button
                onClick={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center text-slate-700 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Buy / Sell action */}
          <button
            onClick={() => setRunning((r) => !r)}
            className={`w-full py-3.5 rounded-xl text-base font-bold uppercase tracking-wider transition active:scale-[0.99] shadow-md ${
              running
                ? "bg-[#f6465d] hover:bg-[#e0334a] text-white shadow-[#f6465d]/30"
                : "bg-[#02c076] hover:bg-[#01a866] text-white shadow-[#02c076]/30"
            }`}
          >
            {running ? "SELL · " + t.stop : "BUY · " + t.start}
          </button>
        </div>
      ) : isNeon ? (
        <NeonView
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : isPaper ? (
        <PaperView
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : isHeatmap ? (
        <HeatmapView
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : isOcean ? (
        <ThemedView
          tokens={OCEAN_TOKENS}
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : isMatrix ? (
        <ThemedView
          tokens={MATRIX_TOKENS}
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : isGlass ? (
        <ThemedView
          tokens={GLASS_TOKENS}
          settings={settings} balance={balance} profit={profit} progress={progress}
          points={points} running={running} t={t}
          onToggle={() => setRunning((r) => !r)}
          onOpenSettings={() => setShowSettings(true)}
          onInc={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
          onDec={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
        />
      ) : (
      <div className="relative w-full max-w-[440px] h-full px-4 pt-3 pb-3 flex flex-col gap-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-400/30 to-cyan-500/20 ring-1 ring-white/10 overflow-hidden flex items-center justify-center">
              {settings.avatar ? (
                <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-emerald-200" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm leading-tight truncate">{settings.name}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 truncate">{t.account}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold tracking-wider ring-1 ${
              running ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30" : "bg-white/5 text-slate-400 ring-white/10"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {running ? t.live : t.idle}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center justify-center text-slate-300 shrink-0"
              aria-label={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance hero */}
        <div className="relative rounded-3xl p-4 bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_60%)]" />
          <div className="relative flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1">{t.account}</div>
              <div
                className="text-[34px] leading-none font-bold tabular-nums tracking-tight bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(balance, settings.currency)}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-1 flex items-center justify-end gap-1">
                <Activity className="w-3 h-3" /> {t.profit}
              </div>
              <div className={`text-base font-semibold tabular-nums ${profit >= 0 ? "text-emerald-300" : "text-rose-400"}`}>
                {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
              </div>
            </div>
          </div>
          {/* progress to goal */}
          <div className="relative mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
              <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {t.goal}</span>
              <span className="tabular-nums">{fmt(settings.target, settings.currency)}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-[width] duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative flex-1 min-h-0 rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] ring-1 ring-white/10 backdrop-blur-xl overflow-hidden">
          <Chart points={points} target={settings.target} initial={settings.initial} />
        </div>

        {/* Investment */}
        <div className="rounded-3xl p-3 bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl">
          <div className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">{t.invest}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettings((s) => ({ ...s, investment: Math.max(0, s.investment - INVEST_STEP) }))}
              className="w-11 h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center justify-center text-slate-200 shrink-0 active:scale-95 transition"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center text-xl font-semibold tabular-nums tracking-tight">
              {fmt(settings.investment, settings.currency)}
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, investment: s.investment + INVEST_STEP }))}
              className="w-11 h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center justify-center text-slate-200 shrink-0 active:scale-95 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => setRunning((r) => !r)}
          className={`relative w-full py-3.5 rounded-2xl text-base font-semibold tracking-wide shadow-lg transition active:scale-[0.99] overflow-hidden ${
            running
              ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/30"
              : "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 shadow-emerald-500/30"
          }`}
        >
          <span className="relative">{running ? t.stop : t.start}</span>
        </button>
      </div>
      )}
      </div>


      {showSettings && (

        <SettingsModal
          t={T.ru}
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            setSettings(s);
            localStorage.setItem("trading-settings", JSON.stringify(s));
            setRunning(false);
            setBalance(s.initial);
            balanceRef.current = s.initial;
            phaseRef.current = 0;
            setPoints([s.initial]);
            localStorage.setItem("trading-balance", String(s.initial));
            setShowSettings(false);
          }}
          onReset={reset}
        />
      )}

      {showWithdraw && (
        <WithdrawSheet
          theme={settings.theme}
          t={t}
          profit={profit}
          currency={settings.currency}
          withdrawals={settings.withdrawals}
          onClose={() => setShowWithdraw(false)}
          onWithdraw={(amount, method) => {
            const w: Withdrawal = {
              id: String(Date.now()),
              amount,
              method,
              status: "processing",
              date: new Date().toISOString(),
            };
            const newBalance = Math.max(0, balanceRef.current - amount);
            balanceRef.current = newBalance;
            setBalance(newBalance);
            const next = { ...settings, withdrawals: [w, ...settings.withdrawals] };
            setSettings(next);
            localStorage.setItem("trading-settings", JSON.stringify(next));
            const langBanks = settings.banks[settings.lang] || [];
            const chosenBank = method === "Bank" && langBanks.length > 0
              ? langBanks[Math.floor(Math.random() * langBanks.length)]
              : null;
            const notifId = Date.now();
            setTimeout(() => {
              setNotif({ id: notifId, method, amount, balance: newBalance, bank: chosenBank });
            }, 2000);
            // simulate provider response
            setTimeout(() => {
              setSettings((cur) => {
                const updated = {
                  ...cur,
                  withdrawals: cur.withdrawals.map((x) =>
                    x.id === w.id
                      ? { ...x, status: (Math.random() < 0.8 ? "completed" : "pending") as WStatus }
                      : x,
                  ),
                };
                localStorage.setItem("trading-settings", JSON.stringify(updated));
                return updated;
              });
            }, 2200);
          }}
        />
      )}

      {notif && (
        <IOSNotification
          key={notif.id}
          method={notif.method}
          amount={notif.amount}
          balance={notif.balance}
          currency={settings.currency}
          lang={settings.lang}
          customBank={notif.bank}
          onClose={() => setNotif(null)}
        />
      )}
    </div>
  );
}

function Chart({ points, target, initial }: { points: number[]; target: number; initial: number }) {
  const w = 400;
  const h = 520;
  const pad = 10;

  if (points.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
        —
      </div>
    );
  }

  // y-range fixed from initial to target so growth looks gradual, not vertical
  const dataMin = Math.min(...points);
  const dataMax = Math.max(...points);
  const span = Math.max(1, target - initial);
  const min = Math.min(initial, dataMin) - span * 0.05;
  const max = Math.max(target, dataMax) + span * 0.05;
  const range = Math.max(0.5, max - min);
  const n = points.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / range) * (h - pad * 2);

  // smooth bezier path
  let d = `M ${x(0).toFixed(2)} ${y(points[0]).toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = x(i), y0 = y(points[i]);
    const x1 = x(i + 1), y1 = y(points[i + 1]);
    const cx = (x0 + x1) / 2;
    d += ` C ${cx.toFixed(2)} ${y0.toFixed(2)}, ${cx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  const area = `${d} L ${x(n - 1).toFixed(2)} ${h - pad} L ${x(0).toFixed(2)} ${h - pad} Z`;
  const lastX = x(n - 1);
  const lastY = y(points[n - 1]);
  const targetY = Math.max(pad, Math.min(h - pad, y(target)));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* grid */}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line
          key={i}
          x1={pad}
          x2={w - pad}
          y1={pad + p * (h - pad * 2)}
          y2={pad + p * (h - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
          strokeDasharray="2 5"
        />
      ))}

      {/* target line */}
      <line
        x1={pad}
        x2={w - pad}
        y1={targetY}
        y2={targetY}
        stroke="rgba(103,232,249,0.4)"
        strokeWidth={1}
        strokeDasharray="3 4"
      />

      <path d={area} fill="url(#areaGrad)" />
      <path
        d={d}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* trailing point */}
      <circle cx={lastX} cy={lastY} r={8} fill="#34d399" fillOpacity={0.18} />
      <circle cx={lastX} cy={lastY} r={4} fill="#34d399" fillOpacity={0.35} />
      <circle cx={lastX} cy={lastY} r={2.2} fill="#ecfeff" />
    </svg>
  );
}

function CandleChart({ points, target, initial }: { points: number[]; target: number; initial: number }) {
  const w = 400;
  const h = 520;
  const pad = 10;
  const CANDLE_SIZE = CANDLE_POINTS;
  const VISIBLE = VISIBLE_CANDLES;
  const minScale = Math.min(initial, target) - Math.abs(target - initial) * 0.08;
  const maxScale = Math.max(initial, target) + Math.abs(target - initial) * 0.08;

  // Only build COMPLETED candles — never mutate the last one as new points arrive.
  const completed: { o: number; h: number; l: number; c: number }[] = [];
  const fullCount = Math.floor(points.length / CANDLE_SIZE);
  for (let i = 0; i < fullCount; i++) {
    const slice = points.slice(i * CANDLE_SIZE, (i + 1) * CANDLE_SIZE);
    completed.push({
      o: slice[0],
      c: slice[slice.length - 1],
      h: Math.max(...slice),
      l: Math.min(...slice),
    });
  }

  // Pending (in-progress) points — shown only as a thin price line, not a jittery candle.
  const pendingLen = points.length - fullCount * CANDLE_SIZE;
  const subProgress = pendingLen / CANDLE_SIZE; // 0..<1
  const livePrice = points[points.length - 1] ?? initial;

  if (completed.length === 0 && points.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-mono">— NO DATA —</div>;
  }

  // Visible window: last VISIBLE completed candles
  const startIdx = Math.max(0, completed.length - VISIBLE);
  const view = completed.slice(startIdx);

  // Fixed Y range: candles should only slide horizontally, not flex vertically
  // when older candles leave the window or the price line updates.
  const min = minScale;
  const max = maxScale;
  const range = Math.max(0.5, max - min);

  const colW = (w - pad * 2) / VISIBLE;
  const bodyW = Math.max(2, colW * 0.7);
  const y = (v: number) => pad + (1 - (v - min) / range) * (h - pad * 2);
  const targetY = Math.max(pad, Math.min(h - pad, y(target)));
  const initialY = Math.max(pad, Math.min(h - pad, y(initial)));

  // Smooth slide: shift the whole group left by `colW * subProgress`.
  // The newest completed candle sits at column index (view.length - 1).
  // We render it one column further right so as subProgress goes 0→1 it walks
  // into the last visible slot without snapping.
  const shift = colW * subProgress;

  const lastCol = livePrice >= initial ? "#10b981" : "#ef4444";
  const lastY = y(livePrice);
  // live price marker pinned to the right edge of the visible area
  const liveCx = w - pad - colW / 2 + colW * (1 - subProgress);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <clipPath id="candleClip">
          <rect x={pad} y={0} width={w - pad * 2} height={h} />
        </clipPath>
      </defs>
      {/* grid */}
      {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)}
          stroke="#10b981" strokeOpacity={0.12} strokeWidth={1} strokeDasharray="2 4" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`v${i}`} x1={pad + ((w - pad * 2) * i) / 5} x2={pad + ((w - pad * 2) * i) / 5}
          y1={pad} y2={h - pad} stroke="#10b981" strokeOpacity={0.08} strokeWidth={1} strokeDasharray="2 4" />
      ))}
      <line x1={pad} x2={w - pad} y1={initialY} y2={initialY} stroke="#64748b" strokeOpacity={0.5} strokeWidth={1} strokeDasharray="4 4" />
      <line x1={pad} x2={w - pad} y1={targetY} y2={targetY} stroke="#22d3ee" strokeOpacity={0.7} strokeWidth={1} strokeDasharray="6 3" />
      <text x={w - pad - 2} y={targetY - 3} fill="#22d3ee" fontSize="9" textAnchor="end" fontFamily="monospace">TGT {target.toFixed(0)}</text>

      {/* completed candles — slide smoothly left by sub-candle progress */}
      <g clipPath="url(#candleClip)">
        <g transform={`translate(${-shift}, 0)`}>
          {view.map((c, i) => {
            // Position so the most recent completed candle ends up at column (VISIBLE-1)
            // once subProgress reaches 1. While subProgress < 1, it sits one column right.
            const col = i + (VISIBLE - view.length) + 1;
            const cx = pad + colW * col + colW / 2;
            const up = c.c >= c.o;
            const color = up ? "#10b981" : "#ef4444";
            const yo = y(c.o), yc = y(c.c), yh = y(c.h), yl = y(c.l);
            const top = Math.min(yo, yc);
            const bh = Math.max(1, Math.abs(yc - yo));
            return (
              <g key={startIdx + i}>
                <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={color} strokeWidth={1} />
                <rect x={cx - bodyW / 2} y={top} width={bodyW} height={bh} fill={color} stroke={color} strokeWidth={1} />
              </g>
            );
          })}
        </g>
      </g>

      {/* live price marker — smooth, no jitter */}
      <line x1={pad} x2={w - pad} y1={lastY} y2={lastY} stroke={lastCol} strokeOpacity={0.7} strokeWidth={1} strokeDasharray="4 3" />
      <rect x={w - pad - 56} y={lastY - 8} width={54} height={16} rx={3} fill={lastCol} />
      <text x={w - pad - 4} y={lastY + 4} fill="#fff" fontSize="11" textAnchor="end" fontFamily="monospace" fontWeight="bold">{livePrice.toFixed(2)}</text>
      <circle cx={Math.min(w - pad, liveCx)} cy={lastY} r={3} fill={lastCol} stroke="#fff" strokeWidth={1} />
    </svg>
  );
}



function SettingsModal({
  t, settings, onClose, onSave, onReset,
}: {
  t: typeof T["fr"];
  settings: AppSettings;
  onClose: () => void;
  onSave: (s: AppSettings) => void;
  onReset: () => void;
}) {
  const [s, setS] = useState<AppSettings>(settings);
  const [raw, setRaw] = useState({
    initial: String(settings.initial),
    target: String(settings.target),
    duration: String(settings.duration || 15),
  });
  const numField = (key: "initial" | "target" | "duration") => ({
    type: "number" as const,
    required: true,
    inputMode: "decimal" as const,
    className: "setting-input",
    value: raw[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setRaw((r) => ({ ...r, [key]: v }));
      if (v !== "") setS((cur) => ({ ...cur, [key]: parseFloat(v) || 0 }));
    },
  });
  const canSave = raw.initial !== "" && raw.target !== "" && raw.duration !== "" && s.name.trim() !== "";
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...s,
      initial: parseFloat(raw.initial) || 0,
      target: parseFloat(raw.target) || 0,
      duration: parseFloat(raw.duration) || 15,
    });
  };
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[440px] bg-[#0e1424] ring-1 ring-white/10 text-slate-100 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">{t.settings}</div>
          <div className="h-1 w-10 bg-white/15 rounded-full sm:hidden" />
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Тема / Theme">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setS({ ...s, theme: "modern" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "modern" ? "ring-emerald-400 bg-emerald-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg bg-gradient-to-br from-emerald-400/40 to-cyan-500/30 mb-1.5 flex items-end p-1.5">
                  <div className="w-full h-1 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Modern</div>
                <div className="text-[10px] text-slate-400">Линейный график</div>
              </button>
              <button
                type="button"
                onClick={() => setS({ ...s, theme: "terminal" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "terminal" ? "ring-emerald-400 bg-emerald-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg bg-white mb-1.5 flex items-end gap-0.5 px-1.5 py-1 ring-1 ring-slate-300">
                  <div className="w-1 h-3 bg-[#02c076]" />
                  <div className="w-1 h-5 bg-[#02c076]" />
                  <div className="w-1 h-2 bg-[#f6465d]" />
                  <div className="w-1 h-6 bg-[#02c076]" />
                  <div className="w-1 h-4 bg-[#f6465d]" />
                  <div className="w-1 h-7 bg-[#02c076]" />
                  <div className="w-1 h-5 bg-[#02c076]" />
                  <div className="w-1 h-8 bg-[#f0b90b]" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Exchange</div>
                <div className="text-[10px] text-slate-400">Светлая биржа</div>
              </button>
              <button
                type="button"
                onClick={() => setS({ ...s, theme: "neon" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "neon" ? "ring-violet-400 bg-violet-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 relative overflow-hidden" style={{ background: "#0c0d10" }}>
                  <div className="absolute inset-x-2 bottom-2">
                    <svg viewBox="0 0 60 20" className="w-full h-4">
                      <polyline points="0,16 12,12 24,14 36,7 48,9 60,3" fill="none" stroke="#a78bfa" strokeWidth="1.4" />
                    </svg>
                  </div>
                  <div className="absolute top-1.5 left-2 text-[8px] font-medium tracking-wide text-zinc-300">Pulse</div>
                </div>
                <div className="text-xs font-semibold text-slate-200">Mono</div>
                <div className="text-[10px] text-slate-400">Тёмный минимализм</div>
              </button>
              <button
                type="button"
                onClick={() => setS({ ...s, theme: "heatmap" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "heatmap" ? "ring-emerald-400 bg-emerald-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 grid grid-cols-4 grid-rows-2 gap-[2px] p-[3px]" style={{ background: "#0a0a0a" }}>
                  <div className="bg-[#16a34a] rounded-sm col-span-2 row-span-2" />
                  <div className="bg-[#22c55e] rounded-sm" />
                  <div className="bg-[#dc2626] rounded-sm" />
                  <div className="bg-[#15803d] rounded-sm" />
                  <div className="bg-[#ef4444] rounded-sm" />
                </div>
                <div className="text-xs font-semibold text-slate-200">Heatmap</div>
                <div className="text-[10px] text-slate-400">Тепловая карта рынка</div>
              </button>

              <button
                type="button"
                onClick={() => setS({ ...s, theme: "paper" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "paper" ? "ring-indigo-400 bg-indigo-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 relative overflow-hidden" style={{ background: "#f4f1ec" }}>
                  <div className="absolute top-1.5 left-2 text-[8px] font-medium tracking-wide text-stone-700">Pulse</div>
                  <svg viewBox="0 0 60 20" className="absolute inset-x-2 bottom-1.5 w-[calc(100%-16px)] h-4">
                    <polyline points="0,16 12,12 24,14 36,7 48,9 60,3" fill="none" stroke="#4f46e5" strokeWidth="1.4" />
                  </svg>
                </div>
                <div className="text-xs font-semibold text-slate-200">Soft</div>
                <div className="text-[10px] text-slate-400">Светлый минимализм</div>
              </button>

              <button
                type="button"
                onClick={() => setS({ ...s, theme: "ocean" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "ocean" ? "ring-cyan-400 bg-cyan-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #04111f, #0c4a6e)" }}>
                  <svg viewBox="0 0 60 20" className="absolute inset-x-1 bottom-1 w-[calc(100%-8px)] h-5">
                    <path d="M0,14 Q15,8 30,12 T60,10" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
                    <path d="M0,14 Q15,8 30,12 T60,10 L60,20 L0,20 Z" fill="#22d3ee" fillOpacity="0.25" />
                  </svg>
                  <div className="absolute top-1.5 left-2 text-[8px] font-medium tracking-wide text-cyan-200">Ocean</div>
                </div>
                <div className="text-xs font-semibold text-slate-200">Ocean</div>
                <div className="text-[10px] text-slate-400">Глубокий синий</div>
              </button>

              <button
                type="button"
                onClick={() => setS({ ...s, theme: "matrix" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "matrix" ? "ring-emerald-400 bg-emerald-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 relative overflow-hidden font-mono" style={{ background: "#000" }}>
                  <div className="absolute top-1 left-1.5 text-[7px] text-emerald-500 leading-tight">&gt; RUN</div>
                  <div className="absolute top-1 right-1.5 text-[7px] text-emerald-500">01</div>
                  <div className="absolute bottom-1 left-1.5 right-1.5 flex items-end gap-[1px]">
                    {[3,5,4,7,5,8,6,9,7,5,8,6].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500" style={{ height: `${h * 2}px` }} />
                    ))}
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-200">Matrix</div>
                <div className="text-[10px] text-slate-400">Зелёный терминал</div>
              </button>

              <button
                type="button"
                onClick={() => setS({ ...s, theme: "glass" })}
                className={`p-2 rounded-xl text-left ring-1 transition ${s.theme === "glass" ? "ring-violet-400 bg-violet-400/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
              >
                <div className="h-12 rounded-lg mb-1.5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fce7f3, #ddd6fe, #bae6fd)" }}>
                  <div className="absolute inset-1.5 rounded-md bg-white/40 ring-1 ring-white/60 backdrop-blur-md flex items-end p-1">
                    <div className="w-full h-1 rounded-full bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400" />
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-200">Glass</div>
                <div className="text-[10px] text-slate-400">Матовое стекло</div>
              </button>

            </div>
          </Field>



          <Field label="Палитра">
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_FILTERS.map((f, i) => {
                const active = (s.themeAccent ?? 0) === i;
                const [a, b, c] = ACCENT_SWATCHES[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setS({ ...s, themeAccent: i })}
                    className={`p-1.5 rounded-xl text-left ring-1 transition ${active ? "ring-white/60 bg-white/10" : "ring-white/10 bg-white/[0.03] hover:bg-white/5"}`}
                  >
                    <div
                      className="h-8 rounded-lg mb-1"
                      style={{ background: `linear-gradient(135deg, ${a}, ${b} 55%, ${c})` }}
                    />
                    <div className="text-[10px] font-semibold text-slate-200 truncate">
                      {ACCENT_NAMES[i]}
                    </div>
                  </button>
                );
              })}
            </div>
          </Field>


          <Field label={t.name}>
            <input className="setting-input" required value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          </Field>
          <Field label={t.avatar}>
            <input className="setting-input" placeholder="https://..." value={s.avatar} onChange={(e) => setS({ ...s, avatar: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.currency}>
              <select className="setting-input" value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })}>
                {[
                  { symbol: "$", label: "USD" },
                  { symbol: "C$", label: "CAD" },
                  { symbol: "A$", label: "AUD" },
                  { symbol: "€", label: "EUR" },
                  { symbol: "₽", label: "RUB" },
                  { symbol: "£", label: "GBP" },
                  { symbol: "¥", label: "CNY/JPY" },
                  { symbol: "₩", label: "KRW" },
                  { symbol: "Mex$", label: "MXN" }
                ].map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.symbol} ({c.label})
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.language}>
              <select className="setting-input" value={s.lang} onChange={(e) => setS({ ...s, lang: e.target.value as Lang })}>
                <option value="fr">Французский</option>
                <option value="en">Английский</option>
                <option value="ru">Русский</option>
                <option value="es">Испанский</option>
                <option value="de">Немецкий</option>
                <option value="ko">Корейский</option>
                <option value="it">Итальянский</option>
                <option value="mx">Испанский (Мексика)</option>
              </select>
            </Field>
          </div>
          <Field label={t.initial}>
            <input {...numField("initial")} />
          </Field>
          <Field label={t.target}>
            <input {...numField("target")} />
          </Field>
          <Field label={t.duration}>
            <input {...numField("duration")} />
          </Field>

          {/* Withdrawals manager */}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">{t.withdrawals}</div>
              <button
                type="button"
                onClick={() => setS({
                  ...s,
                  withdrawals: [
                    { id: String(Date.now()), amount: 0, method: PAYMENT_METHODS[0], status: "pending", date: new Date().toISOString() },
                    ...s.withdrawals,
                  ],
                })}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-400/25"
              >
                + {t.addWithdrawal}
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {s.withdrawals.length === 0 && (
                <div className="text-xs text-slate-500 text-center py-3">—</div>
              )}
              {s.withdrawals.map((w, i) => (
                <div key={w.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-1.5 items-center">
                  <input
                    type="number"
                    className="setting-input !py-1.5 !text-xs"
                    value={w.amount}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      const list = [...s.withdrawals];
                      list[i] = { ...w, amount: v };
                      setS({ ...s, withdrawals: list });
                    }}
                  />
                  <select
                    className="setting-input !py-1.5 !text-xs"
                    value={w.method}
                    onChange={(e) => {
                      const list = [...s.withdrawals];
                      list[i] = { ...w, method: e.target.value };
                      setS({ ...s, withdrawals: list });
                    }}
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    className="setting-input !py-1.5 !text-xs"
                    value={w.status}
                    onChange={(e) => {
                      const list = [...s.withdrawals];
                      list[i] = { ...w, status: e.target.value as WStatus };
                      setS({ ...s, withdrawals: list });
                    }}
                  >
                    <option value="completed">{t.completed}</option>
                    <option value="pending">{t.pending}</option>
                    <option value="processing">{t.processing}</option>
                    <option value="error">{t.error}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setS({ ...s, withdrawals: s.withdrawals.filter((x) => x.id !== w.id) })}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/30 text-rose-300 hover:bg-rose-500/20 flex items-center justify-center"
                    aria-label="delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Banks manager (per selected language) */}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Банки ({s.lang.toUpperCase()})</div>
              <button
                type="button"
                onClick={() => {
                  const langBanks = s.banks[s.lang] || [];
                  setS({
                    ...s,
                    banks: {
                      ...s.banks,
                      [s.lang]: [...langBanks, { id: String(Date.now()), name: "", icon: "" }],
                    },
                  });
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 hover:bg-emerald-400/25"
              >
                + Добавить банк
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
              {(!s.banks[s.lang] || s.banks[s.lang]!.length === 0) && (
                <div className="text-xs text-slate-500 text-center py-3">— Нет банков для этого языка —</div>
              )}
              {(s.banks[s.lang] || []).map((b, i) => (
                <div key={b.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] ring-1 ring-white/10">
                  <label className="w-10 h-10 shrink-0 rounded-lg bg-white/5 ring-1 ring-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/10 relative">
                    {b.icon ? (
                      <img src={b.icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-slate-400 text-center px-1 leading-tight">Иконка</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = String(ev.target?.result || "");
                          const list = [...(s.banks[s.lang] || [])];
                          list[i] = { ...b, icon: dataUrl };
                          setS({ ...s, banks: { ...s.banks, [s.lang]: list } });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Название банка"
                    className="setting-input !py-1.5 !text-xs flex-1"
                    value={b.name}
                    onChange={(e) => {
                      const list = [...(s.banks[s.lang] || [])];
                      list[i] = { ...b, name: e.target.value };
                      setS({ ...s, banks: { ...s.banks, [s.lang]: list } });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const list = (s.banks[s.lang] || []).filter((x) => x.id !== b.id);
                      setS({ ...s, banks: { ...s.banks, [s.lang]: list } });
                    }}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 ring-1 ring-rose-400/30 text-rose-300 hover:bg-rose-500/20 flex items-center justify-center shrink-0"
                    aria-label="delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={() => { onReset(); }} className="flex-1 py-3 rounded-xl bg-white/5 ring-1 ring-white/10 text-slate-200 font-medium hover:bg-white/10">
            {t.reset}
          </button>
          <button onClick={handleSave} disabled={!canSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {t.save}
          </button>
        </div>
      </div>
      <style>{`.setting-input{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);color:#f1f5f9;font-size:14px;outline:none}.setting-input:focus{border-color:#34d399;background:rgba(255,255,255,0.05)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function statusMeta(status: WStatus, t: typeof T["fr"]) {
  switch (status) {
    case "completed": return { label: t.completed, color: "text-emerald-300", bg: "bg-emerald-500/15 ring-emerald-400/30", Icon: CheckCircle2 };
    case "pending": return { label: t.pending, color: "text-amber-300", bg: "bg-amber-500/15 ring-amber-400/30", Icon: Clock };
    case "processing": return { label: t.processing, color: "text-cyan-300", bg: "bg-cyan-500/15 ring-cyan-400/30", Icon: Loader2 };
    case "error": return { label: t.error, color: "text-rose-300", bg: "bg-rose-500/15 ring-rose-400/30", Icon: AlertCircle };
  }
}

type WithdrawTokens = {
  overlay: string;
  sheet: string;
  title: string;
  closeBtn: string;
  earnedCard: string;
  earnedLabel: string;
  earnedValue: string;
  sectionLabel: string;
  input: string;
  methodActive: string;
  methodIdle: string;
  methodIconColor: string;
  primaryBtn: string;
  historyItem: string;
  historyMeta: string;
  emptyText: string;
  inputStyle: string;
  rounded: string;
  iconAccent: string;
};

const WITHDRAW_THEMES: Record<Theme, WithdrawTokens> = {
  modern: {
    overlay: "bg-black/60 backdrop-blur-sm",
    sheet: "bg-[#0e1424] ring-1 ring-white/10 text-slate-100",
    title: "text-slate-100",
    closeBtn: "bg-white/5 hover:bg-white/10 text-slate-400",
    earnedCard: "bg-gradient-to-br from-emerald-400/15 to-cyan-500/10 ring-1 ring-emerald-400/20",
    earnedLabel: "text-emerald-200/80",
    earnedValue: "bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent",
    sectionLabel: "text-slate-400",
    input: "setting-input",
    methodActive: "bg-emerald-400/15 ring-emerald-400/40 text-emerald-200",
    methodIdle: "bg-white/[0.03] ring-white/10 text-slate-300 hover:bg-white/[0.06]",
    methodIconColor: "text-emerald-400",
    primaryBtn: "bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 shadow-lg shadow-emerald-500/30",
    historyItem: "bg-white/[0.03] ring-1 ring-white/10",
    historyMeta: "text-slate-400",
    emptyText: "text-slate-500",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);color:#f1f5f9;font-size:14px;outline:none}.setting-input:focus{border-color:#34d399;background:rgba(255,255,255,0.05)}",
    rounded: "rounded-t-3xl sm:rounded-3xl",
    iconAccent: "text-emerald-300",
  },
  terminal: {
    overlay: "bg-slate-900/40 backdrop-blur-sm",
    sheet: "bg-white ring-1 ring-slate-200 text-slate-900 shadow-2xl",
    title: "text-slate-900",
    closeBtn: "bg-slate-100 hover:bg-slate-200 text-slate-600",
    earnedCard: "bg-[#fcf6e3] ring-1 ring-[#f0b90b]/40",
    earnedLabel: "text-[#a07a07]",
    earnedValue: "text-[#02c076]",
    sectionLabel: "text-slate-500",
    input: "setting-input",
    methodActive: "bg-[#fcd535]/20 ring-[#f0b90b] text-slate-900",
    methodIdle: "bg-slate-50 ring-slate-200 text-slate-700 hover:bg-slate-100",
    methodIconColor: "text-[#02c076]",
    primaryBtn: "bg-[#02c076] hover:bg-[#01a866] text-white shadow-md shadow-[#02c076]/30",
    historyItem: "bg-slate-50 ring-1 ring-slate-200",
    historyMeta: "text-slate-500",
    emptyText: "text-slate-400",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;color:#0f172a;font-size:14px;outline:none}.setting-input:focus{border-color:#f0b90b;background:#fff}",
    rounded: "rounded-t-2xl sm:rounded-2xl",
    iconAccent: "text-[#f0b90b]",
  },
  neon: {
    overlay: "bg-black/70 backdrop-blur-sm",
    sheet: "bg-[#111114] ring-1 ring-white/[0.06] text-zinc-100",
    title: "text-zinc-100",
    closeBtn: "bg-white/5 hover:bg-white/10 text-zinc-400",
    earnedCard: "bg-violet-500/10 ring-1 ring-violet-400/25",
    earnedLabel: "text-violet-300/80",
    earnedValue: "text-violet-300",
    sectionLabel: "text-zinc-500",
    input: "setting-input",
    methodActive: "bg-violet-500/15 ring-violet-400/40 text-violet-200",
    methodIdle: "bg-white/[0.03] ring-white/[0.06] text-zinc-300 hover:bg-white/[0.06]",
    methodIconColor: "text-violet-300",
    primaryBtn: "bg-violet-500 hover:bg-violet-600 text-white",
    historyItem: "bg-white/[0.03] ring-1 ring-white/[0.06]",
    historyMeta: "text-zinc-500",
    emptyText: "text-zinc-600",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.07);border-radius:10px;background:rgba(255,255,255,0.03);color:#f4f4f5;font-size:14px;outline:none}.setting-input:focus{border-color:#a78bfa;background:rgba(255,255,255,0.05)}",
    rounded: "rounded-t-2xl sm:rounded-2xl",
    iconAccent: "text-violet-300",
  },
  paper: {
    overlay: "bg-stone-900/30 backdrop-blur-sm",
    sheet: "bg-white ring-1 ring-stone-200 text-stone-900 shadow-xl",
    title: "text-stone-900",
    closeBtn: "bg-stone-100 hover:bg-stone-200 text-stone-600",
    earnedCard: "bg-indigo-50 ring-1 ring-indigo-200",
    earnedLabel: "text-indigo-500",
    earnedValue: "text-indigo-600",
    sectionLabel: "text-stone-500",
    input: "setting-input",
    methodActive: "bg-indigo-50 ring-indigo-300 text-indigo-700",
    methodIdle: "bg-stone-50 ring-stone-200 text-stone-700 hover:bg-stone-100",
    methodIconColor: "text-indigo-500",
    primaryBtn: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm",
    historyItem: "bg-stone-50 ring-1 ring-stone-200",
    historyMeta: "text-stone-500",
    emptyText: "text-stone-400",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid #e7e5e4;border-radius:14px;background:#fafaf9;color:#1c1917;font-size:14px;outline:none}.setting-input:focus{border-color:#6366f1;background:#fff}",
    rounded: "rounded-t-3xl sm:rounded-3xl",
    iconAccent: "text-indigo-500",
  },
  heatmap: {
    overlay: "bg-black/75 backdrop-blur-sm",
    sheet: "bg-[#0a0a0a] ring-1 ring-white/10 text-zinc-100",
    title: "text-zinc-50",
    closeBtn: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300",
    earnedCard: "bg-emerald-500/10 ring-1 ring-emerald-500/30",
    earnedLabel: "text-emerald-400",
    earnedValue: "text-emerald-400",
    sectionLabel: "text-zinc-500",
    input: "setting-input",
    methodActive: "bg-emerald-500/15 ring-emerald-500/50 text-emerald-300",
    methodIdle: "bg-[#111111] ring-white/10 text-zinc-300 hover:bg-zinc-800",
    methodIconColor: "text-emerald-400",
    primaryBtn: "bg-emerald-500 hover:bg-emerald-600 text-white uppercase tracking-[0.15em]",
    historyItem: "bg-[#111111] ring-1 ring-white/10",
    historyMeta: "text-zinc-500",
    emptyText: "text-zinc-600",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:#111;color:#fafafa;font-size:14px;outline:none}.setting-input:focus{border-color:#10b981;background:#0e0e0e}",
    rounded: "rounded-t-2xl sm:rounded-2xl",
    iconAccent: "text-emerald-400",
  },
  ocean: {
    overlay: "bg-[#04111f]/70 backdrop-blur-sm",
    sheet: "bg-[#072034] ring-1 ring-sky-700/40 text-sky-50",
    title: "text-sky-50",
    closeBtn: "bg-sky-900/60 hover:bg-sky-800/60 text-sky-300",
    earnedCard: "bg-cyan-500/10 ring-1 ring-cyan-400/30",
    earnedLabel: "text-cyan-300/80",
    earnedValue: "text-cyan-300",
    sectionLabel: "text-sky-400/70",
    input: "setting-input",
    methodActive: "bg-cyan-500/15 ring-cyan-400/50 text-cyan-200",
    methodIdle: "bg-sky-900/40 ring-sky-700/40 text-sky-200 hover:bg-sky-800/50",
    methodIconColor: "text-cyan-300",
    primaryBtn: "bg-gradient-to-r from-cyan-400 to-sky-500 text-sky-950 shadow-lg shadow-cyan-500/30",
    historyItem: "bg-sky-900/40 ring-1 ring-sky-700/40",
    historyMeta: "text-sky-400/70",
    emptyText: "text-sky-500/70",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(56,189,248,0.2);border-radius:12px;background:rgba(7,32,52,0.6);color:#f0f9ff;font-size:14px;outline:none}.setting-input:focus{border-color:#22d3ee;background:rgba(7,32,52,0.9)}",
    rounded: "rounded-t-2xl sm:rounded-2xl",
    iconAccent: "text-cyan-300",
  },
  matrix: {
    overlay: "bg-black/85 backdrop-blur-sm",
    sheet: "bg-black ring-1 ring-emerald-700/50 text-emerald-300 font-mono",
    title: "text-emerald-300",
    closeBtn: "bg-emerald-950 hover:bg-emerald-900 text-emerald-400 ring-1 ring-emerald-800",
    earnedCard: "bg-emerald-500/10 ring-1 ring-emerald-500/40",
    earnedLabel: "text-emerald-500",
    earnedValue: "text-emerald-400",
    sectionLabel: "text-emerald-700",
    input: "setting-input",
    methodActive: "bg-emerald-500/15 ring-emerald-400/60 text-emerald-300",
    methodIdle: "bg-black ring-emerald-900 text-emerald-500 hover:bg-emerald-950",
    methodIconColor: "text-emerald-400",
    primaryBtn: "bg-emerald-500 hover:bg-emerald-600 text-black uppercase tracking-[0.2em]",
    historyItem: "bg-black ring-1 ring-emerald-900",
    historyMeta: "text-emerald-700",
    emptyText: "text-emerald-800",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(16,185,129,0.3);border-radius:6px;background:#000;color:#6ee7b7;font-size:14px;font-family:ui-monospace,monospace;outline:none}.setting-input:focus{border-color:#22c55e;background:#020f08}",
    rounded: "rounded-t-lg sm:rounded-lg",
    iconAccent: "text-emerald-400",
  },
  glass: {
    overlay: "bg-slate-900/20 backdrop-blur-md",
    sheet: "bg-white/40 ring-1 ring-white/60 text-slate-900 backdrop-blur-2xl shadow-2xl shadow-slate-900/10",
    title: "text-slate-900",
    closeBtn: "bg-white/50 hover:bg-white/70 text-slate-700 ring-1 ring-white/60",
    earnedCard: "bg-white/50 ring-1 ring-white/60",
    earnedLabel: "text-slate-600",
    earnedValue: "bg-gradient-to-r from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent",
    sectionLabel: "text-slate-600/80",
    input: "setting-input",
    methodActive: "bg-white/60 ring-violet-400/60 text-slate-900",
    methodIdle: "bg-white/30 ring-white/50 text-slate-700 hover:bg-white/50",
    methodIconColor: "text-violet-500",
    primaryBtn: "bg-white/70 hover:bg-white/90 text-slate-900 ring-1 ring-white/80 backdrop-blur shadow-md",
    historyItem: "bg-white/40 ring-1 ring-white/50",
    historyMeta: "text-slate-600/80",
    emptyText: "text-slate-500/80",
    inputStyle: ".setting-input{width:100%;padding:10px 12px;border:1px solid rgba(255,255,255,0.6);border-radius:14px;background:rgba(255,255,255,0.4);color:#0f172a;font-size:14px;backdrop-filter:blur(8px);outline:none}.setting-input:focus{border-color:rgba(139,92,246,0.6);background:rgba(255,255,255,0.6)}",
    rounded: "rounded-t-3xl sm:rounded-3xl",
    iconAccent: "text-violet-500",
  },
};

function statusMetaThemed(status: WStatus, t: typeof T["fr"], theme: Theme) {
  // Use existing statusMeta but recolor backgrounds for light themes.
  const base = statusMeta(status, t);
  const isLight = theme === "terminal" || theme === "paper" || theme === "glass";
  if (!isLight) return base;
  // Soften bg for light themes
  const lightBg: Record<WStatus, string> = {
    completed: "bg-emerald-50 ring-1 ring-emerald-200",
    pending: "bg-amber-50 ring-1 ring-amber-200",
    processing: "bg-sky-50 ring-1 ring-sky-200",
    error: "bg-rose-50 ring-1 ring-rose-200",
  };
  return { ...base, bg: lightBg[status] };
}

function WithdrawSheet({
  theme, t, profit, currency, withdrawals, onClose, onWithdraw,
}: {
  theme: Theme;
  t: typeof T["fr"];
  profit: number;
  currency: string;
  withdrawals: Withdrawal[];
  onClose: () => void;
  onWithdraw: (amount: number, method: string) => void;
}) {
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [amountRaw, setAmountRaw] = useState(String(Math.max(0, Math.round(profit * 100) / 100)));
  const amount = parseFloat(amountRaw) || 0;
  const canWithdraw = amount > 0;
  const tk = WITHDRAW_THEMES[theme] ?? WITHDRAW_THEMES.modern;
  const isLight = theme === "terminal" || theme === "paper" || theme === "glass";
  const grabber = isLight ? "bg-slate-300" : "bg-white/15";
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in ${tk.overlay}`}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full max-w-[440px] p-5 max-h-[92vh] overflow-y-auto ${tk.rounded} ${tk.sheet}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 text-lg font-semibold ${tk.title}`}>
            <Wallet className={`w-5 h-5 ${tk.iconAccent}`} /> {t.withdraw}
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center ${tk.closeBtn}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className={`h-1 w-10 rounded-full mx-auto -mt-2 mb-3 sm:hidden ${grabber}`} />

        {/* Earned card */}
        <div className={`rounded-2xl p-4 mb-4 ${tk.earnedCard}`}>
          <div className={`text-[10px] uppercase tracking-[0.2em] mb-1 ${tk.earnedLabel}`}>{t.earned}</div>
          <div className={`text-3xl font-bold tabular-nums tracking-tight ${tk.earnedValue}`}>
            +{fmt(Math.max(0, profit), currency)}
          </div>
        </div>

        {/* Amount */}
        <label className="flex flex-col gap-1 mb-3">
          <span className={`text-[10px] uppercase tracking-[0.18em] ${tk.sectionLabel}`}>{t.amount}</span>
          <input
            type="number"
            inputMode="decimal"
            className={tk.input}
            value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value)}
          />
        </label>

        {/* Payment methods */}
        <div className="mb-4">
          <div className={`text-[10px] uppercase tracking-[0.18em] mb-2 ${tk.sectionLabel}`}>{t.paymentMethod}</div>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const getMethodIcon = (methodName: string) => {
                if (methodName === "Bank") {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${tk.methodIconColor}`}>
                      <line x1="3" y1="21" x2="21" y2="21"></line>
                      <line x1="6" y1="21" x2="6" y2="11"></line>
                      <line x1="10" y1="21" x2="10" y2="11"></line>
                      <line x1="14" y1="21" x2="14" y2="11"></line>
                      <line x1="18" y1="21" x2="18" y2="11"></line>
                      <polygon points="12 2 2 7 22 7"></polygon>
                    </svg>
                  );
                }
                if (methodName === "PayPal") {
                  return (
                    <svg viewBox="0 0 24 24" className={`w-5 h-5 fill-current ${tk.methodIconColor}`}>
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.354a1.282 1.282 0 0 1 1.266-1.077h7.26c3.155 0 5.485.679 6.81 1.99 1.137 1.121 1.488 2.853 1.017 5.021-.69 3.178-2.88 5.372-5.757 5.372h-3.41l-.924 5.928a.642.642 0 0 1-.633.549H7.076z"/>
                      <path opacity="0.7" d="M11.643 14.66h2.784c2.877 0 5.067-2.194 5.756-5.372.338-1.554.218-2.813-.393-3.738-1.02 1.545-2.903 2.502-5.597 2.502H11.41l-.924 5.932a.641.641 0 0 0 .633.549z" />
                    </svg>
                  );
                }
                if (methodName === "Crypto") {
                  return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${tk.methodIconColor}`}>
                      <circle cx="12" cy="12" r="8"></circle>
                      <line x1="12" y1="6" x2="12" y2="18"></line>
                      <line x1="10" y1="9" x2="14" y2="9"></line>
                      <line x1="10" y1="15" x2="14" y2="15"></line>
                    </svg>
                  );
                }
                return <CreditCard className={`w-5 h-5 ${tk.methodIconColor}`} />;
              };

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-center gap-1.5 px-2.5 py-3 rounded-xl ring-1 text-xs font-medium transition ${
                    method === m ? tk.methodActive : tk.methodIdle
                  }`}
                >
                  {getMethodIcon(m)}
                  <span className="truncate text-[11px]">{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          disabled={!canWithdraw}
          onClick={() => onWithdraw(amount, method)}
          className={`w-full py-3.5 rounded-2xl text-base font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition ${tk.primaryBtn}`}
        >
          {t.withdraw} {canWithdraw ? fmt(amount, currency) : ""}
        </button>

        {/* History */}
        <div className="mt-5">
          <div className={`text-[11px] uppercase tracking-[0.18em] mb-2 ${tk.sectionLabel}`}>{t.history}</div>
          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
            {withdrawals.length === 0 && (
              <div className={`text-xs text-center py-4 ${tk.emptyText}`}>—</div>
            )}
            {withdrawals.map((w) => {
              const meta = statusMetaThemed(w.status, t, theme);
              return (
                <div key={w.id} className={`flex items-center gap-3 p-3 rounded-2xl ${tk.historyItem}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <meta.Icon className={`w-4 h-4 ${meta.color} ${w.status === "processing" ? "animate-spin" : ""}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-semibold tabular-nums truncate">{fmt(w.amount, currency)}</div>
                      <div className={`text-[10px] uppercase tracking-wider ${meta.color}`}>{meta.label}</div>
                    </div>
                    <div className={`text-[11px] truncate ${tk.historyMeta}`}>
                      {w.method} · {new Date(w.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{tk.inputStyle}</style>
    </div>
  );
}


function IOSNotification({
  method, amount, balance, currency, lang, customBank, onClose,
}: {
  method: string;
  amount: number;
  balance: number;
  currency: string;
  lang: Lang;
  customBank: Bank | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => setVisible(false), 5000);
    const t3 = setTimeout(onClose, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  // Generate stable details for this notification instance
  const last4 = useMemo(() => Math.floor(1000 + Math.random() * 9000), []);

  const NOTIF_T = {
    fr: {
      title: "Nouvelle transaction",
      body: (m: string, amt: string, bal: string) => `Transaction ${m}*${last4} : ${amt}, Solde : ${bal}`,
      time: "maintenant",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "ROYAL BANK OF CANADA";
      }
    },
    ru: {
      title: "Входящий перевод",
      body: (m: string, amt: string, bal: string) => `Зачисление ${m}*${last4} : +${amt}, Баланс: ${bal}`,
      time: "сейчас",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "Т-БАНК";
      }
    },
    en: {
      title: "New Transaction",
      body: (m: string, amt: string, bal: string) => `Transaction ${m}*${last4} : +${amt}, Balance: ${bal}`,
      time: "now",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "ROYAL BANK OF CANADA";
      }
    },
    es: {
      title: "Nueva transacción",
      body: (m: string, amt: string, bal: string) => `Transacción ${m}*${last4} : +${amt}, Saldo: ${bal}`,
      time: "ahora",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "SANTANDER";
      }
    },
    de: {
      title: "Neue Transaktion",
      body: (m: string, amt: string, bal: string) => `Transaktion ${m}*${last4} : +${amt}, Kontostand: ${bal}`,
      time: "jetzt",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "DEUTSCHE BANK";
      }
    },
    ko: {
      title: "새 거래 알림",
      body: (m: string, amt: string, bal: string) => `거래 ${m}*${last4} : +${amt}, 잔액: ${bal}`,
      time: "지금",
      bank: (m: string) => {
        if (m === "PayPal") return "페이팔";
        if (m === "Apple Pay") return "애플 월렛";
        if (m === "Crypto") return "바이낸스";
        return "국민은행";
      }
    },
    it: {
      title: "Nuova transazione",
      body: (m: string, amt: string, bal: string) => `Transazione ${m}*${last4} : +${amt}, Saldo: ${bal}`,
      time: "ora",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "INTESA SANPAOLO";
      }
    },
    mx: {
      title: "Nueva transacción",
      body: (m: string, amt: string, bal: string) => `Transacción ${m}*${last4} : +${amt}, Saldo: ${bal}`,
      time: "ahora",
      bank: (m: string) => {
        if (m === "PayPal") return "PAYPAL";
        if (m === "Apple Pay") return "APPLE WALLET";
        if (m === "Crypto") return "BINANCE WALLET";
        return "BBVA MÉXICO";
      }
    }
  };

  const currentLang = NOTIF_T[lang] || NOTIF_T["en"];
  const bankName = customBank ? customBank.name.toUpperCase() : currentLang.bank(method);
  const titleText = currentLang.title;
  const timeText = currentLang.time;
  const bodyText = currentLang.body(method, fmt(amount, currency), fmt(balance, currency));

  // Determine icon styling based on bank
  const getBankIcon = () => {
    if (customBank) {
      return (
        <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] overflow-hidden bg-white flex items-center justify-center" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
          <img src={customBank.icon} alt={customBank.name} className="w-full h-full object-cover" />
        </div>
      );
    }
    if (bankName.includes("ROYAL") || bankName.includes("SANTANDER") || bankName.includes("DEUTSCHE") || bankName.includes("국민") || bankName.includes("INTESA") || bankName.includes("BBVA")) {
      return (
        <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] flex items-center justify-center bg-[#0c51a3]" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
          <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] text-amber-400 fill-current">
            <path d="M12 2L4 5v6c0 5.25 3.42 10.15 8 11.5 4.58-1.35 8-6.25 8-11.5V5l-8-3zm0 6a3 3 0 110 6 3 3 0 010-6z" />
          </svg>
        </div>
      );
    }
    if (bankName.includes("Т-БАНК") || bankName.includes("T-BANK")) {
      return (
        <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] flex items-center justify-center bg-[#ffdd2d]" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
          <span className="text-black font-extrabold text-[10px] leading-none select-none">Т</span>
        </div>
      );
    }
    if (bankName.includes("PAYPAL")) {
      return (
        <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] flex items-center justify-center bg-[#003087]" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
          <span className="text-white font-black italic text-[10px] leading-none select-none">P</span>
        </div>
      );
    }
    if (bankName.includes("APPLE")) {
      return (
        <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] flex items-center justify-center bg-[#000000]" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
          <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] text-white fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.07 2.47.3 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.12.01.24.02.35.02.94 0 2.05-.54 2.46-1.35z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-[18px] h-[18px] shrink-0 rounded-[4.5px] flex items-center justify-center bg-emerald-500" style={{ boxShadow: "0 0.5px 1px rgba(0,0,0,0.12)" }}>
        <Wallet className="w-[10px] h-[10px] text-white" />
      </div>
    );
  };

  return (
    <div className="fixed top-2 left-0 right-0 z-[100] flex justify-center pointer-events-none px-3">
      <div
        onClick={() => { setVisible(false); setTimeout(onClose, 250); }}
        className={`pointer-events-auto w-full max-w-[380px] cursor-pointer rounded-[24px] p-3.5 flex flex-col gap-1 transition-all duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 scale-[0.93]"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(30px) saturate(190%)",
          WebkitBackdropFilter: "blur(30px) saturate(190%)",
          boxShadow: "0 10px 30px -5px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 0.5px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', system-ui, sans-serif",
          color: "#000",
        }}
      >
        {/* Header line */}
        <div className="flex items-center justify-between w-full h-[18px]">
          <div className="flex items-center gap-1.5 min-w-0">
            {getBankIcon()}
            <span className="text-[10px] font-semibold tracking-[0.03em] uppercase truncate" style={{ color: "rgba(0,0,0,0.42)" }}>
              {bankName}
            </span>
          </div>
          <span className="text-[10.5px] font-normal tracking-[-0.01em] shrink-0" style={{ color: "rgba(0,0,0,0.38)" }}>
            {timeText}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex flex-col mt-0.5 leading-tight">
          <div className="text-[14.5px] font-semibold tracking-[-0.015em]" style={{ color: "rgba(0,0,0,0.92)" }}>
            {titleText}
          </div>
          <div className="text-[13.5px] font-normal tracking-[-0.01em] mt-[1.5px] leading-snug" style={{ color: "rgba(0,0,0,0.85)" }}>
            {bodyText}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Theme: MONO — Linear / Vercel style, dark minimal w/ single accent
// =============================================================
type ViewProps = {
  settings: AppSettings;
  balance: number;
  profit: number;
  progress: number;
  points: number[];
  running: boolean;
  t: typeof T.en;
  onToggle: () => void;
  onOpenSettings: () => void;
  onInc: () => void;
  onDec: () => void;
};

function NeonView({ settings, balance, profit, progress, points, running, t, onToggle, onOpenSettings, onInc, onDec }: ViewProps) {
  return (
    <div className="relative w-full max-w-[440px] h-full px-4 pt-3 pb-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-800 ring-1 ring-zinc-700">
            {settings.avatar ? <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-zinc-400" />}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm leading-tight truncate text-zinc-100">{settings.name}</div>
            <div className="text-[11px] text-zinc-500 truncate">{t.account}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${running ? "bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/30" : "bg-zinc-800/70 text-zinc-400 ring-1 ring-zinc-700"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-violet-400 animate-pulse" : "bg-zinc-500"}`} />
            {running ? t.live : t.idle}
          </div>
          <button onClick={onOpenSettings} className="w-9 h-9 rounded-lg bg-zinc-800/70 ring-1 ring-zinc-700 hover:bg-zinc-700/70 flex items-center justify-center text-zinc-300 shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-xl p-4 bg-zinc-900/60 ring-1 ring-zinc-800">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">{t.account}</div>
            <div className="text-[32px] leading-none font-semibold tabular-nums tracking-tight text-zinc-50">
              {fmt(balance, settings.currency)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">{t.profit}</div>
            <div className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-violet-300" : "text-rose-400"}`}>
              {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1.5">
            <span>{t.goal} {fmt(settings.target, settings.currency)}</span>
            <span className="tabular-nums">{Math.floor(progress * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-violet-500 transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-0 rounded-xl bg-zinc-900/60 ring-1 ring-zinc-800 overflow-hidden">
        <NeonChart points={points} target={settings.target} initial={settings.initial} />
      </div>

      {/* Investment */}
      <div className="rounded-xl p-3 bg-zinc-900/60 ring-1 ring-zinc-800">
        <div className="text-center text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-2">{t.invest}</div>
        <div className="flex items-center gap-2">
          <button onClick={onDec} className="w-11 h-11 rounded-lg bg-zinc-800 ring-1 ring-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 active:scale-95 transition">
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center text-xl font-semibold tabular-nums tracking-tight text-zinc-50">
            {fmt(settings.investment, settings.currency)}
          </div>
          <button onClick={onInc} className="w-11 h-11 rounded-lg bg-zinc-800 ring-1 ring-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 active:scale-95 transition">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onToggle}
        className={`w-full py-3.5 rounded-xl text-base font-semibold transition active:scale-[0.99] ${
          running
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-violet-500 hover:bg-violet-600 text-white"
        }`}
      >
        {running ? t.stop : t.start}
      </button>
    </div>
  );
}

function NeonChart({ points, target, initial }: { points: number[]; target: number; initial: number }) {
  const w = 400, h = 520, pad = 12;
  if (points.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">—</div>;
  }
  const minScale = Math.min(initial, target) - Math.abs(target - initial) * 0.08;
  const maxScale = Math.max(initial, target) + Math.abs(target - initial) * 0.08;
  const range = Math.max(0.5, maxScale - minScale);
  const n = points.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - minScale) / range) * (h - pad * 2);
  let d = `M ${x(0).toFixed(2)} ${y(points[0]).toFixed(2)}`;
  for (let i = 1; i < n; i++) d += ` L ${x(i).toFixed(2)} ${y(points[i]).toFixed(2)}`;
  const area = `${d} L ${x(n - 1).toFixed(2)} ${h - pad} L ${x(0).toFixed(2)} ${h - pad} Z`;
  const lastX = x(n - 1), lastY = y(points[n - 1]);
  const targetY = Math.max(pad, Math.min(h - pad, y(target)));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="monoArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="#27272a" strokeWidth={1} />
      ))}
      <line x1={pad} x2={w - pad} y1={targetY} y2={targetY} stroke="#52525b" strokeDasharray="3 4" />
      <path d={area} fill="url(#monoArea)" />
      <path d={d} fill="none" stroke="#a78bfa" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={6} fill="#a78bfa" fillOpacity={0.2} />
      <circle cx={lastX} cy={lastY} r={3} fill="#a78bfa" />
    </svg>
  );
}

// =============================================================
// Theme: SOFT — warm light minimal, Notion/Apple-like
// =============================================================
function PaperView({ settings, balance, profit, progress, points, running, t, onToggle, onOpenSettings, onInc, onDec }: ViewProps) {
  return (
    <div className="relative w-full max-w-[440px] h-full px-4 pt-3 pb-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-white ring-1 ring-stone-200">
            {settings.avatar ? <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-stone-500" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-tight truncate text-stone-900">{settings.name}</div>
            <div className="text-[11px] text-stone-500 truncate">{t.account}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${running ? "bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-300/50" : "bg-white text-stone-500 ring-1 ring-stone-200"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-indigo-500 animate-pulse" : "bg-stone-400"}`} />
            {running ? t.live : t.idle}
          </div>
          <button onClick={onOpenSettings} className="w-9 h-9 rounded-full bg-white ring-1 ring-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-600 shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-2xl p-4 bg-white ring-1 ring-stone-200 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-1">{t.account}</div>
            <div className="text-[32px] leading-none font-semibold tabular-nums tracking-tight text-stone-900">
              {fmt(balance, settings.currency)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-1">{t.profit}</div>
            <div className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
              {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1.5">
            <span>{t.goal} {fmt(settings.target, settings.currency)}</span>
            <span className="tabular-nums">{Math.floor(progress * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-0 rounded-2xl bg-white ring-1 ring-stone-200 shadow-sm overflow-hidden">
        <PaperChart points={points} target={settings.target} initial={settings.initial} />
      </div>

      {/* Investment */}
      <div className="rounded-2xl p-3 bg-white ring-1 ring-stone-200 shadow-sm">
        <div className="text-center text-[10px] uppercase tracking-[0.15em] text-stone-500 mb-2">{t.invest}</div>
        <div className="flex items-center gap-2">
          <button onClick={onDec} className="w-11 h-11 rounded-xl bg-stone-100 ring-1 ring-stone-200 hover:bg-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition">
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center text-xl font-semibold tabular-nums tracking-tight text-stone-900">
            {fmt(settings.investment, settings.currency)}
          </div>
          <button onClick={onInc} className="w-11 h-11 rounded-xl bg-stone-100 ring-1 ring-stone-200 hover:bg-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onToggle}
        className={`w-full py-3.5 rounded-2xl text-base font-semibold shadow-sm transition active:scale-[0.99] ${
          running
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-indigo-500 hover:bg-indigo-600 text-white"
        }`}
      >
        {running ? t.stop : t.start}
      </button>
    </div>
  );
}

function PaperChart({ points, target, initial }: { points: number[]; target: number; initial: number }) {
  const w = 400, h = 520, pad = 12;
  if (points.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">—</div>;
  }
  const minScale = Math.min(initial, target) - Math.abs(target - initial) * 0.08;
  const maxScale = Math.max(initial, target) + Math.abs(target - initial) * 0.08;
  const range = Math.max(0.5, maxScale - minScale);
  const n = points.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - minScale) / range) * (h - pad * 2);
  let d = `M ${x(0).toFixed(2)} ${y(points[0]).toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const x0 = x(i), y0 = y(points[i]);
    const x1 = x(i + 1), y1 = y(points[i + 1]);
    const cx = (x0 + x1) / 2;
    d += ` C ${cx.toFixed(2)} ${y0.toFixed(2)}, ${cx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  const area = `${d} L ${x(n - 1).toFixed(2)} ${h - pad} L ${x(0).toFixed(2)} ${h - pad} Z`;
  const lastX = x(n - 1), lastY = y(points[n - 1]);
  const targetY = Math.max(pad, Math.min(h - pad, y(target)));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="softArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="#e7e5e4" strokeWidth={1} />
      ))}
      <line x1={pad} x2={w - pad} y1={targetY} y2={targetY} stroke="#a8a29e" strokeDasharray="3 4" />
      <path d={area} fill="url(#softArea)" />
      <path d={d} fill="none" stroke="#4f46e5" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={6} fill="#6366f1" fillOpacity={0.2} />
      <circle cx={lastX} cy={lastY} r={3} fill="#4f46e5" />
    </svg>
  );
}


const HEATMAP_TICKERS = [
  // [symbol, sector, span: 1=1x1, 2=2x1, 3=2x2, 4=3x2]
  ["AAPL", "Tech", 4],
  ["MSFT", "Tech", 3],
  ["NVDA", "Tech", 3],
  ["GOOGL", "Tech", 2],
  ["AMZN", "Cons", 2],
  ["META", "Tech", 2],
  ["TSLA", "Auto", 2],
  ["BRK.B", "Fin", 2],
  ["JPM", "Fin", 1],
  ["V", "Fin", 1],
  ["UNH", "Hlth", 1],
  ["XOM", "Energy", 1],
  ["JNJ", "Hlth", 1],
  ["WMT", "Cons", 1],
  ["PG", "Cons", 1],
  ["MA", "Fin", 1],
  ["HD", "Cons", 1],
  ["CVX", "Energy", 1],
  ["LLY", "Hlth", 1],
  ["AVGO", "Tech", 1],
  ["KO", "Cons", 1],
  ["PEP", "Cons", 1],
  ["BAC", "Fin", 1],
  ["ABBV", "Hlth", 1],
] as const;

function HeatmapView({ settings, balance, profit, progress, points, running, t, onToggle, onOpenSettings, onInc, onDec }: ViewProps) {
  return (
    <div className="relative w-full max-w-[440px] h-full px-3 pt-3 pb-3 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#111111] rounded-2xl px-3 py-2 ring-1 ring-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 ring-1 ring-white/10">
            {settings.avatar ? <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-zinc-400" />}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-tight truncate text-zinc-100">{settings.name}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 truncate">S&P · {t.account}</div>
          </div>
        </div>
        <button onClick={onOpenSettings} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Balance */}
      <div className="rounded-2xl p-3.5 bg-[#111111] ring-1 ring-white/10">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1">Portfolio</div>
            <div className="text-[28px] leading-none font-semibold tabular-nums tracking-tight text-zinc-50">
              {fmt(balance, settings.currency)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold tabular-nums ${profit >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
              {profit >= 0 ? "▲" : "▼"} {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">{t.goal} {Math.floor(progress * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative flex-1 min-h-0 rounded-2xl bg-[#111111] ring-1 ring-white/10 overflow-hidden p-2.5">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${running ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">Market Heatmap</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">1D · % change</span>
        </div>
        <HeatmapGrid tick={points.length} progress={progress} running={running} />
      </div>

      {/* Investment */}
      <div className="rounded-2xl p-2.5 bg-[#111111] ring-1 ring-white/10">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">{t.invest}</div>
          <div className="text-[10px] text-zinc-500 tabular-nums">step ${INVEST_STEP}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onDec} className="w-10 h-10 rounded-xl bg-zinc-800 ring-1 ring-white/10 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 active:scale-95 transition">
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center text-lg font-semibold tabular-nums tracking-tight text-zinc-50">
            {fmt(settings.investment, settings.currency)}
          </div>
          <button onClick={onInc} className="w-10 h-10 rounded-xl bg-zinc-800 ring-1 ring-white/10 hover:bg-zinc-700 flex items-center justify-center text-zinc-200 active:scale-95 transition">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={onToggle}
        className={`w-full py-3.5 rounded-2xl text-base font-bold uppercase tracking-[0.15em] transition active:scale-[0.99] ${
          running
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
        }`}
      >
        {running ? t.stop : t.start}
      </button>
    </div>
  );
}

function HeatmapGrid({ tick, progress, running }: { tick: number; progress: number; running: boolean }) {
  // Give each ticker a persistent "personality": a target change % and a volatility.
  // Categories: strong-up, strong-down, mild-up, mild-down, flat.
  const profileRef = useRef<{ target: number; vol: number }[]>(
    HEATMAP_TICKERS.map((_, i) => {
      // Distribute roughly: 20% strong up, 20% strong down, 20% mild up, 20% mild down, 20% flat
      const bucket = (i * 7 + 3) % 5;
      if (bucket === 0) return { target: 3.2 + Math.random() * 2.3, vol: 0.55 }; // strong up (+3.2..+5.5)
      if (bucket === 1) return { target: -3.2 - Math.random() * 2.3, vol: 0.55 }; // strong down
      if (bucket === 2) return { target: 0.6 + Math.random() * 1.1, vol: 0.3 };  // mild up (+0.6..+1.7)
      if (bucket === 3) return { target: -0.6 - Math.random() * 1.1, vol: 0.3 }; // mild down
      return { target: (Math.random() - 0.5) * 0.4, vol: 0.12 };                  // flat (~0)
    })
  );
  const changesRef = useRef<number[]>(profileRef.current.map((p) => p.target * 0.3));

  useEffect(() => {
    // Each ticker random-walks toward its own target, with its own volatility.
    // Portfolio progress slightly pulls everyone in the same direction (subtle).
    const marketBias = running ? (progress - 0.5) * 0.25 : 0;
    const next = changesRef.current.map((c, i) => {
      const p = profileRef.current[i];
      const pull = (p.target - c) * 0.06; // mean-reversion toward personal target
      const noise = (Math.random() - 0.5) * p.vol;
      let v = c + pull + noise + marketBias * 0.15;
      if (v > 6) v = 6;
      if (v < -6) v = -6;
      return v;
    });
    changesRef.current = next;
  }, [tick, progress, running]);



  const colorFor = (c: number) => {
    // Map [-5, 5] -> red(#7f1d1d) ... neutral(#1f1f1f) ... green(#15803d) ... bright green(#16a34a)
    const a = Math.max(-5, Math.min(5, c)) / 5; // -1..1
    if (a >= 0) {
      // 0 -> #1f1f1f, 0.5 -> #166534, 1 -> #16a34a
      const t = a;
      const r = Math.round(31 + (22 - 31) * t);
      const g = Math.round(31 + (163 - 31) * t);
      const b = Math.round(31 + (74 - 31) * t);
      return `rgb(${r},${g},${b})`;
    } else {
      const t = -a;
      const r = Math.round(31 + (220 - 31) * t);
      const g = Math.round(31 + (38 - 31) * t);
      const b = Math.round(31 + (38 - 31) * t);
      return `rgb(${r},${g},${b})`;
    }
  };

  const spanClass = (s: number) => {
    if (s === 4) return "col-span-3 row-span-2";
    if (s === 3) return "col-span-2 row-span-2";
    if (s === 2) return "col-span-2 row-span-1";
    return "col-span-1 row-span-1";
  };
  const textSizeFor = (s: number) => (s >= 3 ? "text-base" : s === 2 ? "text-xs" : "text-[10px]");

  return (
    <div
      className="w-full h-[calc(100%-22px)] grid gap-[3px]"
      style={{ gridTemplateColumns: "repeat(6, minmax(0,1fr))", gridAutoRows: "minmax(0,1fr)" }}
    >
      {HEATMAP_TICKERS.map(([sym, sector, span], i) => {
        const c = changesRef.current[i] ?? 0;
        const bg = colorFor(c);
        const sign = c >= 0 ? "+" : "";
        return (
          <div
            key={sym}
            className={`${spanClass(span as number)} rounded-md flex flex-col items-center justify-center px-1 transition-[background-color] duration-500`}
            style={{ backgroundColor: bg }}
          >
            <div className={`${textSizeFor(span as number)} font-bold leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]`}>
              {sym}
            </div>
            <div className={`${span === 1 ? "text-[8px]" : "text-[10px]"} font-semibold leading-tight text-white/85 tabular-nums mt-0.5`}>
              {sign}{c.toFixed(2)}%
            </div>
            {span >= 3 && (
              <div className="text-[9px] uppercase tracking-wider text-white/55 mt-0.5">{sector}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================
// Generic themed view — parametrized variant of NeonView. Used by
// Ocean / Matrix / Glass themes (and reusable for future themes).
// =============================================================
type ThemeTokens = {
  shell: string;            // outer wrapper extra classes
  shellStyle?: React.CSSProperties;
  avatarBox: string;
  avatarIcon: string;
  nameText: string;
  subText: string;
  badgeActive: string;
  badgeIdle: string;
  badgeDotActive: string;
  badgeDotIdle: string;
  settingsBtn: string;
  card: string;             // surface for balance/chart/invest
  cardStyle?: React.CSSProperties;
  mutedLabel: string;
  bigValue: string;
  profitPos: string;
  profitNeg: string;
  progressTrack: string;
  progressFill: string;
  investBtn: string;
  investValue: string;
  startBtn: string;
  stopBtn: string;
  // chart palette
  chartStroke: string;
  chartFillTop: string;
  chartGrid: string;
  chartTarget: string;
};

function ThemedView({
  tokens,
  settings, balance, profit, progress, points, running, t,
  onToggle, onOpenSettings, onInc, onDec,
}: ViewProps & { tokens: ThemeTokens }) {
  const tk = tokens;
  return (
    <div className={`relative w-full max-w-[440px] h-full px-4 pt-3 pb-3 flex flex-col gap-2.5 ${tk.shell}`} style={tk.shellStyle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 shrink-0 rounded-lg overflow-hidden flex items-center justify-center ${tk.avatarBox}`}>
            {settings.avatar ? <img src={settings.avatar} alt={settings.name} className="w-full h-full object-cover" /> : <User className={`w-4 h-4 ${tk.avatarIcon}`} />}
          </div>
          <div className="min-w-0">
            <div className={`font-medium text-sm leading-tight truncate ${tk.nameText}`}>{settings.name}</div>
            <div className={`text-[11px] truncate ${tk.subText}`}>{t.account}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium ${running ? tk.badgeActive : tk.badgeIdle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${running ? tk.badgeDotActive + " animate-pulse" : tk.badgeDotIdle}`} />
            {running ? t.live : t.idle}
          </div>
          <button onClick={onOpenSettings} className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tk.settingsBtn}`}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`rounded-xl p-4 ${tk.card}`} style={tk.cardStyle}>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${tk.mutedLabel}`}>{t.account}</div>
            <div className={`text-[32px] leading-none font-semibold tabular-nums tracking-tight ${tk.bigValue}`}>
              {fmt(balance, settings.currency)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-[10px] uppercase tracking-[0.15em] mb-1 ${tk.mutedLabel}`}>{t.profit}</div>
            <div className={`text-sm font-semibold tabular-nums ${profit >= 0 ? tk.profitPos : tk.profitNeg}`}>
              {profit >= 0 ? "+" : "-"}{fmt(Math.abs(profit), settings.currency)}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className={`flex items-center justify-between text-[10px] mb-1.5 ${tk.mutedLabel}`}>
            <span>{t.goal} {fmt(settings.target, settings.currency)}</span>
            <span className="tabular-nums">{Math.floor(progress * 100)}%</span>
          </div>
          <div className={`h-1 w-full rounded-full overflow-hidden ${tk.progressTrack}`}>
            <div className={`h-full rounded-full transition-[width] duration-100 ${tk.progressFill}`} style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      <div className={`relative flex-1 min-h-0 rounded-xl overflow-hidden ${tk.card}`} style={tk.cardStyle}>
        <ThemedChart points={points} target={settings.target} initial={settings.initial}
          stroke={tk.chartStroke} fillTop={tk.chartFillTop} grid={tk.chartGrid} targetColor={tk.chartTarget} />
      </div>

      <div className={`rounded-xl p-3 ${tk.card}`} style={tk.cardStyle}>
        <div className={`text-center text-[10px] uppercase tracking-[0.15em] mb-2 ${tk.mutedLabel}`}>{t.invest}</div>
        <div className="flex items-center gap-2">
          <button onClick={onDec} className={`w-11 h-11 rounded-lg flex items-center justify-center active:scale-95 transition ${tk.investBtn}`}>
            <Minus className="w-5 h-5" />
          </button>
          <div className={`flex-1 text-center text-xl font-semibold tabular-nums tracking-tight ${tk.investValue}`}>
            {fmt(settings.investment, settings.currency)}
          </div>
          <button onClick={onInc} className={`w-11 h-11 rounded-lg flex items-center justify-center active:scale-95 transition ${tk.investBtn}`}>
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`w-full py-3.5 rounded-xl text-base font-semibold transition active:scale-[0.99] ${running ? tk.stopBtn : tk.startBtn}`}
      >
        {running ? t.stop : t.start}
      </button>
    </div>
  );
}

function ThemedChart({ points, target, initial, stroke, fillTop, grid, targetColor }: {
  points: number[]; target: number; initial: number;
  stroke: string; fillTop: string; grid: string; targetColor: string;
}) {
  const w = 400, h = 520, pad = 12;
  if (points.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-xs opacity-50">—</div>;
  }
  const minScale = Math.min(initial, target) - Math.abs(target - initial) * 0.08;
  const maxScale = Math.max(initial, target) + Math.abs(target - initial) * 0.08;
  const range = Math.max(0.5, maxScale - minScale);
  const n = points.length;
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - minScale) / range) * (h - pad * 2);
  let d = `M ${x(0).toFixed(2)} ${y(points[0]).toFixed(2)}`;
  for (let i = 1; i < n; i++) d += ` L ${x(i).toFixed(2)} ${y(points[i]).toFixed(2)}`;
  const area = `${d} L ${x(n - 1).toFixed(2)} ${h - pad} L ${x(0).toFixed(2)} ${h - pad} Z`;
  const lastX = x(n - 1), lastY = y(points[n - 1]);
  const targetY = Math.max(pad, Math.min(h - pad, y(target)));
  const gradId = `tg-${stroke.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fillTop} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fillTop} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke={grid} strokeWidth={1} />
      ))}
      <line x1={pad} x2={w - pad} y1={targetY} y2={targetY} stroke={targetColor} strokeDasharray="3 4" />
      <path d={area} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={6} fill={stroke} fillOpacity={0.25} />
      <circle cx={lastX} cy={lastY} r={3} fill={stroke} />
    </svg>
  );
}

const OCEAN_TOKENS: ThemeTokens = {
  shell: "",
  avatarBox: "bg-sky-900/60 ring-1 ring-sky-400/30",
  avatarIcon: "text-sky-300",
  nameText: "text-sky-50",
  subText: "text-sky-300/70",
  badgeActive: "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/40",
  badgeIdle: "bg-sky-900/50 text-sky-400 ring-1 ring-sky-700/50",
  badgeDotActive: "bg-cyan-300",
  badgeDotIdle: "bg-sky-600",
  settingsBtn: "bg-sky-900/50 ring-1 ring-sky-700/40 hover:bg-sky-800/60 text-sky-200",
  card: "bg-sky-950/60 ring-1 ring-sky-800/40 backdrop-blur-sm",
  mutedLabel: "text-sky-400/70",
  bigValue: "text-sky-50",
  profitPos: "text-cyan-300",
  profitNeg: "text-rose-300",
  progressTrack: "bg-sky-900/70",
  progressFill: "bg-gradient-to-r from-cyan-400 to-sky-400",
  investBtn: "bg-sky-900/60 ring-1 ring-sky-700/40 hover:bg-sky-800/60 text-sky-100",
  investValue: "text-sky-50",
  startBtn: "bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-500 hover:to-sky-600 text-sky-950 shadow-lg shadow-cyan-500/30",
  stopBtn: "bg-rose-500 hover:bg-rose-600 text-white",
  chartStroke: "#22d3ee",
  chartFillTop: "#22d3ee",
  chartGrid: "#0c4a6e",
  chartTarget: "#0ea5e9",
};

const MATRIX_TOKENS: ThemeTokens = {
  shell: "font-mono",
  avatarBox: "bg-emerald-950 ring-1 ring-emerald-500/40",
  avatarIcon: "text-emerald-400",
  nameText: "text-emerald-300",
  subText: "text-emerald-700",
  badgeActive: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/50",
  badgeIdle: "bg-black text-emerald-700 ring-1 ring-emerald-900",
  badgeDotActive: "bg-emerald-400",
  badgeDotIdle: "bg-emerald-800",
  settingsBtn: "bg-black ring-1 ring-emerald-700/50 hover:bg-emerald-950 text-emerald-400",
  card: "bg-black ring-1 ring-emerald-900/70",
  mutedLabel: "text-emerald-700",
  bigValue: "text-emerald-300",
  profitPos: "text-emerald-400",
  profitNeg: "text-red-400",
  progressTrack: "bg-emerald-950",
  progressFill: "bg-emerald-400",
  investBtn: "bg-black ring-1 ring-emerald-800 hover:bg-emerald-950 text-emerald-300",
  investValue: "text-emerald-300",
  startBtn: "bg-emerald-500 hover:bg-emerald-600 text-black uppercase tracking-[0.2em]",
  stopBtn: "bg-red-500 hover:bg-red-600 text-black uppercase tracking-[0.2em]",
  chartStroke: "#22c55e",
  chartFillTop: "#22c55e",
  chartGrid: "#052e16",
  chartTarget: "#16a34a",
};

const GLASS_TOKENS: ThemeTokens = {
  shell: "",
  avatarBox: "bg-white/40 ring-1 ring-white/60 backdrop-blur-md",
  avatarIcon: "text-slate-700",
  nameText: "text-slate-900",
  subText: "text-slate-700/70",
  badgeActive: "bg-white/50 text-emerald-700 ring-1 ring-white/70 backdrop-blur-md",
  badgeIdle: "bg-white/30 text-slate-500 ring-1 ring-white/50 backdrop-blur-md",
  badgeDotActive: "bg-emerald-500",
  badgeDotIdle: "bg-slate-400",
  settingsBtn: "bg-white/40 ring-1 ring-white/60 hover:bg-white/60 text-slate-700 backdrop-blur-md",
  card: "bg-white/30 ring-1 ring-white/50 backdrop-blur-xl shadow-lg shadow-slate-900/5",
  mutedLabel: "text-slate-600/80",
  bigValue: "text-slate-900",
  profitPos: "text-emerald-700",
  profitNeg: "text-rose-600",
  progressTrack: "bg-white/40",
  progressFill: "bg-gradient-to-r from-pink-400 via-violet-400 to-sky-400",
  investBtn: "bg-white/40 ring-1 ring-white/60 hover:bg-white/60 text-slate-800 backdrop-blur-md",
  investValue: "text-slate-900",
  startBtn: "bg-white/60 ring-1 ring-white/80 hover:bg-white/80 text-slate-900 backdrop-blur-md shadow-md",
  stopBtn: "bg-rose-400/80 hover:bg-rose-500/80 text-white backdrop-blur-md ring-1 ring-white/40",
  chartStroke: "#8b5cf6",
  chartFillTop: "#ec4899",
  chartGrid: "rgba(255,255,255,0.5)",
  chartTarget: "#64748b",
};
