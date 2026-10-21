import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Clock, ListTodo, ArrowRight, Target, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { TaskList } from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import { dashboardData, subjectClass, toISO, usePreferences, useSessions, useTasks, timeMinutes, startOfWeek, addDays } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — StudyNest" },
    { name: "description", content: "Your StudyNest overview: priorities, weekly progress, upcoming deadlines and today's study plan." },
    { property: "og:title", content: "Dashboard — StudyNest" },
    { property: "og:description", content: "Stay on track with assignments and study goals." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Dashboard,
});

function Dashboard() {
  const [tasks] = useTasks();
  const [sessions] = useSessions();
  const [preferences] = usePreferences();
  const today = toISO(new Date()), all = tasks ?? [];
  const data = dashboardData(all);
  const todays = (sessions ?? []).filter(s => s.date === today).sort((a,b) => a.start.localeCompare(b.start));
  const week = startOfWeek(new Date());
  const studyHours = (sessions ?? []).filter(s => s.date >= toISO(week) && s.date <= toISO(addDays(week,6))).reduce((n,s) => n + (timeMinutes(s.end) - timeMinutes(s.start))/60,0);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const stats = [
    { label: "Pending tasks", value: all.filter(t => !t.completed).length, icon: ListTodo, tone: "bg-sky" },
    { label: "Completed", value: all.filter(t => t.completed).length, icon: CheckCircle2, tone: "bg-accent" },
    { label: "Due this week", value: all.filter(t => !t.completed && t.dueDate >= toISO(week) && t.dueDate <= toISO(addDays(week,6))).length, icon: CalendarClock, tone: "bg-medium-soft" },
    { label: "Sessions today", value: todays.length, icon: Clock, tone: "bg-low-soft" },
  ];
  if (!tasks || !sessions || !preferences) return <p role="status" className="text-muted-foreground">Loading your study overview…</p>;
  return <>
    <PageHeader title={`${greet}, ${preferences.displayName} 👋`} subtitle={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-7">{stats.map(({label,value,icon:Icon,tone}) => <div key={label} className="card-soft p-4 sm:p-5">
      <div className={`h-9 w-9 rounded-lg grid place-items-center ${tone} text-primary mb-3`}><Icon className="h-4 w-4" /></div>
      <div className="text-3xl font-semibold text-primary">{value}</div><div className="text-sm text-muted-foreground">{label}</div>
    </div>)}</div>
    <div className="grid xl:grid-cols-5 gap-8">
      <div className="xl:col-span-3 min-w-0">
        <section className="pb-6"><div className="flex items-center justify-between gap-3 mb-2"><h2 className="font-semibold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Today's Priorities</h2><Link to="/tasks" className="text-sm text-muted-foreground inline-flex items-center gap-1">All tasks <ArrowRight className="w-4 h-4" /></Link></div>
          <TaskList tasks={data.priorities} empty="You're all caught up. No incomplete tasks." />
        </section>
        <section className="border-t py-6"><h2 className="font-semibold text-lg mb-2">Upcoming Deadlines</h2><p className="text-xs text-muted-foreground mb-2">Next 7 days</p><TaskList tasks={data.upcoming} empty="No deadlines in the next seven days." /></section>
        <section className="border-t py-6"><h2 className="font-semibold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-high" />Overdue Tasks</h2>
          {preferences.deadlineWarnings && data.overdue.length > 0 && <p className="text-sm text-high bg-high-soft rounded-md px-3 py-2 mb-2">{data.overdue.length} missed deadline{data.overdue.length === 1 ? "" : "s"}</p>}
          <TaskList tasks={data.overdue} empty="No overdue tasks. You're on track." />
        </section>
      </div>
      <div className="xl:col-span-2 min-w-0">
        <section className="pb-6"><div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-lg">Today's study plan</h2><Link to="/planner" className="text-sm text-primary">Planner</Link></div>
          {todays.length === 0 ? <p className="text-sm text-muted-foreground">No sessions today. <Link to="/planner" className="underline text-primary">Plan a session</Link></p> : <ul className="space-y-3">{todays.map(s => <li key={s.id} className={`rounded-lg p-3 ${subjectClass(s.subject, preferences)}`}><div className="text-xs font-semibold">{s.start} – {s.end}</div><div className="font-medium break-words">{s.subject}</div>{s.notes && <div className="text-xs mt-1 break-words">{s.notes}</div>}</li>)}</ul>}
        </section>
        <section className="py-6 border-t"><h2 className="font-semibold text-lg">Weekly Progress</h2><div className="text-4xl font-display text-primary my-3">{data.weeklyPercent}%</div>
          <progress className="w-full h-2 accent-primary" aria-label="Weekly task progress" value={data.weeklyPercent} max={100} />
          <p className="text-sm text-muted-foreground mt-2">{data.completedThisWeek} completed · {data.weeklyTotal} tasks this week</p>
          <p className="text-xs text-muted-foreground mt-2">Tasks due this week or completed this week. Earlier completions without a date count toward lifetime totals only.</p>
        </section>
        <section className="border-t py-6"><h2 className="font-semibold text-lg mb-4">Your weekly goals</h2><div className="flex justify-between text-sm mb-2"><span>Tasks completed</span><span>{data.completedThisWeek} / {preferences.weeklyTaskGoal}</span></div><progress className="w-full h-2 accent-primary" aria-label="Task goal" value={Math.min(data.completedThisWeek, preferences.weeklyTaskGoal)} max={preferences.weeklyTaskGoal} />
          <div className="flex justify-between text-sm mt-4 mb-2"><span>Study hours planned</span><span>{studyHours.toFixed(1)} / {preferences.weeklyStudyGoal}</span></div><progress className="w-full h-2 accent-primary" aria-label="Study hours goal" value={Math.min(studyHours, preferences.weeklyStudyGoal)} max={preferences.weeklyStudyGoal} />
          <Button asChild className="w-full mt-6"><Link to="/timer">Start a focus session</Link></Button>
        </section>
      </div>
    </div>
  </>;
}
