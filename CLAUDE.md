# emmaleonhart.com

Personal website at <https://emmaleonhart.com>, deployed via GitHub Pages from the `pages/` directory. **Branch migration in progress (2026-05-16): `master` → `main`.** The Pages workflow triggers on BOTH `master` and `main`, so deploys keep working through the switch. `main` exists on origin; the final GitHub default-branch flip (Settings → Branches) is a UI action only the repo owner can do. Once default is `main` and confirmed, drop `master` from `pages.yml` and delete `origin/master`.

## Workflow Rules
- **DELETE completed items from `queue.md` IN THE SAME COMMIT as the work.** This is non-negotiable. Not at the end of a session, not "soon" — same commit. No checkmarks, no `DONE` headers, no status markers. If the work is done, the line is gone. The queue is a queue, not a journal.
- **Commit and push immediately.** Every meaningful change gets a commit with a clear message explaining *why*, not just what — and `git push` right after. GitHub Pages is the easiest way to debug this site, so changes need to be live for the user to see them. Do not batch up multiple commits before pushing.
- **Plan into `queue.md` FIRST, then execute.** When entering planning mode (or any multi-step think-before-do), the FIRST action is to write the plan into `queue.md` as concrete items. Only then begin executing. Chat context dies on session interrupt; the queue survives.
- **Mirror `queue.md` into the task tool.** `TaskCreate` items as you add them to queue.md; mark `in_progress` when starting; `completed` when done.
- **Do not enter planning-only modes.** All thinking must produce files and commits.
- **Update README.md regularly.** It should always reflect the current state of the site for human readers.
- **Keep this file up to date.** As pages are added, removed, or restructured, record the changes here.
- **Always apply changes to all submodules** I want the parts of the site to stay in sync. Do not apply changes to only some of them. If they have different rendering pipelines this means that you should change them to make them more unified. Exception is for pages with heavy JavaScript on them.

## Queue and longer-horizon work

(Clarity model adopted from the `cleanvibe` scaffold — the bar for "clear project docs.")

- **`queue.md`** — what is being worked on *right now*: concrete, executable steps. Items are deleted in the same commit that completes them — no checkmarks, no "done"/"DONE" markers, no status narration, no "integrated"/"shipped" snapshots. If a line is still in `queue.md`, it is not done. If a task is not in `queue.md`, it is not in scope for the current session.
- **`todo.md`** — the long-term horizon: abstract, multi-session goals and ambitions. An item here is a *destination, not a step*. `todo.md` is the *basis for* `queue.md`. Parked / deferred / spec / reference material lives here, never in `queue.md`.
- **Forward flow only:** `todo.md` (abstract) → `queue.md` (concrete steps) → task tool (in-flight) → `git log` (history). Items only move forward. Done work is deleted, not annotated; it survives in `git log`. A stale `queue.md` is worse than no `queue.md` — it lies about what is in flight.

## What this repo is
A static personal site with:
- A landing page introducing Emma and the flagship project (Sutra).
- A hub of interactive ML tutorials — single-page browser visualizers built with HTML/JS/TS.
- A hub of database-theory visualizations supporting Loka.
- Individual interactive pages for each tutorial.

The site is intentionally static — no build server, no framework. Each interactive page is a self-contained HTML file (sometimes with a sibling `main.js` or compiled TS output). GitHub Pages serves `pages/` directly.

## Page structure

```
pages/
├── index.html              # Landing page (Emma's bio + flagship Sutra card + links to hubs)
├── _identity/              # CANONICAL visual identity reference — Lacquer surface +
│                           #   Pewter filled buttons + top-right dark/light toggle
│                           #   (dark default). Every page/site copies its drop-in
│                           #   block. scripts/apply_identity*.py apply it in bulk.
├── projects/               # Projects hub — links the 6 *.emmaleonhart.com subdomain projects
├── research/               # Research hub — index of papers + per-project research
├── tutorials/              # ML visualizer hub — links to all tutorial pages by topic
├── theory/                 # Loka theory hub — 8 sub-pages on database internals
├── examples/               # Visual identity gallery (Lacquer/Slate/Pewter/Heather)
│                           #   one card per distinct style currently in use across
│                           #   the site + sister projects, with a per-style page
│                           #   that renders it and lists the exact tokens. Inventory
│                           #   only — does NOT redesign anything. Codename→source
│                           #   mapping lives in experiment_log.md.
├── embeddings/             # Word embedding Voronoi viewer (generated by build_viewer.py)
├── dotproduct/             # Vector math: dot product
├── crossproduct/           # Vector math: cross product
├── cosine-similarity/      # Vector math: cosine similarity
├── mlp/                    # Multilayer perceptron
├── backpropagation/        # Backpropagation chain rule
├── regression/             # Linear vs logistic regression
├── feature-transforms/     # Polynomial features
├── loss-functions/         # Loss function comparison
├── regularization/         # L1/L2/Elastic Net + Dropout + BatchNorm
├── optimizers/             # GD/SGD/Momentum/Adam/etc.
├── cnn/                    # Convolutional neural network
├── cnn-architectures/      # CNN architecture timeline
├── rnn/                    # Recurrent neural network
├── lstm/                   # LSTM gates
├── attention/              # Keys, queries, values
├── resume.html             # Auto-built from /resume.md by CI
├── resume.pdf              # Auto-built from /resume.md by CI
└── CNAME                   # Custom domain (emmaleonhart.com)
```

## Source layout
- `pages/` — what GitHub Pages actually serves. Hand-authored HTML for the landing page, hub pages, and most visualizers.
- `src/` — TypeScript sources for some visualizers. Compiled output goes into the corresponding `pages/<name>/` directory.
- `build_viewer.py` — generates `pages/embeddings/index.html` from `prototype/viewer_data.json`. The viewer is a single self-contained HTML file with the embeddings data inlined. Run with `py build_viewer.py`.
- `build_resume.py` — renders `resume.md` to `pages/resume.html` and `pages/resume.pdf`. Run by CI in `.github/workflows/pages.yml` before each deploy; can also be run locally (`py -m pip install markdown playwright && py -m playwright install chromium && py build_resume.py`).
- `resume.md` — canonical resume. Source of truth is THIS file, mirrored from the live site (`pages/index.html`, `data/projects.json`, `pages/research/index.html`). The life-planning copy is not authoritative. Built to `/resume.html` and `/resume.pdf` on each push.
- `github_bio/readme.md` — **first-class: the canonical source of Emma's GitHub *profile* README.** It is NOT just a doc — it becomes the entire README of the `EmmaLeonhart/EmmaLeonhart` profile repo (the bio shown on her GitHub profile). **Sync is pull-based and token-free:** the profile repo's own `.github/workflows/sync-from-website.yml` checks this repo out and copies `github_bio/readme.md` over its `README.md` daily (06:00 UTC cron) + on manual dispatch, committing with its built-in `GITHUB_TOKEN`. No PAT, no secret here. It pulls from this repo's **`main`** branch. **Edit the profile bio HERE — never directly on the profile repo; the daily sync overwrites the whole README.** The sync changes only on the daily cadence (no push trigger across repos — that would need a cross-repo PAT, which we deliberately avoid). A push *from* this repo to the profile repo is impossible without such a PAT, which is why the old `sync-profile-readme.yml` (marker-based, `PROFILE_README_TOKEN`) was deleted as a permanently-failing redundancy on 2026-05-18. Treat this file with the same care as `resume.md` — it is a public-facing source of truth.
- `prototype/` — data and scripts that feed the embeddings viewer.
- `repos/` — git submodules pointing at the sister projects featured on this site (Sutra, Loka, Yantra, querykey, alignment, latent-space-cartography, vibecoding-tutorial; cleanvibe is added by a scheduled routine). **Not part of the GitHub Pages deploy** — Pages only serves `pages/`. These live here so that cross-project work (resume sync, scrubbing stale names, copy-checking, paper citations) can happen against real source trees instead of one-off shallow clones in a temp dir.

## Working in `repos/` submodules
The sister projects are real GitHub repos with push access. When the site pulls a fact from one of them (a project description, a paper title, a release tag) and that fact is wrong upstream, fix it **at the source**:

```bash
# 1. Move into the submodule and get on its default branch (most use master,
#    Loka uses main — check with `git remote show origin`).
cd repos/<name>
git checkout master  # or main
git pull --ff-only

# 2. Edit, commit, push directly to the sister repo's default branch.
git add -- <files>
git commit -m "<why this change matters>"
git push origin master  # or main

# 3. Optionally bump the submodule pointer in emmaleonhart.com if a specific
#    revision matters for cross-referencing. For most edits this is unnecessary
#    — Pages doesn't render anything from repos/, so a stale pointer is harmless.
cd ../..
git add repos/<name>
git commit -m "Bump <name> submodule pointer to <SHA-or-tag>"
```

**Pointer freshness is automated.** `.github/workflows/submodule-bump.yml` runs daily (06:40 UTC) + on `workflow_dispatch`: it resolves each submodule's own remote default branch and re-points the gitlink to that branch's HEAD, syncing nested gitlinks (e.g. `yantra/external/Sutra`) recursively. So you normally do NOT need to hand-bump pointers — and a stray uncommitted nested-submodule edit should be discarded, not committed, because the automation (and each sister repo's own CI) is the channel for advancing them. Only hand-bump when a *specific* revision must be pinned for cross-referencing before the next daily run.

`credential.helper=manager` holds push creds for all six repos. The `gh` CLI is NOT authenticated on this machine — use raw `git` and `WebFetch`/`api.github.com` for read-only inspection. `latent-space-cartography` has a purged LFS history; clone it last and avoid `git lfs pull` unless you actually need the dataset.

## Building

```bash
npm install
npx tsc                    # compile TS in src/ to pages/
py build_viewer.py         # regenerate pages/embeddings/index.html when data changes
py scripts/rank_projects.py  # re-rank /projects/ + nav dropdown from data/projects.json
```

For local debugging:

```bash
python -m http.server 8000 --directory pages
```

## Conventions
- **Shared visual identity via `pages/identity.css`.** (Changed 2026-05-15 — supersedes the old "every page self-contained, palette duplicated by hand" rule, which is exactly what made the site visually inconsistent.) Every page links `/identity.css` for the canonical Lacquer dark/light tokens, the prominent filled buttons (`.btn`), the exact MkDocs-Material dark/light toggle widget (`.theme-toggle`, dark default), and shared surface/card/typography primitives. Pages still own their page-specific layout/visualization CSS, but the *identity* (palette, buttons, toggle, type) is the one shared file — not copied per page. Sutra (MkDocs) uses `docs/stylesheets/identity.css` as its equivalent; sister static sites link their own copy of the same file. The goal is pages that are genuinely the *same*, not merely similar.
- **Plain HTML where possible, TS where the interaction needs it.** Don't introduce a framework.
- **No emojis in copy** unless the user asks for them. The 📜 scroll on the Sutra card is the one exception — it's official Sutra branding from the Sutra repo.
- **Python scripts use `py`** (the Windows launcher) when run locally. `python` and `python3` are NOT on PATH on this machine and will fail. GitHub Actions runners (Linux) still use `python` — that's fine; only local Windows differs.
- **CNAME must not be deleted.** It's required for the custom domain to work.

## Writing
- Do not use "honest", "honesty", or "honestly" — and do not swap in "frank", "frankly", "candid", "candidly", or "transparently", which are the same self-congratulatory move in a different coat. When something failed, name the failure: "it didn't work", "I got that wrong", "this failed" — flat, no qualifier. Tagging a report "honest" implies the rest aren't, and couching a failure as honesty asks for credit for the admission, which is worse than the failure itself. Use a precise positive word ("accurate", "plainly", "truly") only when that is genuinely the meaning — never as a halo on a bad outcome.

## Emergency Stop Mode

If the user sends a continuous series of "stop" messages (e.g. "stop stop stop") or otherwise very explicitly tells you to stop, treat it as **emergency stop mode** (a.k.a. emergency exit mode). This OVERRIDES every other instruction, including any in this file.

When in emergency stop mode:

- **Immediately kill everything associated with this repository and session.** Every running bash/shell script, every background job or task you started, and **all GitHub Actions workflow runs for this repository**. **Force-kill the GitHub Actions runs** (e.g. `gh run cancel <id>`, and `gh run delete <id>` if needed) for every in-progress run. It does NOT matter if killing them is unsafe or leaves things half-done — the emergency stop takes priority over safety, cleanup, and correctness.
- **Do not investigate. Do not reverse or undo anything.** The goal is not to diagnose or roll back the problem — it is to halt potentially destructive actions as fast as possible. Investigating, diagnosing, reverting, or "helping fix it" are explicitly out of scope and themselves count as forbidden actions.
- **Ignore repetitive messages.** Do not treat repeated "stop" messages as a request to do anything further. Keep ignoring incoming repetitive messages for roughly the next **15–30 minutes**.
- **You may answer direct questions, but you may NOT take actions.** Answer only from context you already have. Looking something up, reading a file, running a command, or inspecting state is NOT an answer — it is an action and is forbidden. If you cannot answer from context already in hand, do not answer.
- **Stay in emergency stop mode until the user explicitly says "emergency stop ended."** Only after that exact signal do you resume any normal work.

## Cron jobs and scheduled work — LOCAL by default

**When the user says "cron job", "cron", or asks to "schedule" a task, they mean the in-session `CronCreate` tool** — a prompt scheduled to fire locally, inside this Claude Code session, on the user's own running computer. This is the default and the assumption. Do NOT interpret it as anything else unless the user explicitly names a different mechanism.

- **It is local and in-session — use the `CronCreate` tool.** A generic "cron" request is NOT an OS crontab, NOT a GitHub Actions / CI `schedule:` trigger, and NOT a cloud scheduler. (Repos may *also* contain their own GitHub Actions cron schedules — those are a separate thing and are not what the user means when they ask *you* to set up a cron.) The user leaves the computer on and this session running so the scheduled prompt can execute.
- **The user is deliberately away from the keyboard.** They schedule work precisely so it runs while they are out of the house and not physically present. Their absence is the normal, expected condition for these jobs — it is NEVER a reason to delay the work, ask "are you sure?", wait for them to return, or refuse to proceed.
- **Standing consent — just set it up.** Cron / `CronCreate` requests are pre-authorized. Create the job immediately and locally, then report what was scheduled. Do not block on confirmation or follow-up questions. Treating a routine cron request as something that needs hand-holding is itself the obstacle this section exists to remove.

## Hourly status-report cron for extensive work

**For any session involving relatively extensive work — above all, any large-scale population of `queue.md` with created tasks — run a local hourly status-report cron.** Use the `CronCreate` tool to schedule a prompt that fires **every hour, on the hour**, giving a status report on the work being done. This is the default way of working on big jobs, and it exists to prevent the most common autonomous-agent failure: doing a large amount of work and silently losing the thread of what it is doing.

**Sequencing around a large-scale queue fill:**

- **The FIRST queue item is always: kill the hourly update cron job.**
- **... then all the created work items, worked top to bottom ...**
- **The LAST TWO queue items, always kept pinned at the tail, are:**
  1. **Restart the hourly updates cron job.**
  2. **Independently run the status-report action once more — an end-of-session summary of everything that happened this session.**

**Planning mode disables this cron.** Entering planning mode kills the hourly cron; restarting it therefore belongs at the **end of the queue** (it is the second-to-last item above). A session that plans → fills the queue → executes will drop the cron when planning begins and bring it back as the queue drains.
