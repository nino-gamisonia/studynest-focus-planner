import { Link } from "@tanstack/react-router";
import { LayoutDashboard, ListChecks, CalendarDays, Timer, Feather, UserRound, Settings, Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/planner", label: "Study Planner", icon: CalendarDays },
  { to: "/timer", label: "Focus Timer", icon: Timer },
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About Us", icon: Info },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex w-56 lg:w-64 shrink-0 flex-col bg-primary text-primary-foreground p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-10 w-10 rounded-xl bg-sage text-primary grid place-items-center"><Feather className="h-5 w-5" /></div>
          <div>
            <div className="font-display text-xl font-semibold leading-none">StudyNest</div>
            <div className="text-xs opacity-70 mt-1">Study smart. Stay on track.</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-80 hover:opacity-100 hover:bg-primary-foreground/10 transition"
              activeProps={{ className: "!opacity-100 bg-sage/25" }}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-xs opacity-60 mt-6">Your data is saved in this browser.</div>
      </aside>

      <header className="md:hidden sticky top-0 z-20 bg-background/90 backdrop-blur border-b px-4 py-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center"><Feather className="h-4 w-4" /></div>
        <span className="font-display text-lg font-semibold flex-1">StudyNest</span>
        <Button variant="ghost" size="icon" aria-label="More pages" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><UserRound /></Button>
        {menuOpen && <nav className="absolute top-full right-3 bg-card border shadow-soft rounded-lg p-2 flex flex-col min-w-40">{NAV.slice(4).map(({to,label,icon:Icon}) => <Link to={to} key={to} className="flex items-center gap-2 p-3 text-sm" onClick={() => setMenuOpen(false)}><Icon className="w-4 h-4" />{label}</Link>)}</nav>}
      </header>

      <main className="flex-1 min-w-0 px-4 py-6 md:px-10 md:py-10 pb-24 md:pb-10 max-w-6xl">{children}</main>

      <Toaster richColors position="top-right" />
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-card border-t grid grid-cols-4">
        {NAV.slice(0,4).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
            activeProps={{ className: "!text-primary font-semibold" }}>
            <Icon className="h-5 w-5" /> {label.replace("My ", "").replace("Study ", "").replace("Focus ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div className="min-w-0 max-w-full">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-primary break-words">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
