# emmaleonhart.com — Work Queue

**This file is a queue, not a state snapshot.** It lists what is being worked on right now. Finished work lives in `git log` (and `experiment_log.md` if applicable). Longer-horizon ideas live in `todo.md`. When an item is done, delete it — no checkmarks, no status indicators.

**Why this file exists:** when a planning step produces a plan, that plan is written here BEFORE execution starts. An interrupted session can pick up from the queue rather than from chat context.

See `CLAUDE.md` § "Workflow Rules" for how this file, planning mode, and the task tool stay in sync.


## ACTIVE — vibecoding/cleanvibe onboarding + button-identity unification (2026-05-16)

Plan set at 2026-05-16 13:35 -0700. Two new sister projects join the
six: `vibecoding-tutorial` → vibecoding.emmaleonhart.com,
`cleanvibe` → cleanvibe.emmaleonhart.com. cleanvibe is in flux until
~15:05 today (new features landing), so its work is deferred to a cron.

### B. CRON 1 (~15:08 today, after cleanvibe flux) — cleanvibe full integration
Same as A but for `cleanvibe` (vibes=8, cleanvibe.emmaleonhart.com).
Commit + push all three repos (cleanvibe + emmaleonhart.com + re-touch
vibecoding if identity changed). Detailed steps live in the cron prompt.

### C. CRON 2 (~19:37 today, +6h) — cleanvibe follow-up
Check cleanvibe for commits landed since cron 1. If any: bump the
`repos/cleanvibe` submodule pointer and refine cleanvibe.emmaleonhart.com
to better fit the visual identity. Commit + push. If unchanged, no-op +
delete this item.

### D. CRON 3 (~23:55 today / 06:55Z, +10h) — cleanvibe new-release check
Emma expects a NEW cleanvibe release by then. Check for new tags /
release / commits since the last run; if any, bump the
`repos/cleanvibe` pointer + update the cleanvibe site and its
`data/projects.json` desc/tags to reflect the release. Commit + push.
No-op if nothing new. Delete this item when done.

These three run as LOCAL one-shot session crons (cleanvibe work needs
the local credential.helper=manager + local working tree — it does NOT
work from the cloud). B=cron e276c1ae (15:08), C=cron 679b53ea (19:37),
D=cron c1d721d8 (23:55), all 2026-05-16 local. The earlier remote
routines (trig_01LUKG7…, trig_01Vd1Uh3…, trig_01LkDXSE…) are DISABLED
(superseded by these locals; delete fully at claude.ai/code/routines).

CAVEAT: the harness does not honor durable cron persistence here, so
these are session-only — they fire only while this Claude Code session
stays open and the machine is awake. If the session is closed before a
fire time, that cron is lost and the cleanvibe work for it must be run
by hand (steps are in sections B/C/D above).

## Sutra site visual unification — chrome restyle SHIPPED; full remake LONG-TERM

2026-05-16: Sutra's Material chrome restyled to the shared Lacquer
identity (dark header/tabs, the Loka-feel `.md-button`, lifted grid
cards, tinted admonitions, header re-ordered: search one side / theme
toggle next to the GitHub widget). Appearance only — structure, the
Material GitHub widget, and search kept; zero claims/math touched.
Pushed: sutra @ e1534435, pointer bumped here. Fuller remake is a
recorded LONG-TERM goal (Sutra `todo.md` → "Docs / website" + queue
Parked), incl. porting Sutra's nicer GitHub widget to the other sites.

VISIBILITY NOTE (updated 2026-05-16): Emma fixed the per-repo Pages
custom domain — the subdomains resolve now. HTTPS cert may still be
propagating for a bit. KEY RULE going forward: each sister site
deploys from ITS OWN repo's Pages workflow on push to that repo's
default branch — so every submodule edit must be committed AND pushed
to the sister repo's own remote (not just the superproject pointer).
Always verify sister local HEAD == sister origin after editing.

## Synoptic visual integration + /branding demonstration page (2026-05-16)

Emma's brief: every site should be reconstructed from the SAME shared
elements — main-site structure/identity + Lacquer palette + Loka-feel
buttons + Sutra's prominent Material GitHub repo widget + a Material
search component + the light/dark toggle (toggle sits next to the
GitHub widget; search on the other side).

CONFIRMED kit (locked from Emma's reference screenshots 2026-05-16):
1. GitHub repo widget = Sutra's Material `.md-source` VERBATIM
   (octocat + `Owner/Repo` one line + version·stars·forks pill).
2. Search = compact, expands on focus (NOT a wide box).
3. Light/dark toggle sits next to the GitHub widget; search opposite.
4. Primary button = calmer mid-tone fill + near-white label + a
   subtle AURORA GRADIENT/GLOW (NOT the old garish bright block).
   Based on the main-site buttons; every site inherits this.
5. Aurora side-glow = identity element (Emma liked it on Loka).
6. Emoji card icons = identity element (iconic, eye-catching).
7. Cosmic motif: the rotating orbital hero glyph — enlarged; MORE
   cosmic background elements wanted (todo.md).
8. Gradient + italic-serif display type = identity element, but
   flagged in todo.md to revisit (Emma unsure others will like it).
`/branding` is the LIVING STYLE GUIDE — iterate there, then roll out.

- [x] Build `/branding` (shipped + iterated: verbatim widget, compact
      search, emoji cards, aurora-gradient button, glyph).
- [ ] (ongoing) Reconstruct each sister site from the confirmed kit.
      Done so far: shared `identity.css` (palette + calmer/aurora
      button) on loka/querykey/alignment/yantra/vibecoding; Sutra
      chrome restyled (dark header/tabs/widget/search) + button.
      Remaining: per-site layout alignment to the main-site structure.

---

## Visual identity + GitHub stars widget — DONE locally; needs Emma's push

Main site is done and LIVE: one shared `pages/identity.css` (palette,
`.btn`, Material `.theme-toggle`, aurora, eyebrow, card, type, and the
shared `.gh` GitHub-repo pill); `index.html`/`projects/`/`research/`,
`pages/_identity/` (now the live demo), and the `build_viewer.py`
embeddings template all link it. Sister sites (Yantra/QueryKey/
Alignment/Loka) are committed LOCALLY: each carries its own copy of
`identity.css` and links it; Loka redone properly via `@import`+alias
(no more cascade-override); the live GitHub star/release pill is on all
four. Sutra unchanged by design (Material steer + its built-in repo
widget already shows stars). Full writeup: experiment_log
"TRUE Visual Identity Unification + GitHub repo pill (2026-05-16)".

**REMAINING — blocked on the auto-mode classifier (agent cannot push to
the shared sister repos).** Emma (or a permitted run) publishes the
widget + P5 + `v0.0.0` tags with ONE batch, from the emmaleonhart.com
repo root:

```
git -C repos/yantra push origin master ; git -C repos/yantra push origin v0.0.0
git -C repos/querykey push origin main ; git -C repos/querykey push origin v0.0.0
git -C repos/alignment push origin master ; git -C repos/alignment push origin v0.0.0
git -C repos/loka push origin main
git -C repos/latent-space-cartography push origin v0.0.0
```

After the push, do the only remaining identity item: the live dark+light
visual diff of all main-site + sister pages (Emma is ground truth on
GitHub Pages). Then delete this whole section.

---

## Subdomain RENDER diagnostic — RESOLVED (Emma was right: repo Pages-setting, not DNS/cert)

Full writeup: experiment_log.md "Subdomain Render Diagnostic v2". Emma's git/legacy-domain hypothesis confirmed; supersedes the old "account-level verification" theory.
- Deployed root CNAMEs all correct; no gh-pages branches. The two extra Pages workflows (`sutra/sutraDB/.github/workflows/pages.yml`, `lsc/old/.../pages.yml`) were INERT — GitHub only runs repo-root `.github/workflows/`. Removed as cruft (sutra@a86ec70f, lsc@5377bba) + bumped pointers.
- Root cause: each repo's GitHub Pages **"Custom domain" setting** (server-side, separate from the CNAME file) is stuck/desynced from the legacy domain (sutralang.dev / sutradb.org lineage), so GitHub serves the `*.github.io` cert → `ERR_TLS_CERT_ALTNAME_INVALID`. Loka's own `e136870 Repoint Pages custom domain` proves a human had to manually un-stick this before. `deploy-pages` won't repoint an already-set domain — that's why the re-kicks didn't help.
- **USER-ONLY FIX (needs GitHub UI / gh; not automatable here):** per repo (sutra, loka, querykey, alignment, latent-space-cartography) → Settings → Pages → Custom domain: clear it + Save, then re-enter the correct `<sub>.emmaleonhart.com` + Save. Forces DNS re-check + fresh cert. Same as Loka's e136870.

---

## Carry-over from before (do not re-do)

### Scheduled (self-executing)
- Monthly /research/ arxiv-link audit (remote routine).
- One-time ~6.5h (2026-05-16 03:24Z): build /skills directory from latest state of all repos. trig_018XAU18fNfRnjB5Y3WA6si2.
- Hourly LOCAL subdomain health check: session cron c0e659c7 (:07, 7-day expire). yantra 200; other 5 awaiting GitHub HTTPS cert.

### Flagged, not done by design
- querykey deep code-identifier rename (Go module / `secretarybird-old/` dir) — separate breaking refactor, needs user go-ahead.
- /theory/sutradb/ URL path still literally says sutradb (kept to avoid link breakage).
- publish.yml workflow_dispatch verify (clawRxiv CI path) — not actionable: `gh` not authed on this machine. Do when auth available, or trigger from GitHub UI.

### Subdomain sites — see the RESOLVED diagnostic section above
The earlier "account-level domain verification is the blocker" conclusion is **SUPERSEDED** by the v2 diagnostic (repo Pages custom-domain setting stuck on the legacy domain). Canonical domains were already resolved (sutra@c25c298c → sutra.emmaleonhart.com; loka already loka.emmaleonhart.com). The remaining action is the user-only per-repo Settings→Pages custom-domain re-set described above.

---

## Pointers

- Page-by-page layout: `CLAUDE.md` § "Page structure"
- Longer-horizon ideas: `todo.md`
- Experiment notes: `experiment_log.md`
- Narrative history: `git log`
