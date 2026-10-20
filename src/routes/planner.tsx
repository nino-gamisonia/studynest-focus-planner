import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { addDays, subjectTone, toISO, uid, useSessions, useTasks } from "@/lib/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — StudyNest" },
      { name: "description", content: "Plan your week of study sessions by subject and date." },
      { property: "og:title", content: "Study Planner — StudyNest" },
      { property: "og:description", content: "A weekly study schedule for university students." },
    ],
  }),
  component: Planner,
});

function startOfWeek(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - ((c.getDay() + 6) % 7));
  return c;
}

function Planner() {
  const [sessions, setSessions] = useSessions();
  const [tasks] = useTasks();
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState<null | { id?: string; subject: string; date: string; start: string; end: string; notes: string }>(null);
  const week = startOfWeek(addDays(new Date(), offset * 7));
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const today = toISO(new Date());
  const subjects = [...new Set([...(tasks ?? []).map((t) => t.subject), ...(sessions ?? []).map((s) => s.subject)])].sort();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.subject.trim() || form.end <= form.start) return;
    const s = { id: form.id ?? uid(), subject: form.subject.trim(), date: form.date, start: form.start, end: form.end, notes: form.notes.trim() || undefined };
    setSessions((p) => (form.id ? p.map((x) => (x.id === form.id ? s : x)) : [...p, s]));
    setForm(null);
  };

  const label = `${week.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(week, 6).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  const weekTotal = (sessions ?? []).filter((s) => s.date >= toISO(week) && s.date <= toISO(addDays(week, 6)))
    .reduce((m, s) => { const [a, b] = [s.start, s.end].map((t) => +t.slice(0, 2) * 60 + +t.slice(3)); return m + (b - a); }, 0);

  return (
    <>
      <PageHeader title="Study Planner" subtitle={`${(weekTotal / 60).toFixed(1)} hours planned this week`}
        action={<button onClick={() => setForm({ subject: "", date: today, start: "10:00", end: "11:00", notes: "" })} className="btn bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> Add session</button>} />

      {form && (
        <form onSubmit={save} className="card-soft p-5 mb-6 grid gap-3 md:grid-cols-12 items-end">
          <div className="md:col-span-12 flex justify-between items-center">
            <h2 className="font-semibold">{form.id ? "Edit session" : "New study session"}</h2>
            <button type="button" aria-label="Close" onClick={() => setForm(null)} className="text-muted-foreground hover:text-primary"><X className="h-4 w-4" /></button>
          </div>
          <label className="md:col-span-3 text-sm">Subject<input required list="psubjects" className="field mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
          <datalist id="psubjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
          <label className="md:col-span-2 text-sm">Date<input required type="date" className="field mt-1" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
          <label className="md:col-span-2 text-sm">Start<input required type="time" className="field mt-1" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></label>
          <label className="md:col-span-2 text-sm">End<input required type="time" className="field mt-1" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></label>
          <label className="md:col-span-2 text-sm">Notes<input className="field mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" /></label>
          <button className="btn md:col-span-1 bg-primary text-primary-foreground">Save</button>
          {form.end <= form.start && <p className="md:col-span-12 text-xs text-high">End time must be after start time.</p>}
        </form>
      )}

      <div className="flex items-center justify-between mb-4">
        <button aria-label="Previous week" onClick={() => setOffset(offset - 1)} className="btn bg-card border hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
        <div className="text-center">
          <div className="font-semibold">{label}</div>
          {offset !== 0 && <button onClick={() => setOffset(0)} className="text-xs text-muted-foreground underline">Back to this week</button>}
        </div>
        <button aria-label="Next week" onClick={() => setOffset(offset + 1)} className="btn bg-card border hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {days.map((d) => {
          const iso = toISO(d);
          const list = (sessions ?? []).filter((s) => s.date === iso).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <div key={iso} className={`card-soft p-3 min-h-40 flex flex-col ${iso === today ? "ring-2 ring-sage" : ""}`}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className={`text-lg font-semibold ${iso === today ? "text-primary" : ""}`}>{d.getDate()}</span>
              </div>
              <div className="space-y-2 flex-1">
                {list.map((s) => (
                  <div key={s.id} className={`group rounded-lg p-2 text-xs ${subjectTone(s.subject)}`}>
                    <button onClick={() => setForm({ ...s, notes: s.notes ?? "" })} className="text-left w-full">
                      <div className="font-semibold opacity-70">{s.start}–{s.end}</div>
                      <div className="font-medium text-sm leading-tight break-words">{s.subject}</div>
                      {s.notes && <div className="opacity-75 mt-0.5">{s.notes}</div>}
                    </button>
                    <button aria-label="Delete session" onClick={() => setSessions((p) => p.filter((x) => x.id !== s.id))} className="mt-1 opacity-60 hover:opacity-100 hover:text-high inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
                  </div>
                ))}
              </div>
              <button onClick={() => setForm({ subject: "", date: iso, start: "10:00", end: "11:00", notes: "" })} className="mt-2 text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
