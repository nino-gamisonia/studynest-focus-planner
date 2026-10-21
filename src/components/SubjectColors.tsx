import { Button } from "@/components/ui/button";
import { SUBJECT_COLORS, subjectClass, usePreferences, useTasks, useSessions } from "@/lib/store";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function SubjectColors() {
  const [preferences, update] = usePreferences();
  const [tasks] = useTasks();
  const [sessions] = useSessions();
  const [name, setName] = useState("");
  const subjects = [...new Set([...(tasks ?? []).map(t => t.subject), ...(sessions ?? []).map(s => s.subject), ...Object.keys(preferences?.subjectColors ?? {})])].sort();
  if (!preferences) return <p role="status">Loading subjects…</p>;
  return <section className="py-6 border-t">
    <h2 className="text-lg font-semibold mb-4">Subject colors</h2>
    <form className="flex gap-2 mb-5" onSubmit={e => { e.preventDefault(); const subject = name.trim(); if (!subject) return; update(p => ({ ...p, subjectColors: { ...p.subjectColors, [subject]: p.subjectColors[subject] ?? "sage" } })); setName(""); toast.success("Subject added"); }}>
      <input className="field max-w-xs" aria-label="New subject" placeholder="New subject" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
      <Button type="submit">Add subject</Button>
    </form>
    {subjects.length === 0 && <p className="text-muted-foreground text-sm">No subjects yet.</p>}
    <div className="divide-y">{subjects.map(subject => <div key={subject} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <span className="font-medium break-words max-w-full">{subject}</span>
      <div className="flex gap-2" role="group" aria-label={`${subject} color`}>{SUBJECT_COLORS.map(color => {
        const selected = subjectClass(subject, preferences) === color.className;
        return <Button key={color.id} type="button" variant="outline" size="icon" className={`${color.className} w-8 h-8 ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`} aria-label={`${subject}: ${color.name}`} aria-pressed={selected} title={color.name} onClick={() => { update(p => ({ ...p, subjectColors: { ...p.subjectColors, [subject]: color.id } })); toast.success(`${subject} color saved`); }}>{selected && <Check />}</Button>;
      })}</div>
    </div>)}</div>
  </section>;
}