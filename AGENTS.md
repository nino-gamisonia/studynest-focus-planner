<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->


## StudyNest architecture
- Keep browser-local data in the shared store hooks using existing keys; additive fields preserve older user data.
- Centralize completion timestamps, weekly calculations, subject colors and calendar conflict checks in the store so every page follows the same rules.
- Weekly progress counts dated completions against tasks due this week or completed this week; legacy undated completions remain in lifetime totals without inventing dates.
- Use dedicated TanStack content routes for profile, settings and about; the shared shell provides navigation and action feedback.
