import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserRound, CheckCircle2, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { usePreferences, useSessions, useTasks, type Preferences } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ head: () => ({ meta: [
  { title: "Your Profile — StudyNest" }, { name: "description", content: "Personalize your local StudyNest profile and weekly study goals." },
  { property: "og:title", content: "Your Profile — StudyNest" }, { property: "og:description", content: "Your study goals and lifetime statistics in one place." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Profile });

function Profile() {
  const [preferences, update] = usePreferences();
  const [tasks] = useTasks(); const [sessions] = useSessions();
  const [draft, setDraft] = useState<Preferences | null>(null);
  const value = draft ?? preferences;
  if (!value) return <p role="status">Loading profile…</p>;
  return <>
    <PageHeader title="Your Profile" subtitle="Local demo profile · saved only in this browser" />
    <div className="flex items-center gap-4 pb-6"><div className="bg-accent text-primary h-16 w-16 rounded-full grid place-items-center"><UserRound className="h-7 w-7" /></div><div className="min-w-0"><h2 className="text-xl font-semibold break-words">{preferences?.displayName}</h2><p className="text-sm text-muted-foreground">University student</p></div></div>
    <div className="grid grid-cols-2 gap-4 mb-8 max-w-xl">{[{ label:"Completed tasks", value:tasks?.filter(t => t.completed).length ?? 0, icon:CheckCircle2 },{ label:"Study sessions planned", value:sessions?.length ?? 0, icon:CalendarDays }].map(({label,value:count,icon:Icon}) => <div className="card-soft p-4" key={label}><Icon className="h-5 w-5 text-primary mb-2" /><div className="font-semibold text-2xl">{count}</div><div className="text-sm text-muted-foreground">{label}</div></div>)}</div>
    <form className="border-t pt-6 max-w-2xl space-y-5" onSubmit={e => { e.preventDefault(); if (!value.displayName.trim()) return; update(p => ({ ...p, displayName:value.displayName.trim(), introduction:value.introduction.trim(), weeklyTaskGoal:value.weeklyTaskGoal, weeklyStudyGoal:value.weeklyStudyGoal })); setDraft(null); toast.success("Profile saved"); }}>
      <label className="block text-sm font-medium">Display name<input required maxLength={60} className="field mt-2" value={value.displayName} onChange={e => setDraft({ ...value, displayName:e.target.value })} /></label>
      <label className="block text-sm font-medium">Personal introduction<textarea maxLength={280} rows={3} className="field mt-2 resize-y" value={value.introduction} onChange={e => setDraft({ ...value, introduction:e.target.value })} /></label>
      <h2 className="font-semibold text-lg pt-2">Weekly study goals</h2>
      <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm">Tasks to complete<input required min={1} max={100} type="number" className="field mt-2" value={value.weeklyTaskGoal} onChange={e => setDraft({ ...value, weeklyTaskGoal:Number(e.target.value) })} /></label><label className="text-sm">Study hours to plan<input required min={1} max={168} type="number" className="field mt-2" value={value.weeklyStudyGoal} onChange={e => setDraft({ ...value, weeklyStudyGoal:Number(e.target.value) })} /></label></div>
      <Button type="submit">Save profile</Button>
    </form>
  </>;
}
