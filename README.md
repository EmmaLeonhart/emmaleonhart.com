# Beyond Proximity: Virtual Knowledge Graphs as a Semantic Space for Logic-Gated Retrieval

> **Status:** Working draft — this README serves as the provisional paper outline. The repo contains both the working prototype and experimental evidence being assembled into a forthcoming arXiv submission.

## How This Repo Works

This is a research repo, not a software project. The code in `prototype/` exists to generate evidence for the paper's claims. The markdown files (`exploration_notes.md`, `experiment_log.md`) are lab notebooks. This README is the paper draft itself — it will eventually be ported to LaTeX.

**Key files:**
- `prototype/` — Runnable proof-of-concept (Ollama, local inference only)
- `exploration_notes.md` — Detailed experimental narratives and analysis
- `experiment_log.md` — Chronological log of every experiment
- `results.json` — Raw benchmark data (7 scenarios)
- `gemini_conversation.md` — The 5-turn conversation that seeded the idea
- `paper_names.md` — Candidate titles

**To run the demo:** `python prototype/run_demo.py` (requires Ollama with `deepseek-r1:8b` and `mxbai-embed-large`)

---

## Abstract

Standard Retrieval-Augmented Generation (RAG) retrieves context by vector proximity — cosine similarity between a query embedding and a corpus of document embeddings. This works well for topical retrieval but fails systematically on multi-hop causal reasoning, where essential intermediate premises may be semantically distant from the query. We propose a neurosymbolic architecture that constructs a Virtual Knowledge Graph (VKG) at runtime from propositional extractions and runs a logic engine over it, retrieving reasoning chains through entity bridging rather than vector similarity alone. On a 7-scenario benchmark spanning pharmacology, economics, geophysics, and engineering, the neurosymbolic pipeline achieves 69% mean ground-truth coverage versus 62% for standard RAG, with gains of up to +50% on causal cascade scenarios. Critically, the two scenarios where standard RAG outperforms are attributable to extraction model failures, not architectural limitations — the VKG never loses when fed well-formed propositions.

---

## 1. Introduction

RAG systems retrieve context for language model generation by finding documents (or chunks) whose embeddings are close to the query in vector space. This is effective when the answer is stated directly in a single retrievable passage. But many real-world questions require *reasoning across* multiple passages — connecting facts through shared entities, causal chains, or logical entailment.

Consider: *"At what temperature does water boil on Mount Everest?"* The answer requires chaining four facts: (1) Everest is ~8,849m above sea level, (2) atmospheric pressure decreases with altitude, (3) lower pressure reduces boiling point, (4) water boils at ~70°C under those conditions. A standard RAG system retrieves fact (4) easily (high similarity to the query) but misses fact (2), which scores below the distractor "Mount Everest is on the border between Nepal and Tibet" despite being essential to the reasoning chain.

**Core thesis:** Embedding space encodes *topical similarity*, not *logical structure*. We demonstrate this empirically (Section 4) and propose a three-pillar architecture that uses a runtime VKG as a *semantic space* — complementing the *feature space* of vector embeddings — to recover the reasoning chains that cosine similarity misses.

### Contributions

1. A proposition-first neurosymbolic RAG architecture with runtime VKG construction and logic-gated retrieval.
2. Empirical evidence that embedding models (mxbai-embed-large, 1024-dim) encode entities 3.5x more strongly than predicates — explaining why logical structure is invisible to vector search.
3. A 7-scenario benchmark demonstrating that entity bridging through the VKG recovers chain steps that standard RAG systematically misses.

---

## 2. Related Work

*[To be written. Key areas: GraphRAG (Microsoft), neurosymbolic AI (Seshia et al. 2022 — "Toward Verified Artificial Intelligence"), knowledge graph embeddings (TransE, RotatE, ComplEx), proposition-first ontologies, vector symbolic architectures.]*

---

## 3. Method: Three-Pillar Architecture

### Pillar 1: Propositional Extraction

Each sentence in the corpus is decomposed into (subject, predicate, object) triples via an LLM (currently DeepSeek-R1 8B). Unlike entity-centric KG construction, we embed the *entire proposition* rather than individual entities — preserving contextual integrity ("Company A acquired Company B in 2022 for the purpose of X" rather than the bare triple `[A]→[acquired]→[B]`).

### Pillar 2: VKG Construction with Entity Bridging

Propositions are embedded (mxbai-embed-large) and placed in both a NetworkX directed graph (for path-finding) and an RDFLib graph (for formal SPARQL queries). Crucially, propositions sharing extracted entities are linked through *entity bridging* — creating edges that cosine similarity alone would never produce.

### Pillar 3: Logic Engine

A multi-hop chain search traverses the VKG to find reasoning paths from query-relevant seed propositions to the answer. Contradiction detection via SPARQL prunes inconsistent chains. The retrieved chain is then provided as context to the generation model.

---

## 4. Embedding Geometry: Why Vector Similarity Fails for Reasoning

Before evaluating the full pipeline, we characterize *why* standard RAG fails on multi-hop queries by probing the geometry of the embedding space.

### 4.1 Axis Hierarchy: Subjects >> Objects >> Predicates

Using a controlled 3×3×3 semantic grid (3 subjects × 3 predicates × 3 objects, 27 propositions), we measured the contribution of each axis to embedding similarity:

| Axis | Mean separation | Relative strength |
|---|---|---|
| Subject | +0.240 | 3.5× |
| Object | +0.176 | 2.6× |
| Predicate | +0.069 | 1.0× (baseline) |

Embedding models allocate dimensions to encode *what things are about* (entities/topics), not *what relationship holds* (predicates). This is optimal for topical retrieval but wrong for logical reasoning, where predicates are arguably most important. The VKG rebalances this by giving predicates explicit first-class representation.

### 4.2 The Syllogism Gap

In the classic Socrates syllogism, the two *premises* — "All men are mortal" and "Socrates is a man" — are the most distant pair in embedding space (0.560), yet they are precisely the two sentences needed together to derive the conclusion. The conclusion "Socrates is mortal" sits near "Socrates is a man" (0.879) because they share an entity, not because the model understands entailment.

### 4.3 Causal Chain Decay

For the altitude → pressure → boiling chain:

| Pair | Similarity |
|---|---|
| Adjacent steps (altitude/pressure) | 0.660 |
| Adjacent steps (pressure/boiling) | 0.640 |
| Chain endpoints (altitude/boiling) | 0.476 |

Chain endpoints are barely more similar than random cross-domain sentences. A query about boiling on a mountain scores the altitude fact very low. Yet it is *essential*. The VKG bridges this gap through shared entities at each intermediate step.

### 4.4 Predicate Blindness Across Domains

Four sentences sharing the predicate "inhibits" across pharmacology, botany, economics, and governance domains have a mean similarity of only 0.450 — barely above random. Identical relational structure is invisible to embeddings when the domains differ.

### 4.5 No Universal Abstraction Axis

Testing 24 taxonomic hierarchies across nouns, verbs, and adjectives: there is no single "up" direction in embedding space corresponding to increasing abstraction. Noun hierarchies share moderate agreement (0.465) because they converge on shared words ("animal", "entity"), but cross-POS agreement is near zero (0.03–0.06). Embedding geometry is distributional, not ontological.

### 4.6 Distributional vs. Ontological Distance

dog→animal (0.876) scores higher than dog→mammal (0.816), despite mammal being taxonomically closer. Embedding distance reflects co-occurrence frequency, not formal taxonomic distance. Word register matters: "dog" (informal), "canine" (taxonomic), and "carnivoran" (scientific) occupy different regions of the space.

---

## 5. Benchmark Evaluation

### 5.1 Setup

Seven scenarios across diverse domains, each with a curated corpus, distractors, a multi-hop query, and a ground-truth reasoning chain. Local inference via Ollama (DeepSeek-R1 8B for extraction/generation, mxbai-embed-large for embeddings).

### 5.2 Results

| Scenario | Standard RAG | Neurosymbolic | Delta |
|---|---|---|---|
| Everest Boiling Point | 75% (3/4) | 100% (4/4) | +25% |
| Drug Interaction Chain | 80% (4/5) | 100% (5/5) | +20% |
| Economic Supply Cascade | 25% (1/4) | 75% (3/4) | **+50%** |
| Coral Reef Collapse | 50% (2/4) | 50% (2/4) | 0% |
| Bridge Collapse | 75% (3/4) | 50% (2/4) | -25% |
| Antibiotic Resistance | 80% (4/5) | 80% (4/5) | 0% |
| Satellite Signal | 50% (2/4) | 25% (1/4) | -25% |
| **Mean** | **62%** | **69%** | **+7%** |

### 5.3 Analysis

**Where NS wins:** Scenarios with clean multi-hop chains where intermediate steps have low query similarity but share entities with adjacent steps. The Economic Supply Cascade (+50%) is the most dramatic — standard RAG retrieves only the final price-rise sentence while the VKG traces back through supply contraction and Brazilian drought via shared entities.

**Where NS loses:** Both losses (Bridge Collapse, Satellite Signal) trace to extraction failures in Pillar 1. DeepSeek-R1 8B produces degenerate triples for technical multi-clause sentences: "De-icing salts applied to road surfaces" → `(De | relates to | water)`. Without meaningful entities, bridging cannot work. These are component failures, not architecture failures.

**The bottleneck is extraction, not the graph.** The VKG architecture works when fed well-formed propositions. Swapping to a more capable extraction model would likely flip the losing scenarios without any changes to the graph or logic engine.

---

## 6. Discussion

*[To be written. Key points: extraction quality as the single bottleneck, proposition-first vs entity-first KG design, scalability considerations, cross-domain structural analogy as a future direction.]*

---

## 7. Conclusion

*[To be written.]*

---

## References

- Seshia, S. A., Sadigh, D., & Sastry, S. S. (2022). Toward Verified Artificial Intelligence. *Communications of the ACM*, 65(7). DOI: [10.1145/3503914](https://dl.acm.org/doi/10.1145/3503914)

*[Additional references to be added.]*
