# Emma Leonhart

emmaleonhart999@gmail.com
[GitHub](https://github.com/EmmaLeonhart) · [emmaleonhart.com](https://emmaleonhart.com)

---

## Summary

Software engineer who builds languages, systems, and tooling for AI development. I work agent-first — most of what's below is built by driving AI coding agents inside my own scaffolding (cleanvibe), with the judgment to know when to take the wheel. I move fast across the stack — a PyTorch-targeting compiler, a generative knowledge graph in Rust, and reproducible analysis that surfaces real production bugs — and everything runs from a clean clone.

---

## Selected Projects

### [Sutra](https://sutra.emmaleonhart.com) — Language + compiler · [GitHub](https://github.com/EmmaLeonhart/Sutra)
A typed language that compiles logical and vector operations to fused PyTorch tensor ops — GPU-native and differentiable. Reference compiler, IntelliJ/VS Code plugins, language spec, and a SKILL file that walks a coding agent through reproducing the paper's results, each step pass/fail-gated. Paper: [arXiv:2605.20919](https://arxiv.org/abs/2605.20919).

### [cleanvibe](https://github.com/EmmaLeonhart/cleanvibe) — Agentic coding scaffold · [GitHub](https://github.com/EmmaLeonhart/cleanvibe)
Python scaffolding that defines the environment a coding agent works inside — the docs / queue / devlog conventions that keep an AI agent on-task and self-documenting across long, multi-session work.

### [Loka](https://loka.emmaleonhart.com) — Generative knowledge graph · [GitHub](https://github.com/EmmaLeonhart/Loka)
A Rust graph database with embeddings, built to be a *generative* knowledge graph: a small world model trained on Wikidata triples proposes new facts that are written back into the graph as triples with provenance.

### [Latent Space Cartography](https://latent-space.emmaleonhart.com) — Embedding measurement · [GitHub](https://github.com/EmmaLeonhart/latent-space-cartography)
Reproducible analysis of frozen text embeddings using Wikidata as probes — surfaced a production `[UNK]` tokenizer defect in mxbai-embed-large (unrelated diacritical strings collapse to cosine 1.0), bisected to a single Ollama release across 21 versions in CI.

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

**Languages:** Rust, C#, Python.
**AI / ML:** embedding-space analysis, agentic coding workflows.
**Systems / infra:** RDF-star, HNSW, SPARQL, GitHub Actions CI/CD, Azure DevOps, MediaWiki / Wikibase, Playwright.
