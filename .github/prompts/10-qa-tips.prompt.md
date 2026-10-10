---
mode: agent
description: Tips for working with Copilot on this project
---

## Tips for getting good results from Copilot

- **One prompt at a time.** Run the files in order, and commit after each. Copilot loses accuracy when asked to build everything in one go.
- **Review the audit first.** Prompt 00 makes Copilot read your project and propose a plan before touching code. Correct anything it misunderstood before moving on.
- **Use the strongest model you have available** in Agent mode, and use `#codebase` when you want it to search your whole project.
- **If it drifts** (restyles pages, adds libraries, invents facts), reply "Revert the style changes and follow copilot-instructions.md" and it will usually correct itself.
- **Commit first.** Make a clean commit before starting so you can compare or undo with `git diff`.
