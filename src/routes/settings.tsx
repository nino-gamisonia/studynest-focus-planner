import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SubjectColors } from "@/components/SubjectColors";
import { usePreferences, resetStudyNest, type Preferences } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({ head: () => ({ meta: [
  { title: "Settings — StudyNest" }, { name: "description", content: "Manage StudyNest calendar, focus, notification, subject color and privacy preferences." },
  { property: "og:title", content: "Settings — StudyNest" }, { property: "og:description", content: "Personalize your study routine and manage browser-local data." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: Settings });

function Settings() {
  const [preferences, update] = usePreferences();
  const [confirmReset, setConfirmReset] = useState(false);
  const [draft, setDraft] = useState<Preferences | null>(null);
  const value = draft ?? preferences;
  if (!value) return <p role="status">Loading settings…</p>;
  return <>
    <PageHeader title="Settings" subtitle="Make StudyNest fit your routine" />
    <div className="max-w-3xl">
      <section className="pb-6"><h2 className="text-lg font-semibold mb-2">Profile preferences</h2><p className="text-sm text-muted-foreground mb-3">{preferences?.displayName} · Local demo profile</p><Button variant="outline" asChild><Link to="/profile">Edit profile and goals</Link></Button></section>
      <form className="border-t py-6 space-y-5" onSubmit={e => { e.preventDefault(); update(p => ({ ...p, calendarView:value.calendarView, focusMinutes:value.focusMinutes, timerSound:value.timerSound, deadlineWarnings:value.deadlineWarnings })); setDraft(null); toast.success("Preferences saved"); }}>
        <h2 className="text-lg font-semibold">Study preferences</h2>
        <div className="grid sm:grid-cols-2 gap-4"><label className="text-sm">Default calendar view<select className="field mt-2" value={value.calendarView} onChange={e => setDraft({ ...value, calendarView:e.target.value === "day" ? "day" : "week" })}><option value="week">Week View</option><option value="day">Day View</option></select></label>
        <label className="text-sm">Focus session length (minutes)<input required type="number" min={1} max={120} className="field mt-2" value={value.focusMinutes} onChange={e => setDraft({ ...value, focusMinutes:Number(e.target.value) })} /></label></div>
        <h2 className="text-lg font-semibold pt-2">Notifications</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="w-5 h-5 accent-primary" checked={value.timerSound} onChange={e => setDraft({ ...value, timerSound:e.target.checked })} />Play a sound when the focus timer finishes</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="w-5 h-5 accent-primary" checked={value.deadlineWarnings} onChange={e => setDraft({ ...value, deadlineWarnings:e.target.checked })} />Highlight missed deadlines in the app</label>
        <Button type="submit">Save preferences</Button>
      </form>
      <SubjectColors />
      <section className="border-t py-6"><h2 className="text-lg font-semibold mb-3">Data & privacy</h2><p className="text-sm text-muted-foreground leading-relaxed">Your assignments, study sessions, profile and preferences are stored on this browser only. There is no account, cloud backup, email notification or cross-device sync. Clearing browser data removes your saved information. Avoid storing sensitive personal information on a shared device.</p></section>
      <section className="border-t py-6"><h2 className="text-lg font-semibold mb-2">Reset StudyNest</h2><p className="text-sm text-muted-foreground mb-4">Permanently clear tasks, sessions, profile and preferences in this browser.</p>
        {!confirmReset ? <Button variant="outline" className="text-high" onClick={() => setConfirmReset(true)}>Reset all data</Button> : <div role="alert" className="border border-high bg-high-soft p-4 rounded-lg"><p className="text-sm text-high font-medium mb-3">Delete all StudyNest data? This cannot be undone.</p><div className="flex flex-wrap gap-2"><Button variant="destructive" onClick={() => { try { resetStudyNest(); setDraft(null); setConfirmReset(false); toast.success("StudyNest data reset"); } catch { toast.error("Could not reset browser data. Try again."); } }}>Confirm reset</Button><Button variant="outline" onClick={() => setConfirmReset(false)}>Cancel</Button></div></div>}
      </section>
    </div>
  </>;
}
