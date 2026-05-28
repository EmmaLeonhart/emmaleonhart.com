# Emma Leonhart

Kelowna, BC · contact@emmaleonhart.com
[GitHub](https://github.com/EmmaLeonhart) · [emmaleonhart.com](https://emmaleonhart.com)

---

## Summary

Software engineer who designs and builds languages, systems, and operating-system
infrastructure for AI. I work agent-first and high-output: most of what is below is
built by driving AI coding agents inside my own scaffolding (cleanvibe), with the
judgment to know when to take the wheel. My current focus is Yantra, a neuro-symbolic
GPU-native operating system written in my own language Sutra. I move fast across the
stack, from a PyTorch-targeting compiler to a GPU bootloader to reproducible analysis
that surfaces real production bugs, and everything runs from a clean clone.

---

## Selected Projects

### [Yantra](https://yantra.emmaleonhart.com): neuro-symbolic, GPU-native operating system · [GitHub](https://github.com/EmmaLeonhart/Yantra)
An operating system written in Sutra where the whole running system (kernel,
processes, IPC, GUI) is one differentiable tensor-op graph, and a small CPU exists
only to boot and orchestrate the GPU. Processes exchange axons (structured
embeddings), so a local AI model integrates with no translation layer. Built so far:
a v0.0 kernel (Python orchestration with real Sutra compute on torch tensors, around
48 passing tests), real disc-to-GPU storage-tier moves on an RTX 4070, a v0.4
bootloader verified in QEMU (multiboot entry, PCI enumeration, GPU framebuffer
writes, long-mode transition), and a live calculator demo running exact arithmetic
and multi-term expressions end-to-end through the Sutra substrate, with a
text-symbol fidelity harness that round-trips 1,024 lines bit-exact through the
kernel. Target market: critical systems (defense, aerospace, medical, autonomous)
where predictable latency and a readable verification surface matter more than
mass-market compatibility.

### [Sutra](https://sutra.emmaleonhart.com): geometric tensor language and compiler · [GitHub](https://github.com/EmmaLeonhart/Sutra)
A typed language where logical and vector operations compile to fused PyTorch tensor
ops: GPU-native and differentiable, with no control flow (branches are continuous
weighted blends, loops are geometric rotations). Reference compiler, IntelliJ and VS
Code plugins, a language specification, a TypeScript-to-Sutra transpiler with a wired
CLI, and a SKILL file that walks a coding agent through reproducing the paper's
results step by step, each step pass/fail gated. Paper: [arXiv:2605.20919](https://arxiv.org/abs/2605.20919).
Sutra is the substrate Yantra runs on.

### [Loka](https://loka.emmaleonhart.com): RDF-star triplestore with native vector indexing · [GitHub](https://github.com/EmmaLeonhart/Loka)
A lean Rust triplestore with native HNSW vector indexing and temporal queries, where
vectors are just triples, replacing both a vector database and a SPARQL triplestore
in one system. Built as a generative knowledge graph: it uses a local AI model to
predict adjacent facts and add them to the graph as new triples. The latest training
checkpoint v14 (perplexity 202.01, trained on 1M normalized-Wikidata triples) is
published on [HuggingFace](https://huggingface.co/EmmaLeonhart/loka). Supports
cascade-retraction: remove a node and every generated inference that transitively
cited it, scoped by RDF-star provenance edges.

### [Latent Space Cartography](https://latent-space.emmaleonhart.com): embedding measurement · [GitHub](https://github.com/EmmaLeonhart/latent-space-cartography)
Reproducible analysis of frozen text embeddings using Wikidata triples as probes.
Surfaced a silent production tokenizer defect in mxbai-embed-large (unrelated
diacritical strings collapse to cosine 1.0), bisected to a single Ollama release
across 21 versions in CI, with a reproducible script that demonstrates the collision.

### [cleanvibe](https://github.com/EmmaLeonhart/cleanvibe): agentic coding scaffold · [GitHub](https://github.com/EmmaLeonhart/cleanvibe)
A zero-dependency Python CLI that scaffolds AI-assisted projects: it injects an
opinionated CLAUDE.md contract plus queue, todo, and devlog conventions so an agent
starts structured and stays on-task and self-documenting across long, multi-session
work. This is the environment the rest of these projects are built inside.

### [QueryKey](https://github.com/EmmaLeonhart/querykey): local-first relationship and life manager · [GitHub](https://github.com/EmmaLeonhart/querykey)
A markdown-as-source-of-truth PRM and life-management system. Markdown files in a
git-tracked vault are the data, an Electron desktop app is the UI, a Rust server
handles search and indexing. Working surfaces include Profile, Calendar, and Wiki
views. Saves are git-committed locally; peer-to-peer by design.

---

## Experience

### AI Engineer, ManuForge AI
*March 2026–present*
- Built a world-modelling system for short stories that uses position in the text to
  establish known unknowns at each point, surfacing them so an author can make
  deliberate choices. Intended as input to a chronological-world-state-driven
  text-to-video pipeline (in progress).

### Developer, Ambient Games
*2024–2025*
- Shipped on *Schema* (video game) across the .NET ecosystem (C#) with CI/CD in Azure
  DevOps; integrated Ollama for in-game local LLM conversation.

### Wikimedia / Wikidata Contributor (independent)
*2025–present*
- Python automation against MediaWiki and Wikibase APIs: SPARQL-driven batch edits on
  Wikidata at scale (cleanup, qualifiers, references), plus Playwright entry
  automation.

---

## Education

**Associates of Computer Science**, Okanagan College, 2020–2023.
**BA, Economics (minor: Philosophy)**, University of British Columbia Okanagan,
2014–2019. Coursework: econometrics, logic, decision theory, game theory.

---

## Skills

**Languages:** Rust, C#, Python, TypeScript.
**AI / ML:** embedding-space systems, neuro-symbolic architectures, agentic coding
workflows, LLM application development.
**Systems / infra:** GPU-native compilation, OS and bootloader internals, RDF-star,
HNSW, SPARQL, Electron, GitHub Actions CI/CD, Azure DevOps, MediaWiki / Wikibase,
Playwright, HuggingFace model publishing.
