import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { formatDue, priorityClass, toISO, uid, useTasks, usePreferences, subjectClass, toggleTask, type Priority, type Task } from "@/lib/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — StudyNest" },
      { name: "description", content: "Add, edit, filter and complete your assignments by subject, due date and priority." },
      { property: "og:title", content: "My Tasks — StudyNest" },
      { property: "og:description", content: "Manage assignments and deadlines in StudyNest." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

type Draft = { title: string; subject: string; dueDate: string; priority: Priority };
const PR: Priority[] = ["High", "Medium", "Low"];
const prRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

function TasksPage() {
  const [tasks, setTasks] = useTasks();
  const [preferences] = usePreferences();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>({ title: "", subject: "", dueDate: "", priority: "Medium" });
  const [status, setStatus] = useState<"all" | "pending" | "completed">("all");
  const [prio, setPrio] = useState<"all" | Priority>("all");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState<"due" | "priority" | "title" | "created">("due");
  const [q, setQ] = useState("");

  const subjects = useMemo(() => [...new Set((tasks ?? []).map((t) => t.subject))].sort(), [tasks]);
  const list = useMemo(() => {
    let l = (tasks ?? []).filter((t) =>
      (status === "all" || (status === "completed") === t.completed) &&
      (prio === "all" || t.priority === prio) &&
      (subject === "all" || t.subject === subject) &&
      (t.title + t.subject).toLowerCase().includes(q.toLowerCase()));
    l = [...l].sort((a, b) =>
      sort === "due" ? a.dueDate.localeCompare(b.dueDate)
      : sort === "priority" ? prRank[a.priority] - prRank[b.priority] || a.dueDate.localeCompare(b.dueDate)
      : sort === "title" ? a.title.localeCompare(b.title)
      : b.createdAt - a.createdAt);
    return l;
  }, [tasks, status, prio, subject, sort, q]);

  const openNew = () => { setDraft({ title: "", subject: "", dueDate: toISO(new Date()), priority: "Medium" }); setEditing("new"); };
  const openEdit = (t: Task) => { setDraft({ title: t.title, subject: t.subject, dueDate: t.dueDate, priority: t.priority }); setEditing(t.id); };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const d = { ...draft, title: draft.title.trim(), subject: draft.subject.trim() };
    if (!d.title || !d.subject || !d.dueDate) return;
    if (editing === "new") setTasks((p) => [...p, { ...d, id: uid(), completed: false, createdAt: Date.now() }]);
    else setTasks((p) => p.map((t) => (t.id === editing ? { ...t, ...d } : t)));
    toast.success(editing === "new" ? "Task created" : "Task updated");
    setEditing(null);
  };
  const today = toISO(new Date());

  return (
    <>
      <PageHeader title="My Tasks" subtitle={tasks ? `${tasks.filter((t) => !t.completed).length} pending · ${tasks.filter((t) => t.completed).length} completed` : ""}
        action={<Button onClick={openNew} className="btn bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-4 w-4" /> New task</Button>} />

      {editing && (
        <form onSubmit={save} className="card-soft p-5 mb-6 grid gap-3 md:grid-cols-12 items-end">
          <div className="md:col-span-12 flex justify-between items-center">
            <h2 className="font-semibold">{editing === "new" ? "Add a task" : "Edit task"}</h2>
            <Button type="button" variant="ghost" size="icon" title="Close task form" aria-label="Close" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-primary"><X className="h-4 w-4" /></Button>
          </div>
          <label className="md:col-span-4 text-sm">Title<input required maxLength={200} autoFocus className="field mt-1" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Chapter 3 summary" /></label>
          <label className="md:col-span-3 text-sm">Subject<input required maxLength={80} list="subjects" className="field mt-1" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="e.g. History" /></label>
          <datalist id="subjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
          <label className="md:col-span-2 text-sm">Due date<input required type="date" className="field mt-1" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /></label>
          <label className="md:col-span-2 text-sm">Priority
            <select className="field mt-1" value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}>{PR.map((p) => <option key={p}>{p}</option>)}</select>
          </label>
          <Button className="btn md:col-span-1 bg-primary text-primary-foreground">Save</Button>
        </form>
      )}

      <div className="border-y py-4 mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <input className="field col-span-2 md:col-span-1" aria-label="Search tasks" placeholder="Search tasks or subjects…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status">
          <option value="all">All statuses</option><option value="pending">Pending</option><option value="completed">Completed</option>
        </select>
        <select className="field" value={prio} onChange={(e) => setPrio(e.target.value as typeof prio)} aria-label="Priority">
          <option value="all">All priorities</option>{PR.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
          <option value="all">All subjects</option>{subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
          <option value="due">Sort: Due date</option><option value="priority">Sort: Priority</option><option value="title">Sort: Title</option><option value="created">Sort: Newest</option>
        </select>
      </div>

      {!tasks && <p role="status">Loading tasks…</p>}
      <ul className="space-y-2.5">
        {tasks && list.length === 0 && <li className="card-soft p-8 text-center text-muted-foreground">No tasks match your filters.</li>}
        {list.map((t) => (
          <li key={t.id} className={`card-soft p-3 sm:p-4 flex items-center gap-2 sm:gap-3 ${t.completed ? "opacity-60" : ""}`}>
            <input type="checkbox" checked={t.completed} aria-label={`Complete ${t.title}`} className="h-5 w-5 accent-primary shrink-0"
              onChange={() => { setTasks((p) => p.map((x) => (x.id === t.id ? toggleTask(x) : x))); toast.success(t.completed ? "Task marked pending" : "Task completed"); }} />
            <div className="flex-1 min-w-0">
              <div className={`font-medium break-words ${t.completed ? "line-through" : ""}`}>{t.title}</div>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                <span className={`px-2 py-0.5 rounded-md ${subjectClass(t.subject, preferences)}`}>{t.subject}</span>
                <span className={!t.completed && preferences?.deadlineWarnings && t.dueDate < today ? "text-high font-semibold" : ""}>Due {formatDue(t.dueDate)}{!t.completed && preferences?.deadlineWarnings && t.dueDate < today ? " · overdue" : ""}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityClass[t.priority]}`}>{t.priority}</span>
            <Button variant="ghost" size="icon" title="Edit task" aria-label={`Edit ${t.title}`} onClick={() => openEdit(t)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" title="Delete task" aria-label={`Delete ${t.title}`} onClick={() => { if (!confirm(`Delete "${t.title}"?`)) return; setTasks(p => p.filter(x => x.id !== t.id)); toast.success("Task deleted"); }} className="p-2 rounded-lg text-muted-foreground hover:bg-high-soft hover:text-high"><Trash2 className="h-4 w-4" /></Button>
          </li>
        ))}
      </ul>
    </>
  );
}
