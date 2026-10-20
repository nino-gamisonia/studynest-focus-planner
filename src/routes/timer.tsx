import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/timer")({
  head: () => ({
    meta: [
      { title: "Focus Timer — StudyNest" },
      { name: "description", content: "Pomodoro focus timer with 25-minute sessions and short and long breaks." },
      { property: "og:title", content: "Focus Timer — StudyNest" },
      { property: "og:description", content: "Stay focused with a Pomodoro timer." },
    ],
  }),
  component: TimerPage,
});

type Mode = "focus" | "short" | "long";
const DUR: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
const LABEL: Record<Mode, string> = { focus: "Focus", short: "Short break", long: "Long break" };

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 660; g.gain.value = 0.15;
    o.start(); o.stop(ctx.currentTime + 0.6);
  } catch { /* audio unavailable */ }
}

function TimerPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [left, setLeft] = useState(DUR.focus);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const endAt = useRef(0);

  const switchTo = (m: Mode) => { setMode(m); setLeft(DUR[m]); setRunning(false); };
  const finish = () => {
    beep();
    if (mode === "focus") {
      const n = completed + 1;
      setCompleted(n);
      switchTo(n % 4 === 0 ? "long" : "short");
    } else switchTo("focus");
  };

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const r = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(r);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => { if (running && left === 0) finish(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [left, running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  useEffect(() => { document.title = running ? `${mm}:${ss} · ${LABEL[mode]} — StudyNest` : "Focus Timer — StudyNest"; }, [mm, ss, running, mode]);

  const progress = 1 - left / DUR[mode];
  const R = 120, C = 2 * Math.PI * R;

  return (
    <>
      <PageHeader title="Focus Timer" subtitle="25 minutes of focus, then a break. Every 4th break is a long one." />
      <div className="card-soft p-6 md:p-10 max-w-xl mx-auto flex flex-col items-center">
        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-8">
          {(Object.keys(DUR) as Mode[]).map((m) => (
            <button key={m} onClick={() => switchTo(m)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition ${mode === m ? "bg-card shadow-soft text-primary" : "text-muted-foreground hover:text-primary"}`}>
              {LABEL[m]}
            </button>
          ))}
        </div>
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          <svg viewBox="0 0 260 260" className="w-full h-full -rotate-90">
            <circle cx="130" cy="130" r={R} className="fill-none stroke-sky" strokeWidth="12" />
            <circle cx="130" cy="130" r={R} className={`fill-none transition-all ${mode === "focus" ? "stroke-primary" : "stroke-sage"}`} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-display text-6xl font-semibold text-primary tabular-nums">{mm}:{ss}</div>
              <div className="text-sm text-muted-foreground mt-1">{LABEL[mode]}</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button aria-label="Reset" onClick={() => { setRunning(false); setLeft(DUR[mode]); }} className="btn bg-muted hover:bg-accent"><RotateCcw className="h-4 w-4" /></button>
          <button onClick={() => setRunning(!running)} className="btn bg-primary text-primary-foreground hover:opacity-90 px-8 py-3 text-base">
            {running ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> {left === DUR[mode] ? "Start" : "Resume"}</>}
          </button>
          <button aria-label="Skip" onClick={finish} className="btn bg-muted hover:bg-accent"><SkipForward className="h-4 w-4" /></button>
        </div>
        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Focus sessions completed:</span>
          <div className="flex gap-1.5">{Array.from({ length: 4 }, (_, i) => <span key={i} className={`h-3 w-3 rounded-full ${i < completed % 4 || (completed > 0 && completed % 4 === 0) ? "bg-primary" : "bg-sky"}`} />)}</div>
          <span className="font-semibold text-primary">{completed}</span>
        </div>
      </div>
    </>
  );
}
