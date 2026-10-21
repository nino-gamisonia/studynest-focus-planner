import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type Priority = "High" | "Medium" | "Low";
export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
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
      let raw: string | null;
      try { raw = localStorage.getItem(key); } catch { setValue(seed()); toast.error("Browser storage is unavailable. Changes cannot be saved."); return; }
      if (raw) {
        try { setValue(JSON.parse(raw)); return; } catch { /* reseed */ }
      }
      const s = seed();
      try { localStorage.setItem(key, JSON.stringify(s)); } catch { toast.error("Your browser could not save this data."); }
      setValue(s);
    };
    load();
    const onEvt = (e: Event) => { if ((e as CustomEvent).detail === key) load(); };
    const onStorage = (e: StorageEvent) => { if (e.key === key || e.key === null) load(); };
    window.addEventListener(EVT, onEvt);
    window.addEventListener("storage", onStorage);
    return () => { window.removeEventListener(EVT, onEvt); window.removeEventListener("storage", onStorage); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback((fn: (prev: T) => T) => {
    try {
      const raw = localStorage.getItem(key);
      const prev = raw ? (JSON.parse(raw) as T) : seed();
      localStorage.setItem(key, JSON.stringify(fn(prev)));
      window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
    } catch { toast.error("Changes could not be saved. Check browser storage and try again."); throw new Error("Storage unavailable"); }
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

export type CalendarView = "day" | "week";
export interface Preferences {
  displayName: string;
  introduction: string;
  weeklyTaskGoal: number;
  weeklyStudyGoal: number;
  calendarView: CalendarView;
  focusMinutes: number;
  timerSound: boolean;
  deadlineWarnings: boolean;
  subjectColors: Record<string, string>;
}
export const defaultPreferences = (): Preferences => ({ displayName: "Student", introduction: "", weeklyTaskGoal: 5, weeklyStudyGoal: 10, calendarView: "week", focusMinutes: 25, timerSound: true, deadlineWarnings: true, subjectColors: {} });
export function usePreferences() {
  const [stored, update] = useStored<Preferences>("studynest.preferences", defaultPreferences);
  return [stored ? { ...defaultPreferences(), ...stored } : null, update] as const;
}
export const SUBJECT_COLORS = [
  { id: "sage", name: "Sage", className: "subject-sage" },
  { id: "blue", name: "Blue", className: "subject-blue" },
  { id: "gold", name: "Gold", className: "subject-gold" },
  { id: "rose", name: "Rose", className: "subject-rose" },
  { id: "teal", name: "Teal", className: "subject-teal" },
  { id: "lavender", name: "Lavender", className: "subject-lavender" },
];
export function subjectClass(subject: string, preferences: Preferences | null) {
  let hash = 0;
  for (const c of subject) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return (SUBJECT_COLORS.find(c => c.id === preferences?.subjectColors[subject]) ?? SUBJECT_COLORS[hash % SUBJECT_COLORS.length])?.className ?? "subject-sage";
}
export function startOfWeek(d: Date) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); c.setDate(c.getDate() - ((c.getDay() + 6) % 7)); return c;
}
export function toggleTask(task: Task, now = Date.now()): Task {
  return { ...task, completed: !task.completed, completedAt: task.completed ? undefined : now };
}
export function dashboardData(tasks: Task[], date = new Date()) {
  const today = toISO(date), start = toISO(startOfWeek(date)), end = toISO(addDays(startOfWeek(date), 6));
  const pending = tasks.filter(t => !t.completed);
  const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  const priorities = [...pending].sort((a,b) => rank[a.priority] - rank[b.priority] || a.dueDate.localeCompare(b.dueDate)).slice(0,3);
  const overdue = pending.filter(t => t.dueDate < today).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = pending.filter(t => t.dueDate >= today && t.dueDate <= toISO(addDays(date, 7))).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  const completedThisWeek = tasks.filter(t => t.completed && t.completedAt !== undefined && toISO(new Date(t.completedAt)) >= start && toISO(new Date(t.completedAt)) <= end);
  const weeklyTasks = tasks.filter(t => (t.dueDate >= start && t.dueDate <= end) || completedThisWeek.some(c => c.id === t.id));
  return { priorities, overdue, upcoming, completedThisWeek: completedThisWeek.length, weeklyTotal: weeklyTasks.length, weeklyPercent: weeklyTasks.length ? Math.round(completedThisWeek.length / weeklyTasks.length * 100) : 0 };
}
export const timeMinutes = (time: string) => Number(time.slice(0,2)) * 60 + Number(time.slice(3,5));
export function sessionConflicts(candidate: Pick<Session, "date" | "start" | "end"> & { id?: string }, sessions: Session[]) {
  return sessions.filter(s => s.id !== candidate.id && s.date === candidate.date && timeMinutes(candidate.start) < timeMinutes(s.end) && timeMinutes(candidate.end) > timeMinutes(s.start));
}
export function resetStudyNest() {
  for (const key of ["studynest.tasks", "studynest.sessions"]) localStorage.setItem(key, "[]");
  localStorage.setItem("studynest.preferences", JSON.stringify(defaultPreferences()));
  for (const key of ["studynest.tasks", "studynest.sessions", "studynest.preferences"]) window.dispatchEvent(new CustomEvent(EVT, { detail: key }));
}
