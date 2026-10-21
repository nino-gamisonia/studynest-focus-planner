import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addDays, subjectClass, toISO, uid, useSessions, useTasks, usePreferences, startOfWeek, timeMinutes, sessionConflicts, sessionLayout, type CalendarView, type Session } from "@/lib/store";

export const Route = createFileRoute("/planner")({ head: () => ({ meta: [
  { title: "Study Planner — StudyNest" }, { name: "description", content: "Organize study sessions in a personalized day or week calendar with overlap warnings." },
  { property: "og:title", content: "Study Planner — StudyNest" }, { property: "og:description", content: "Plan your study time by subject, date and duration." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Planner });

type Draft = { id?: string; subject: string; date: string; start: string; end: string; notes: string };
function Planner() {
  const [sessions, setSessions] = useSessions();
  const [tasks] = useTasks();
  const [preferences] = usePreferences();
  const [selected, setSelected] = useState(() => toISO(new Date()));
  const [view, setView] = useState<CalendarView | null>(null);
  const [form, setForm] = useState<Draft | null>(null);
  const [warning, setWarning] = useState(false);
  useEffect(() => { if (preferences && view === null) setView(preferences.calendarView); }, [preferences, view]);
  const mode = view ?? preferences?.calendarView ?? "week";
  const date = new Date(selected + "T00:00:00"), week = startOfWeek(date);
  const days = mode === "day" ? [date] : Array.from({ length: 7 }, (_,i) => addDays(week,i));
  const today = toISO(new Date());
  const visible = (sessions ?? []).filter(s => days.some(d => toISO(d) === s.date));
  const total = visible.reduce((n,s) => n + timeMinutes(s.end) - timeMinutes(s.start),0);
  const startHour = Math.min(7,...visible.map(s => Math.floor(timeMinutes(s.start)/60)));
  const endHour = Math.max(22,...visible.map(s => Math.ceil(timeMinutes(s.end)/60)));
  const hours = Array.from({ length: endHour - startHour }, (_,i) => startHour+i);
  const subjects = [...new Set([...(tasks ?? []).map(t => t.subject), ...(sessions ?? []).map(s => s.subject), ...Object.keys(preferences?.subjectColors ?? {})])].sort();
  const conflicts = form ? sessionConflicts(form, sessions ?? []) : [];
  const open = (day: string, hour = 10) => { setWarning(false); setForm({ subject: "", date: day, start: `${String(hour).padStart(2,"0")}:00`, end: hour === 23 ? "23:59" : `${String(hour+1).padStart(2,"0")}:00`, notes: "" }); };
  const edit = (session: Session) => { setWarning(false); setForm({ ...session, notes: session.notes ?? "" }); };
  const save = (allowOverlap = false) => {
    if (!form || !form.subject.trim() || !form.date || form.end <= form.start) return;
    if (conflicts.length > 0 && !allowOverlap) { setWarning(true); return; }
    const session = { ...form, id: form.id ?? uid(), subject: form.subject.trim(), notes: form.notes.trim() || undefined };
    setSessions(p => form.id ? p.map(s => s.id === form.id ? session : s) : [...p,session]);
    setSelected(form.date); setForm(null); setWarning(false); toast.success(form.id ? "Session updated" : "Session created");
  };
  const label = mode === "day" ? date.toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric",year:"numeric"}) : `${week.toLocaleDateString(undefined,{month:"short",day:"numeric"})} – ${addDays(week,6).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}`;
  return <>
    <PageHeader title="Study Planner" subtitle={`${(total/60).toFixed(1)} hours planned this ${mode}`} action={<Button onClick={() => open(selected)}><Plus />Add session</Button>} />
    {form && <form onSubmit={e => { e.preventDefault(); save(); }} className="border-y py-5 mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
      <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between"><h2 className="font-semibold">{form.id ? "Edit session" : "New study session"}</h2><Button type="button" variant="ghost" size="icon" title="Close" aria-label="Close session form" onClick={() => setForm(null)}><X /></Button></div>
      <label className="text-sm">Subject<input required list="planner-subjects" className="field mt-1" value={form.subject} maxLength={80} onChange={e => { setWarning(false); setForm({ ...form, subject:e.target.value }); }} /></label>
      <datalist id="planner-subjects">{subjects.map(s => <option key={s} value={s} />)}</datalist>
      <label className="text-sm">Date<input type="date" required className="field mt-1" value={form.date} onChange={e => { setWarning(false); setForm({ ...form, date:e.target.value }); }} /></label>
      <label className="text-sm">Start<input type="time" required className="field mt-1" value={form.start} onChange={e => { setWarning(false); setForm({ ...form, start:e.target.value }); }} /></label>
      <label className="text-sm">End<input type="time" required className="field mt-1" value={form.end} onChange={e => { setWarning(false); setForm({ ...form, end:e.target.value }); }} /></label>
      <label className="text-sm sm:col-span-2 lg:col-span-3">Notes<input className="field mt-1" value={form.notes} maxLength={500} onChange={e => setForm({ ...form, notes:e.target.value })} placeholder="Optional" /></label>
      <Button type="submit">Save session</Button>
      {form.end <= form.start && <p role="alert" className="sm:col-span-2 lg:col-span-4 text-sm text-high">End time must be after start time.</p>}
      {warning && conflicts.length > 0 && <div role="alert" className="sm:col-span-2 lg:col-span-4 bg-high-soft text-high p-4 rounded-lg"><h3 className="font-semibold flex gap-2 items-center"><AlertTriangle className="h-4 w-4" />Overlapping sessions</h3><ul className="mt-2 text-sm">{conflicts.map(s => <li key={s.id}>{s.subject} · {s.start}–{s.end}</li>)}</ul><div className="flex flex-wrap gap-2 mt-3"><Button type="button" variant="outline" onClick={() => setWarning(false)}>Return to editing</Button><Button type="button" onClick={() => save(true)}>Save anyway</Button></div></div>}
      {form.id && <Button type="button" variant="ghost" className="text-high justify-self-start" onClick={() => { if (!confirm("Delete this study session?")) return; setSessions(p => p.filter(s => s.id !== form.id)); setForm(null); toast.success("Session deleted"); }}><Trash2 />Delete session</Button>}
    </form>}
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="inline-flex items-center gap-2"><Button variant="outline" size="icon" title={`Previous ${mode}`} aria-label={`Previous ${mode}`} onClick={() => setSelected(toISO(addDays(date, mode === "day" ? -1 : -7)))}><ChevronLeft /></Button><Button variant="outline" size="icon" title={`Next ${mode}`} aria-label={`Next ${mode}`} onClick={() => setSelected(toISO(addDays(date, mode === "day" ? 1 : 7)))}><ChevronRight /></Button><Button variant="ghost" onClick={() => setSelected(today)}>Today</Button></div>
      <h2 className="font-semibold text-sm">{label}</h2>
      <div className="flex rounded-lg bg-muted p-1" role="group" aria-label="Calendar view">{(["day","week"] as const).map(v => <Button key={v} variant={mode === v ? "default" : "ghost"} size="sm" aria-pressed={mode === v} onClick={() => setView(v)}>{v === "day" ? "Day View" : "Week View"}</Button>)}</div>
    </div>
    <label className="text-sm flex flex-wrap items-center gap-3 mb-4">Selected day<input aria-label="Selected day" type="date" className="field max-w-44" value={selected} onChange={e => { if (e.target.value) setSelected(e.target.value); }} /></label>
    {!sessions && <p role="status">Loading study sessions…</p>}
    {sessions && visible.length === 0 && <p className="text-sm text-muted-foreground mb-4">No sessions planned this {mode}. <Button variant="link" className="p-0 h-auto" onClick={() => open(selected)}>Add a session</Button></p>}
    <div className="overflow-x-auto border rounded-lg bg-card max-h-[720px]">
      <div style={{ minWidth: mode === "week" ? 770 : 280 }}>
        <div className="grid sticky top-0 z-10 bg-card border-b" style={{ gridTemplateColumns:`56px repeat(${days.length}, minmax(0,1fr))` }}>
          <div className="text-xs text-muted-foreground p-2 self-center">Time</div>{days.map(d => <Button variant="ghost" key={toISO(d)} className={`h-16 rounded-none border-l flex flex-col gap-0 ${toISO(d) === today ? "bg-accent" : ""}`} onClick={() => { setSelected(toISO(d)); setView("day"); }}><span className="text-xs">{d.toLocaleDateString(undefined,{weekday:"short"})}</span><span className="text-lg">{d.getDate()}</span></Button>)}
        </div>
        <div className="grid" style={{ gridTemplateColumns:`56px repeat(${days.length}, minmax(0,1fr))` }}>
          <div>{hours.map(h => <div key={h} className="calendar-hour text-[11px] text-muted-foreground text-center pt-1">{String(h).padStart(2,"0")}:00</div>)}</div>
          {days.map(d => { const iso = toISO(d); const list = visible.filter(s => s.date === iso).sort((a,b) => a.start.localeCompare(b.start)); return <div key={iso} className={`relative border-l ${iso === today ? "bg-accent/10" : ""}`}>
            {hours.map(h => <Button key={h} variant="ghost" aria-label={`Add session ${iso} ${h}:00`} className="calendar-hour w-full block rounded-none p-0 hover:bg-accent/30" onClick={() => open(iso,h)} />)}
            {list.map(s => { const { lane, lanes } = sessionLayout(list)[s.id] ?? { lane: 0, lanes: 1 }; return <Button key={s.id} variant="ghost" title={`${s.subject} ${s.start}–${s.end}${s.notes ? ` · ${s.notes}` : ""}`} aria-label={`Edit ${s.subject} ${s.start}–${s.end}`} className={`calendar-block block whitespace-normal ${subjectClass(s.subject,preferences)}`} style={{ top:(timeMinutes(s.start)-startHour*60)/60*64, height:Math.max(24,(timeMinutes(s.end)-timeMinutes(s.start))/60*64-2), left:`calc(${lane/lanes*100}% + 2px)`, width:`calc(${100/lanes}% - 4px)` }} onClick={() => edit(s)}><div className="text-[10px] font-semibold leading-3">{s.start}–{s.end}</div><div className="font-semibold break-words leading-4 mt-1">{s.subject}</div>{s.notes && mode === "day" && <div className="text-xs font-normal break-words mt-1">{s.notes}</div>}</Button>; })}
          </div>; })}
        </div>
      </div>
    </div>
  </>;
}
