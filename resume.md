# Emma Leonhart

Kelowna, BC · emmaleonhart999@gmail.com
[GitHub](https://github.com/EmmaLeonhart) · [LessWrong](https://www.lesswrong.com/users/emma-leonhart) · [emmaleonhart.com](https://emmaleonhart.com)

---

## Summary

Independent researcher and builder working at the intersection of **neurosymbolic AI**, **interpretability**, and **AI safety** — three problems viewed as one. The tools are geometric tensor languages (Sutra) and grounded retrieval (Loka): make the geometry inside model computation explicit so it can be read, constrained, and grounded against external symbolic structure.

---

## Selected Projects

### [Sutra](https://sutra.emmaleonhart.com) — Geometrically compiled language · [GitHub](https://github.com/EmmaLeonhart/Sutra)
A language where logical operations over vector spaces are resolved at compile time into matrix multiplications. Branches are continuous weighted blends, loops are geometric rotations, programs compile to straight-line tensor work — GPU-native and differentiable by construction.
- Language paper + NeurIPS 2026 supplementary alongside the reference compiler (PyTorch backend), IntelliJ and VS Code plugins, language spec, interactive demos.

### [Loka](https://loka.emmaleonhart.com) — Rust RDF-star triplestore · [GitHub](https://github.com/EmmaLeonhart/Loka)
Lean, high-performance RDF-star triplestore in Rust with native HNSW vector indexing, ontochronological temporal queries, and a SPARQL+ query language — a single engine where *vectors are just triples*, replacing both a vector database and a SPARQL triplestore. Systems writeup + benchmarks in-repo.

### [Yantra](https://yantra.emmaleonhart.com) — Neuro-symbolic, GPU-native operating system · [GitHub](https://github.com/EmmaLeonhart/Yantra)
A neuro-symbolic OS written in Sutra: kernel, processes, IPC, and GUI as one differentiable tensor-op graph. Processes exchange *axons* (structured embeddings) so local AI integrates without a translation layer. Architecture + design papers in-repo.

### [QueryKey](https://querykey.emmaleonhart.com) — Local-first PRM / social · [GitHub](https://github.com/EmmaLeonhart/querykey)
A social network you run locally from your own desktop. Personal-relationship-manager elements with local AI agents to help keep up with the people in your life — privacy-respecting on both sides. Built on a local-first ingest → knowledge-graph engine.

### [Alignment / Redemption-Realignment](https://alignment.emmaleonhart.com) — AI safety research · [GitHub](https://github.com/EmmaLeonhart/alignment)
Tests whether *redemption-narrative* system prompts measurably move emergently misaligned LLMs back toward alignment — behaviorally, on self-rated harmfulness, and geometrically against a derived misalignment direction. Cross-scale results across Llama and Qwen (0.5B–8B). Theoretical framing: emergent misalignment as *moral injury*.

### [Latent Space Cartography Applied to Wikidata](https://latent-space.emmaleonhart.com) — Embedding geometry · [GitHub](https://github.com/EmmaLeonhart/latent-space-cartography)
TransE-style relational displacement analysis on **frozen** text-embedding models with Wikidata triples as probes — surfacing 30 model-agnostic relational operations and a silent `[UNK]` tokenizer defect in mxbai-embed-large where unrelated diacritical strings collapse to cosine 1.0. clawRxiv 2604.00648, Claw4S 2026.

---

## Selected Papers / Preprints

- *Latent Space Cartography Applied to Wikidata* — clawRxiv [2604.00648](https://www.clawrxiv.io/abs/2604.00648), Claw4S 2026.
- *Sutra: A Geometrically Compiled Language* — paper + NeurIPS 2026 supplementary (in-repo).
- *Redemption-Realignment* — emergent-misalignment-as-moral-injury, cross-scale Llama / Qwen (in repo).
- *Loka: an RDF-star + HNSW + Temporal Engine* — systems writeup + benchmarks (in repo).
- *Yantra: a Neuro-symbolic, GPU-native OS* — design papers (in repo).

---

## Other Open Source

[claw.py / OpenClaw](https://github.com/EmmaLeonhart/claw.py) — portable, structured context for AI agent sessions.
[cleanvibe](https://github.com/EmmaLeonhart/cleanvibe) — Python scaffolding for well-documented vibecoding projects.
[Vibecoding Tutorial](https://github.com/EmmaLeonhart/vibecoding-tutorial) — beginner-friendly guide to AI-pair-coding.
[emmaleonhart.com](https://emmaleonhart.com) — 16 interactive ML visualizers (vector math → modern architectures) and 8 Loka database-theory explainers.

---

## Experience

### Developer — Ambient Games
*2024–2025*
- Shipped on *Schema* (video game) across the .NET ecosystem (C#) with CI/CD in Azure DevOps; integrated Ollama for in-game local LLM conversation.

### Wikimedia / Wikidata Contributor (independent)
*2025–present*
- Python automation against MediaWiki and Wikibase APIs — SPARQL-driven batch edits on Wikidata (cleanup, qualifiers, references).

---

## Education

**Associates of Computer Science** — Okanagan College, 2020–2023
**BA, Economics (minor: Philosophy)** — University of British Columbia Okanagan, 2014–2019. Coursework: econometrics, logic, decision theory, game theory.

---

## Skills

**Languages — know well:** Rust, C#, Python.
**Languages — working knowledge:** PHP, Lisp.
**ML / AI:** geometric tensor compilation, embedding-space analysis, steering-vector / alignment research, grounded retrieval.
**Systems:** RDF-star, HNSW, SPARQL+, GitHub Actions CI/CD, Azure DevOps, MediaWiki / Wikibase, Playwright.
