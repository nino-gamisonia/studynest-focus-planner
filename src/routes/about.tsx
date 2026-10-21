import { createFileRoute } from "@tanstack/react-router";
import { Feather, ListChecks, CalendarDays, Timer, Target } from "lucide-react";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/about")({ head: () => ({ meta: [
  { title: "About StudyNest — Study smart. Stay on track." }, { name: "description", content: "StudyNest helps university students organize assignments, manage deadlines and build better study habits." },
  { property: "og:title", content: "About StudyNest" }, { property: "og:description", content: "A calmer place to organize university life and make time for focused study." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: About });
function About() {
  return <>
    <PageHeader title="About StudyNest" subtitle="Study smart. Stay on track." />
    <div className="max-w-3xl"><Feather className="h-12 w-12 text-primary mb-6" /><section className="pb-8"><h2 className="font-display text-2xl text-primary mb-4">A calmer place for university life</h2><p className="text-muted-foreground leading-relaxed">StudyNest helps university students keep assignments, deadlines and study plans in one place. It's a practical companion for busy semesters, designed to make the next step feel manageable.</p></section>
      <section className="border-t py-8"><h2 className="text-lg font-semibold mb-3">Our mission</h2><p className="text-muted-foreground leading-relaxed">Help students spend less energy organizing their workload and more time learning. From a first-year reading list to a final-year project, StudyNest supports realistic schedules, clearer priorities and steady study habits.</p></section>
      <section className="border-t py-8"><h2 className="text-lg font-semibold mb-5">What you'll find in your nest</h2><div className="grid sm:grid-cols-2 gap-6">{[{icon:ListChecks,title:"Assignments & deadlines",copy:"Manage tasks by subject, due date and priority, and find what matters next."},{icon:CalendarDays,title:"A personal study calendar",copy:"Plan sessions in day and week views, with subject colors and overlap warnings."},{icon:Timer,title:"Focused study time",copy:"Make room for focused work with a timer and regular short and long breaks."},{icon:Target,title:"Progress & goals",copy:"Track completed assignments and planned study hours against your own weekly goals."}].map(({icon:Icon,title,copy}) => <div key={title}><Icon className="h-5 w-5 text-primary mb-3" /><h3 className="font-semibold mb-2">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{copy}</p></div>)}</div></section>
      <p className="border-t pt-6 text-sm text-muted-foreground">StudyNest currently works as a browser-local app. Your data stays on your device, with no real account or cloud sync.</p>
    </div>
  </>;
}
