# Experiment Log

Chronological record of every experiment run in this project. Each entry records what was run, key findings, and paths to artifacts.

---

## Experiment 1: 7-Scenario Benchmark Suite

**Date:** 2026-03-06
**Script:** `python prototype/benchmark.py --save-json results.json`
**Duration:** ~49 minutes (2916s wall time)
**Hardware:** Local Ollama, deepseek-r1:8b + mxbai-embed-large

**What:** Ran both Standard RAG and Neurosymbolic RAG across 7 scenarios (physics, pharmacology, supply chain, environmental science, engineering, microbiology, solar physics), each with 12-14 corpus sentences including designed distractors.

**Key findings:**
- NS wins 3/7 (everest +25%, drug +20%, economic +50%), ties 2/7, loses 2/7
- Mean coverage: Std 62% vs NS 69% (+6% delta)
- NS wins come from entity bridging recovering low-similarity chain steps
- NS losses trace to extraction model (deepseek-r1:8b) producing degenerate triples on technical sentences
- 16.9x time overhead (mostly extraction LLM calls)

**Artifacts:**
- `results.json` — Full per-scenario metrics
- `exploration_notes.md` §1 — Narrative analysis

---

## Experiment 2: Embedding Geometry — 5 Proposition Families

**Date:** 2026-03-06
**Script:** `python prototype/explore_embeddings.py`
**Duration:** ~30 seconds

**What:** Embedded 5 families of propositions with mxbai-embed-large (1024-dim) to understand how embedding space encodes semantic relationships. Families: "X are cute" (5 variants), Socrates syllogism (3), Robin syllogism (3), causal chain (3), "X inhibits Y" (4).

**Key findings:**
- Near-synonyms (Dogs/Canines) cluster at 0.976 — embedding space handles lexical substitution well
- Syllogism premises are far apart (0.560 for Socrates) — the logical bridge is the weakest link in embedding space
- Causal chain endpoints (0.476) are barely above noise — confirms multi-hop retrieval gap
- Shared predicate ("inhibits") gives only 0.450 mean similarity — embeddings encode domain content, not relational structure
- Subject overlap drives similarity more than predicate or object overlap

**Artifacts:**
- `prototype/embeddings_exploration.npz` — Raw 1024-dim vectors for all 18 propositions
- `prototype/embeddings_exploration.json` — Pairwise similarity matrices
- `exploration_notes.md` §2 — Full interpretation

---

## Experiment 3: Semantic Grid — Subject/Predicate/Object Axis Isolation

**Date:** 2026-03-06
**Script:** `python prototype/semantic_grid.py`

**What:** Systematic 3x3x3 grid of 27 propositions formed by crossing 3 subjects × 3 predicates × 3 objects, using maximally unambiguous concrete nouns and clear action verbs. Goal: isolate how much each semantic role (S, P, O) contributes to embedding distance.

**Grid:** 3 subjects (cats, trucks, children) × 3 predicates (eat, carry, watch) × 3 objects (fish, rocks, stars) = 27 propositions.

**Key findings:**
- Subject is the strongest axis: sharing a subject gives +0.240 separation (same=0.702 vs diff=0.462)
- Object is second: +0.176 separation (same=0.658 vs diff=0.482)
- Predicate is weakest by far: +0.069 separation (same=0.583 vs diff=0.515)
- Hierarchy: subject (3.5x) > object (2.6x) > predicate (1.0x) in pull strength
- Joint analysis: 0 shared axes → 0.361 mean, 1 shared → 0.546, 2 shared → 0.750
- Per-value: "trucks" pulls hardest among subjects (+0.267), "children" weakest (+0.201)
- Predicates are nearly interchangeable in embedding space (all ~0.07 pull)
- Most similar: "Trucks carry stars" / "Trucks watch stars" = 0.915 (subject+object shared, predicate differs)
- Least similar: "Cats eat fish" / "Children watch stars" = 0.247 (nothing shared)

**Artifacts:**
- `prototype/semantic_grid_results.json` — Full analysis with similarity matrix
- `prototype/semantic_grid_results_embeddings.npz` — Raw 1024-dim vectors for all 27 propositions

---

## Experiment 4: Verb Structure — Predicate Directional Consistency

**Date:** 2026-03-06
**Script:** `python prototype/verb_structure.py`
**Duration:** <1 second (reuses grid embeddings)

**What:** Deep analysis of predicate effects on embeddings. Four analyses: (1) verb displacement vector consistency across S/O contexts, (2) verb-conditioned subspace correlation, (3) naturalness/selectional preference encoding, (4) S×P and P×O interaction effects.

**Key findings:**
- Verb displacements ARE directionally consistent: eat→carry has 0.671 mean pairwise cosine of displacement vectors, 0.841 alignment to mean direction
- Displacement consistency is higher when subject is shared (0.769) vs neither shared (0.601)
- Verb-conditioned subspace geometry is nearly identical: Pearson r=0.958 between eat and carry internal structures
- Verbs translate the S/O cluster without deforming it
- Naturalness not encoded: overall correlation r=-0.031 between hand-labeled naturalness and centroid distance
- S×P and P×O interaction effects are minimal (all 0.70-0.77)
- Compositionality is real but lopsided: S + P + O combine approximately additively with unequal weights

**Artifacts:**
- `prototype/verb_structure.py` — Analysis script
- `prototype/verb_structure_results.json` — Full results
- `exploration_notes.md` §3c — Narrative interpretation
