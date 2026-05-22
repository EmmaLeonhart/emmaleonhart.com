# Emma Leonhart

emmaleonhart999@gmail.com
[GitHub](https://github.com/EmmaLeonhart) · [emmaleonhart.com](https://emmaleonhart.com)

---

## Summary

Software engineer who builds languages, systems, and evaluation infrastructure for AI. I ship across the stack — a PyTorch-targeting compiler, a Rust triplestore, reproducible LLM eval/measurement harnesses, and CI-driven research pipelines — with a bias toward rigor: results that reproduce from a clean clone.

---

## Selected Projects

### [Sutra](https://sutra.emmaleonhart.com) — Language + compiler · [GitHub](https://github.com/EmmaLeonhart/Sutra)
A typed language that compiles logical and vector operations to fused PyTorch tensor ops — GPU-native and differentiable. Reference compiler, IntelliJ/VS Code plugins, language spec. Paper: [arXiv:2605.20919](https://arxiv.org/abs/2605.20919).

### [Loka](https://loka.emmaleonhart.com) — Rust RDF-star triplestore · [GitHub](https://github.com/EmmaLeonhart/Loka)
High-performance triplestore in Rust with native HNSW vector indexing and temporal queries — one engine replacing both a vector database and a SPARQL store.

### [Redemption-Realignment](https://alignment.emmaleonhart.com) — LLM evaluation harness · [GitHub](https://github.com/EmmaLeonhart/alignment)
A behavioral + geometric evaluation harness for LLMs: measures alignment shifts under different system prompts across Llama and Qwen (0.5B–8B), reproducible from a clean clone with weights pulled from HuggingFace.

### [Latent Space Cartography](https://latent-space.emmaleonhart.com) — Embedding measurement · [GitHub](https://github.com/EmmaLeonhart/latent-space-cartography)
Reproducible analysis of frozen text embeddings using Wikidata as probes — surfaced a production `[UNK]` tokenizer defect in mxbai-embed-large (unrelated diacritical strings collapse to cosine 1.0), bisected to a single Ollama release across 21 versions in CI.

### [Yantra](https://yantra.emmaleonhart.com) — Neuro-symbolic OS · [GitHub](https://github.com/EmmaLeonhart/Yantra)
A GPU-native OS written in Sutra: kernel, processes, IPC, and GUI as one differentiable tensor-op graph.

### [QueryKey](https://querykey.emmaleonhart.com) — Local-first PRM / social · [GitHub](https://github.com/EmmaLeonhart/querykey)
A locally-run social network and personal-relationship manager with on-device AI agents, built on a local-first ingest → knowledge-graph engine.

---

## Developer & Agent Tooling

[cleanvibe](https://github.com/EmmaLeonhart/cleanvibe) — Python scaffolding for agentic coding projects: the docs / queue / devlog conventions an AI agent works inside to stay on-task across sessions.
[claw.py / OpenClaw](https://github.com/EmmaLeonhart/claw.py) — portable, structured context for AI agent sessions.
[emmaleonhart.com](https://emmaleonhart.com) — 16 interactive ML visualizers and 8 database-theory explainers.

---

## Experience

### Developer — Ambient Games
*2024–2025*
- Shipped on *Schema* (video game) across the .NET ecosystem (C#) with CI/CD in Azure DevOps; integrated Ollama for in-game local LLM conversation.

### Wikimedia / Wikidata Contributor (independent)
*2025–present*
- Python automation against MediaWiki and Wikibase APIs — SPARQL-driven batch edits at scale (cleanup, qualifiers, references).

---

## Education

**Associates of Computer Science** — Okanagan College, 2020–2023
**BA, Economics (minor: Philosophy)** — University of British Columbia Okanagan, 2014–2019.

---

## Skills

**Languages:** Rust, C#, Python (PHP, Lisp — working knowledge).
**AI / ML:** LLM evaluation harnesses, embedding-space analysis, steering-vector / alignment experiments, tensor-op compilation.
**Systems / infra:** RDF-star, HNSW, SPARQL, GitHub Actions CI/CD, Azure DevOps, MediaWiki / Wikibase, Playwright.
