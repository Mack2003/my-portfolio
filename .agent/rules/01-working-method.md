# Working Method

1. Route the task through `.agent/README.md` and name the files to touch.
2. Plan briefly: goal, files, tokens/shapes, performance impact, and phone/tablet/desktop behavior for UI.
3. If design or content is ambiguous, ask Malay or offer two options; do not use a generic default.
4. Make the smallest change that works. Touch only named files; avoid drive-by refactors.
5. Verify build, lint and TypeScript with `npx tsc --noEmit`. For every UI change, run the app and open the changed page in a browser; check the implemented behavior and appearance at 390px, 820px and 1440px, fix any issues found and recheck, then run the design checklist. State anything not checked.
6. Update `project/status.md`, plus the sections map or design system if affected.
7. Report in three lines: changes, verification, unverified items or next steps.

The task is not complete until verification and documentation updates are done.
