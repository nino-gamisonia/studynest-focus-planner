import { formatDue, priorityClass, subjectClass, toggleTask, usePreferences, useTasks, type Task } from "@/lib/store";
import { toast } from "sonner";

export function TaskList({ tasks, empty }: { tasks: Task[]; empty: string }) {
  const [, update] = useTasks();
  const [preferences] = usePreferences();
  return tasks.length === 0 ? <p className="text-sm text-muted-foreground py-5">{empty}</p> : <ul className="divide-y">{tasks.map(task => <li key={task.id} className="flex items-center gap-3 py-3">
    <input type="checkbox" checked={task.completed} aria-label={`Complete ${task.title}`} className="h-5 w-5 shrink-0 accent-primary" onChange={() => { update(p => p.map(t => t.id === task.id ? toggleTask(t) : t)); toast.success("Task completed"); }} />
    <div className="flex-1 min-w-0"><div className="font-medium break-words">{task.title}</div><span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md ${subjectClass(task.subject, preferences)}`}>{task.subject}</span></div>
    <div className="text-right shrink-0"><span className={`text-xs px-2 py-0.5 rounded-full ${priorityClass[task.priority]}`}>{task.priority}</span><div className="text-xs text-muted-foreground mt-1">{formatDue(task.dueDate)}</div></div>
  </li>)}</ul>;
}