import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Clock, ListTodo, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { formatDue, priorityClass, subjectTone, toISO, useSessions, useTasks } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyNest" },
      { name: "description", content: "Your StudyNest overview: upcoming deadlines, tasks, and today's study plan." },
      { property: "og:title", content: "StudyNest — Study smart. Stay on track." },
      { property: "og:description", content: "Organize assignments, deadlines, and study schedules." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [tasks, setTasks] = useTasks();
  const [sessions] = useSessions();
  const today = toISO(new Date());
  const all = tasks ?? [];
  const pending = all.filter((t) => !t.completed);
  const done = all.filter((t) => t.completed);
  const upcoming = [...pending].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const todays = (sessions ?? []).filter((s) => s.date === today).sort((a, b) => a.start.localeCompare(b.start));
  const overdue = pending.filter((t) => t.dueDate < today).length;
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Pending tasks", value: pending.length, icon: ListTodo, tone: "bg-sky" },
    { label: "Completed", value: done.length, icon: CheckCircle2, tone: "bg-accent" },
    { label: "Due this week", value: pending.filter((t) => t.dueDate >= today && t.dueDate <= toISO(new Date(Date.now() + 6 * 864e5))).length, icon: CalendarClock, tone: "bg-medium-soft" },
    { label: "Sessions today", value: todays.length, icon: Clock, tone: "bg-low-soft" },
  ];

  return (
    <>
      <PageHeader title={`${greet} 👋`} subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card-soft p-5">
            <div className={`h-9 w-9 rounded-lg grid place-items-center ${tone} text-primary mb-3`}><Icon className="h-4 w-4" /></div>
            <div className="text-3xl font-semibold text-primary">{tasks ? value : "–"}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <section className="card-soft p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Upcoming deadlines</h2>
            <Link to="/tasks" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">All tasks <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          {overdue > 0 && <p className="text-sm text-high bg-high-soft rounded-lg px-3 py-2 mb-3">{overdue} task{overdue > 1 ? "s are" : " is"} overdue.</p>}
          {!tasks ? null : upcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">Nothing pending — enjoy the calm.</p>
          ) : (
            <ul className="divide-y">
              {upcoming.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <input type="checkbox" aria-label={`Complete ${t.title}`} className="h-4 w-4 accent-primary"
                    onChange={() => setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, completed: true } : x)))} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.subject}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityClass[t.priority]}`}>{t.priority}</span>
                  <span className={`text-xs w-16 text-right ${t.dueDate < today ? "text-high font-semibold" : "text-muted-foreground"}`}>{formatDue(t.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="card-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Today's study plan</h2>
              <Link to="/planner" className="text-sm text-muted-foreground hover:text-primary">Planner</Link>
            </div>
            {!sessions ? null : todays.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions planned today. <Link to="/planner" className="text-primary underline">Add one</Link></p>
            ) : (
              <ul className="space-y-2.5">
                {todays.map((s) => (
                  <li key={s.id} className={`rounded-xl p-3 ${subjectTone(s.subject)}`}>
                    <div className="text-xs font-semibold opacity-70">{s.start} – {s.end}</div>
                    <div className="font-medium">{s.subject}</div>
                    {s.notes && <div className="text-xs opacity-75">{s.notes}</div>}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card-soft p-6 bg-primary text-primary-foreground">
            <div className="text-sm opacity-80">Overall progress</div>
            <div className="text-4xl font-display font-semibold my-1">{pct}%</div>
            <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden"><div className="h-full bg-sage transition-all" style={{ width: `${pct}%` }} /></div>
            <Link to="/timer" className="btn mt-5 bg-sage text-primary hover:opacity-90 w-full">Start a focus session</Link>
          </section>
        </div>
      </div>
    </>
  );
}
