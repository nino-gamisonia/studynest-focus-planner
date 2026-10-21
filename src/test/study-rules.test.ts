import { describe, expect, it } from "vitest";
import { dashboardData, sessionConflicts, toggleTask, type Task } from "@/lib/store";

const task = (id: string, priority: Task["priority"], dueDate: string): Task => ({ id, title: id, subject: "Math", dueDate, priority, completed: false, createdAt: 1 });
describe("StudyNest task rules", () => {
  it("selects the top three incomplete tasks by priority then deadline", () => {
    const tasks = [task("low", "Low", "2026-10-19"), task("later", "High", "2026-10-23"), task("early", "High", "2026-10-21"), task("medium", "Medium", "2026-10-22"), { ...task("done", "High", "2026-10-19"), completed: true }];
    expect(dashboardData(tasks, new Date("2026-10-21T12:00:00")).priorities.map(t => t.id)).toEqual(["early", "later", "medium"]);
  });
  it("updates weekly progress when a task is completed and undone", () => {
    const tasks = [task("a", "High", "2026-10-21"), task("b", "Low", "2026-10-22")];
    const now = new Date("2026-10-21T12:00:00");
    const completed = toggleTask(tasks[0], now.getTime());
    expect(dashboardData([completed, tasks[1]], now).weeklyPercent).toBe(50);
    expect(dashboardData([toggleTask(completed), tasks[1]], now).weeklyPercent).toBe(0);
  });
  it("does not invent completion dates for legacy completed tasks", () => {
    expect(dashboardData([{ ...task("old", "Low", "2026-10-21"), completed: true }], new Date("2026-10-21T12:00:00")).completedThisWeek).toBe(0);
  });
  it("separates overdue deadlines from upcoming deadlines", () => {
    const data = dashboardData([task("past", "High", "2026-10-20"), task("soon", "Low", "2026-10-22"), task("far", "High", "2026-11-30")], new Date("2026-10-21T12:00:00"));
    expect(data.overdue.map(t => t.id)).toEqual(["past"]);
    expect(data.upcoming.map(t => t.id)).toEqual(["soon"]);
  });
});
describe("Study session conflicts", () => {
  const existing = [{ id: "one", subject: "Math", date: "2026-10-21", start: "10:00", end: "11:00" }];
  it("identifies conflicting sessions and excludes the session being edited", () => {
    expect(sessionConflicts({ date: "2026-10-21", start: "10:30", end: "12:00" }, existing).map(s => s.id)).toEqual(["one"]);
    expect(sessionConflicts({ ...existing[0] }, existing)).toEqual([]);
  });
  it("does not treat sessions on different days as overlapping", () => {
    expect(sessionConflicts({ date: "2026-10-22", start: "10:30", end: "12:00" }, existing)).toEqual([]);
  });
  it("allows adjacent sessions with matching end and start times", () => {
    expect(sessionConflicts({ date: "2026-10-21", start: "11:00", end: "12:00" }, existing)).toEqual([]);
  });
});