import { useCallback, useEffect, useState } from "react";

export type Priority = "High" | "Medium" | "Low";
export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  completed: boolean;
  createdAt: number;
}
export interface Session {
  id: string;
  subject: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string;
  notes?: string | undefined;
}

export const toISO = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
export const uid = () => Math.random().toString(36).slice(2, 10);

function seedTasks(): Task[] {
  const t = new Date();
  const mk = (title: string, subject: string, off: number, priority: Priority, completed = false): Task => ({
    id: uid(), title, subject, dueDate: toISO(addDays(t, off)), priority, completed, createdAt: Date.now() - off,
  });
  return [
    mk("Finish lab report on enzyme kinetics", "Biology", 1, "High"),
    mk("Problem set 6: integrals", "Calculus II", 2, "High"),
    mk("Read chapters 4–5 of The Republic", "Philosophy", 4, "Medium"),
    mk("Draft essay outline", "English Literature", 6, "Medium"),
    mk("Review lecture slides week 7", "Microeconomics", 3, "Low"),
    mk("Submit group project proposal", "Computer Science", 0, "High"),
    mk("Flashcards for vocab quiz", "Spanish", -1, "Low", true),
    mk("Email TA about office hours", "Calculus II", -2, "Low", true),
  ];
}
function seedSessions(): Session[] {
  const t = new Date();
  const mk = (subject: string, off: number, start: string, end: string, notes?: string): Session => ({
    id: uid(), subject, date: toISO(addDays(t, off)), start, end, notes,
  });
  return [
    mk("Biology", 0, "09:00", "10:30", "Lab report analysis section"),
    mk("Calculus II", 0, "14:00", "15:30", "Practice integration by parts"),
    mk("Philosophy", 0, "19:00", "20:00"),
    mk("Computer Science", 1, "10:00", "12:00", "Project proposal"),
    mk("Microeconomics", 2, "16:00", "17:00"),
    mk("English Literature", 3, "11:00", "12:30", "Essay outline"),
  ];
}

const EVT = "studynest-store";

function useStored<T>(key: string, seed: () => T) {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try { setValue(JSON.parse(raw)); return; } catch { /* reseed */ }
      }
      const s = seed();
      localStorage.setItem(key, JSON.stringify(s));
      setValue(s);
    };
    load();
    const onEvt = (e: Event) => { if ((e as CustomEvent).detail === key) load(); };
    window.addEventListener(EVT, onEvt);
    return () => window.removeEventListener(EVT, onEvt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback((fn: (prev: T) => T) => {
    const raw = localStorage.getItem(key);
    const prev = raw ? (JSON.parse(raw) as T) : seed();
    localStorage.setItem(key, JSON.stringify(fn(prev)));
    window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [value, update] as const;
}

export const useTasks = () => useStored<Task[]>("studynest.tasks", seedTasks);
export const useSessions = () => useStored<Session[]>("studynest.sessions", seedSessions);

const SUBJECT_TONES = ["bg-accent", "bg-sky", "bg-medium-soft", "bg-high-soft", "bg-low-soft", "bg-muted"];
export function subjectTone(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SUBJECT_TONES[h % SUBJECT_TONES.length];
}
export const priorityClass: Record<Priority, string> = {
  High: "bg-high-soft text-high",
  Medium: "bg-medium-soft text-medium",
  Low: "bg-low-soft text-low",
};
export const formatDue = (iso: string) => {
  const today = toISO(new Date());
  const tomorrow = toISO(addDays(new Date(), 1));
  if (iso === today) return "Today";
  if (iso === tomorrow) return "Tomorrow";
  return new Date(iso + "T00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
