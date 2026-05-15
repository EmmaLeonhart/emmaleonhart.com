# Emma Leonhart

Kelowna, BC · emmaleonhart999@gmail.com
[GitHub](https://github.com/EmmaLeonhart) · [emmaleonhart.com](https://emmaleonhart.com)

---

## Summary

AI engineer at ManuForge. Independent work on embedding-space interpretability: Sutra (programming language operating in embedding space), SutraDB (graph database with embeddings and time-filtered queries), and a writeup of a silent tokenizer collision affecting Ollama BERT models.

---

## Selected Projects

### [Sutra](https://github.com/EmmaLeonhart/Sutra) — GPU-native programming language operating in embedding space
- Designed and implemented a fully differentiable, GPU-native, zero-control-flow language whose primitives live in embedding space rather than token space.
- Lets a user apply deterministic operations *inside* the latent space LLMs think in — reusing the model's thought-space as a substrate while controlling how outputs are derived.
- Zero-control-flow + differentiability is interpretability-relevant: programs are inherently more analyzable than imperative code over discrete tokens.

### [SutraDB](https://github.com/EmmaLeonhart/sutradb) — Open-source graph database with embeddings and timestamps
- REST graph database where each node can carry an embedding alongside its relational fields, and each triple can carry a timestamp.
- Time-filtered queries reconstruct the graph state at a chosen moment, enabling chronological graph RAG.

### [Found tokenizer collision in Ollama BERT embedding models](https://emmaleonhart.github.io/latent-space-cartography/tokenization-error.html)
- Found a silent tokenizer collision affecting mxbai-embed-large and related models — distinct inputs collapse to identical token sequences and identical embeddings.
- Built a reproducible script for demonstrating the glitch.

### [Abstract Wikipedia Editor](https://github.com/EmmaLeonhart/abstract-wikipedia-editor) — Wikifunctions automation
- Playwright-based automation for creating and editing Abstract Wikipedia entries from Wikidata QIDs.

---

## Experience

### AI Engineer — ManuForge AI
*March 2026–present*
- Built a world-modelling system for short stories that uses position in the text to establish known unknowns at each point — surfacing them so an author can make deliberate choices on them. Intended as input to a chronological-world-state-driven text-to-video pipeline (in progress).

### Developer — Ambient Games
*2024–2025*
- Shipped on *Schema* (video game) across the .NET ecosystem (C#) with the project's CI/CD in Azure DevOps; integrated Ollama for in-game local LLM conversation.

### Wikimedia / Wikidata Contributor (independent)
*2025–present*
- Python automation against MediaWiki and Wikibase APIs — SPARQL-driven batch edits on Wikidata (cleanup, qualifiers, references).

---

## Education

### Associates of Computer Science — Okanagan College
*2020–2023*

### BA, Economics (minor: Philosophy) — University of British Columbia Okanagan
*2014–2019*
- Coursework: econometrics, logic, decision theory, game theory.

---

## Skills

**Languages:** Python, C#, TypeScript, Rust
**ML / AI:** Embedding-space systems, LLM application development, world-model-grounded generation
**Infra:** GitHub Actions CI/CD, Azure DevOps, MediaWiki/Wikibase APIs, SPARQL, Playwright
**Databases:** Graph-vector hybrid, SPARQL endpoints
