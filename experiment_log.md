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

---

## Experiment 5: Word Isolation & Taxonomic Jitter

**Date:** 2026-03-06
**Script:** `python prototype/word_isolation.py`
**Duration:** ~60 seconds

**What:** Four-part analysis. (1) Grid words embedded in isolation to compare word-level vs proposition-level similarity. (2) Taxonomic hierarchies (dog→hound→canine→mammal→animal→creature, plus fish, rock, verb synonyms) embedded in isolation. (3) Jitter: substitute hierarchy words into proposition templates and measure whether word-level distance predicts sentence-level distance. (4) Convergence: do dog→animal and cat→animal converge at shared superclasses?

**Key findings:**

*Part 1 — Isolated grid words:*
- Within-role similarity: predicates (0.639) > objects (0.618) > subjects (0.545)
- This REVERSES the proposition-level hierarchy (subjects strongest in propositions)
- Predicates are more similar to each other as bare words, yet weakest in proposition pull
- "eat" and "fish" have highest cross-role similarity (0.708) — strong collocational association

*Part 2 — Taxonomic hierarchies:*
- dog/canine: 0.947 (near-synonyms, highest in any hierarchy)
- cat/feline: 0.923 (also near-synonyms)
- Adjacent hierarchy steps: mean ~0.82 (animals), ~0.72 (objects)
- Endpoints: puppy→creature 0.619, trout→thing 0.506 (clear taxonomic decay)
- Verb synonyms: eat family (0.741) > watch family (0.718) > carry family (0.653)

*Part 3 — Jitter in propositions:*
- Word↔sentence correlation is HIGH: subject jitter r=0.91, predicate r=0.92, object r=0.76
- Context compresses distances: predicate jitter most compressed (0.16-0.63), subject least (0.49-0.66)
- Predicate synonyms in context are almost invisible: "Cats eat fish" vs "Cats devour fish" = 0.965, "Cats munch fish" = 0.925 — all >0.92
- Subject hierarchy preserves relative ordering in all 3 templates (r>0.86)

*Part 4 — Hierarchy convergence:*
- dog→animal (0.876) vs cat→animal (0.769): dogs closer to "animal" than cats
- creature↔thing: 0.738 — near-universal hypernyms converge
- dog↔cat at base level: 0.691, but at mammal level: 1.000 (shared word), at animal level: also 1.000
- Convergence is literal (shared words) not graduated — the model doesn't smoothly merge unrelated hierarchies

*Part 5 — Distributional vs Ontological Semantics (qualitative finding):*
- dog→animal (0.876) > dog→mammal (0.816) despite mammal being taxonomically closer
- Embedding distance reflects word co-occurrence frequency, not formal taxonomic distance
- Words carry register baggage: "dog"/"cat" (informal) vs "feline"/"canine" (taxonomic) vs "carnivoran" (scientific)
- Hierarchy convergence is literal (shared word = 1.000) not graduated
- This reinforces the VKG's role: give predicates first-class representation that the embedding space systematically under-allocates

**Artifacts:**
- `prototype/word_isolation.py` — Full analysis script
- `prototype/word_isolation_results.json` — All numerical results
- `exploration_notes.md` §3d — Distributional vs ontological semantics analysis

---

## Experiment 6: Taxonomic Direction — Universal "Up" in Embedding Space

**Date:** 2026-03-06
**Script:** `python prototype/taxonomic_direction.py`
**Duration:** ~60 seconds

**What:** Tested whether there is a consistent "upward" displacement vector when moving from specific→general along taxonomic hierarchies. 24 hierarchies (10 nouns, 10 verbs, 4 adjectives), 111 unique words. Five analyses: within-hierarchy displacement consistency, cross-hierarchy direction comparison, cross-POS alignment, abstraction-level clustering, and distance decay monotonicity.

**Key findings:**

*1. Within-hierarchy "up" is barely consistent:*
- Mean alignment to own mean direction: nouns 0.24, verbs 0.23, adj 0.33
- Pairwise step consistency near zero or negative for all POS types
- First and last steps most aligned; middle steps chaotic

*2. Nouns share more "up" direction than verbs:*
- Noun × Noun: 0.465 (dog↔horse: 0.696, dog↔cat: 0.677)
- Verb × Verb: 0.381 (eat↔devour: 0.557, eat↔listen: 0.292)
- Adj × Adj: 0.057 (essentially zero)
- Cross-POS: 0.03-0.06 (no universal abstraction axis)

*3. Distance decay is non-monotonic:*
- Only 4/24 hierarchies show monotonic decay from origin
- Nouns: 3/10 monotonic (16 violations), Verbs: 1/10 (14), Adj: 0/4 (4)
- Violations follow the distributional pattern: casual words bounce back, technical terms dip
- puppy→canine (0.856) > hound (0.723); puppy→animal (0.745) > mammal (0.676)

*4. Verb hierarchies are genuinely messier:*
- Lower cross-hierarchy agreement (0.381 vs nouns' 0.465)
- More violations of monotonic decay
- Confirms user's intuition that verbs are less taxonomically organized

*5. Same-level words do NOT cluster:*
- Within-level sim (0.553-0.585) ≈ cross-level sim (0.558-0.580)
- No abstraction-level clustering exists in embedding space

*6. Global "up" = noun abstraction direction:*
- Global magnitude: 0.456
- Nouns align at 0.541, verbs at 0.480, adj at 0.181
- The "global up" is dominated by noun hierarchies sharing upper levels

**Artifacts:**
- `prototype/taxonomic_direction.py` — Full analysis script
- `prototype/taxonomic_direction_results.json` — All numerical results
- `prototype/taxonomic_direction_embeddings.npz` — Raw 1024-dim vectors for 111 words
- `prototype/taxonomic_direction_vectors.npz` — Mean "up" direction for each hierarchy
- `exploration_notes.md` §3e — Full narrative analysis

---

## Experiment 7: Linnaean Taxonomy — Does Consistent Register Fix Monotonicity?

**Date:** 2026-03-07
**Script:** `python prototype/linnaean_hierarchy.py`
**Duration:** ~60 seconds

**What:** Tested whether using purely formal Linnaean taxonomy (Canis lupus familiaris → Canis → Canidae → Carnivora → Mammalia → Vertebrata → Chordata → Animalia → Eukaryota) produces monotonic distance decay, unlike the mixed-register hierarchies in Experiment 6. 10 Linnaean hierarchies (dog, cat, human, horse, trout, sparrow, fruit fly, E. coli, oak, yeast) plus 6 common-English comparison hierarchies. 55 unique Linnaean terms + 27 common terms.

**Key findings:**

*1. Linnaean names are also non-monotonic:*
- Only 1/10 monotonic (bread yeast), 19 total violations
- Common English: 0/6 monotonic, 18 violations
- Register consistency does NOT fix the fundamental problem

*2. The "Animalia bounce" is universal:*
- Every animal hierarchy shows Vertebrata < Chordata < Animalia
- "Animalia" co-occurs with species names far more than "Chordata" does
- E. coli extreme: Bacteria (0.806) closer to origin than Enterobacterales (0.567)

*3. Head-to-head (same organisms):*
- Linnaean names produce fewer violations for mammals (2 vs 4 for dog/cat/human)
- But house sparrow is worse in Linnaean (3 vs 1) — Passeridae bounces above Passer
- Neither register is reliably monotonic

*4. Convergence is still literal:*
- Canidae ↔ Felidae = 0.785, then instant 1.000 at shared Carnivora
- Carnivora ↔ Primates = 0.553, then instant 1.000 at Mammalia
- No gradual merging even in formal taxonomy

*5. Cross-hierarchy "up" direction:*
- Linnaean cross-hierarchy: 0.360 (lower than common English 0.465)
- Eukaryotes only: 0.426
- Lower because Linnaean hierarchies diverge earlier (different phyla/kingdoms)

**Artifacts:**
- `prototype/linnaean_hierarchy.py` — Full analysis script
- `prototype/linnaean_hierarchy_results.json` — All numerical results
- `prototype/linnaean_hierarchy_embeddings.npz` — Raw 1024-dim vectors for all terms
- `exploration_notes.md` §3f — Full narrative analysis

---

## Experiment 8: Large-Scale Replication — 8×8×8 Semantic Grid

**Date:** 2026-03-08
**Script:** `python prototype/semantic_grid_large.py`
**Duration:** ~2 minutes

**What:** Scaled-up replication of the 3×3×3 semantic grid with 8 subjects × 8 predicates × 8 objects = 512 propositions (vs 27 original). 130,816 pairwise comparisons. Same analysis framework: axis contribution, joint analysis, per-value pull, extreme pairs.

**Key findings:**
- **S > O > P hierarchy CONFIRMED:** Subject +0.249, Object +0.186, Predicate +0.113
- Ratios shifted from 3.5x/2.6x/1.0x to 2.2x/1.6x/1.0x — predicate contribution stronger with more diverse verbs
- Joint staircase replicated: 0-shared=0.381, 1-shared=0.565, 2-shared=0.766 (original: 0.361, 0.546, 0.750)
- New axis combination analysis: SO (0.835) > SP (0.762) > PO (0.702) — sharing subject+object is strongest
- "Whales" pulls hardest among subjects (+0.310), "paint" pulls hardest among predicates (+0.167)
- Carry/collect near-synonymy confirmed: "Trucks carry shadows" vs "Trucks collect shadows" = 0.965

**Artifacts:**
- `prototype/semantic_grid_large_results.json`
- `prototype/semantic_grid_large_results_embeddings.npz`

---

## Experiment 9: Large-Scale Replication — Verb Structure (8×8×8)

**Date:** 2026-03-08
**Script:** `python prototype/verb_structure_large.py`
**Duration:** <1 second (reuses grid embeddings)

**What:** Verb displacement, subspace correlation, and interaction analysis using 8×8×8 grid. 28 verb pairs (vs 3), 64 S/O contexts each (vs 9). Naturalness omitted (512 hand-labels impractical; original finding r=-0.031 showed no signal).

**Key findings:**
- **Verb displacement consistency CONFIRMED:** Mean pairwise cosine 0.725 (original 0.671), mean alignment 0.853 (original 0.841)
- Same-subject displacements more consistent (0.80) than same-object (0.81) and neither (0.72) — context still helps
- **Subspace geometry nearly identical across verbs:** Mean cross-verb Pearson r=0.939 (original 0.958). Range [0.894, 0.976] — all verb pairs
- paint→hide has highest displacement consistency (0.801), carry→watch lowest (0.638)
- S×P interaction range [0.686, 0.841] std=0.029 — minimal interaction, confirming approximate additivity

**Artifacts:**
- `prototype/verb_structure_large_results.json`

---

## Experiment 10: Large-Scale Replication — Word Isolation

**Date:** 2026-03-08
**Script:** `python prototype/word_isolation_large.py`
**Duration:** ~2 minutes

**What:** Expanded from 7 to 15 taxonomic hierarchies (8 noun + 7 verb synonym), 24 grid words, 24 jitter templates (vs 9). Tests whether the within-role similarity reversal and context compression hold at scale.

**Key findings:**
- **Within-role reversal CONFIRMED:** predicates (0.614) > objects (0.589) > subjects (0.523) in isolation — exactly reversed from proposition-level
- **Jitter correlation by role:** subject r=0.909 (original 0.91), predicate r=0.215 (original 0.92!), object r=0.720 (original 0.76)
- **Major finding:** Predicate jitter correlation DROPPED dramatically (0.92→0.22) with more diverse verbs. The original eat/consume/devour synonyms were too similar; with the full eat/consume/devour/ingest/munch/dine/feast set across 8 different S/O contexts, predicate substitution is nearly invisible to embeddings (most sentences >0.85 similarity regardless of verb choice)
- "Eat" ↔ "fish" collocational association (0.708) is the strongest cross-role pair, confirming distributional encoding
- Convergence remains literal: shared superclass words = 1.000, non-shared neighbors = ~0.55

**Artifacts:**
- `prototype/word_isolation_large_results.json`

---

## Experiment 11: Large-Scale Replication — Taxonomic Direction (50 hierarchies)

**Date:** 2026-03-08
**Script:** `python prototype/taxonomic_direction_large.py`
**Duration:** ~2 minutes

**What:** Expanded from 24 to 50 hierarchies (20 noun, 20 verb, 10 adjective), 218 unique words. Tests the "no universal abstraction axis" finding with 2× more data.

**Key findings:**
- **No universal abstraction axis CONFIRMED:** Cross-POS agreement near zero (noun×verb=0.057, adj×noun=0.022, adj×verb=0.029)
- Noun within-group: 0.476 (original 0.465), Verb: 0.408 (original 0.381), Adj: 0.157 (original 0.057)
- Adjective "up" direction increased significantly (0.057→0.157) with more hierarchies — some adjective pairs share "perceptible" at the top
- Global up magnitude: 0.431 (original 0.456) — slightly lower with more diverse hierarchies
- Only 6/50 hierarchies monotonic (3 noun, 2 verb, 1 adj) — 12% rate, consistent with original (4/24 = 17%)
- Same-level words still DON'T cluster: within-bin sim ≈ cross-bin sim (0.552-0.572 vs 0.553-0.565)

**Artifacts:**
- `prototype/taxonomic_direction_large_results.json`
- `prototype/taxonomic_direction_large_embeddings.npz`
- `prototype/taxonomic_direction_large_vectors.npz`

---

## Experiment 12: Large-Scale Replication — Linnaean Hierarchy (20+15 organisms)

**Date:** 2026-03-08
**Script:** `python prototype/linnaean_hierarchy_large.py`
**Duration:** ~2 minutes

**What:** Expanded from 10 Linnaean + 6 common to 20 Linnaean + 15 common name hierarchies. Added elephant, dolphin, eagle, cobra, blue whale, bee, wheat, rose, panda, crocodile.

**Key findings:**
- **Non-monotonicity CONFIRMED at scale:** Linnaean 1/20 monotonic (39 violations), Common 0/15 monotonic (45 violations)
- Violation rate stable: Linnaean 1.95/hierarchy (original 1.9), Common 3.0/hierarchy (original 3.0)
- Common names consistently worse: 45 violations vs 39 for Linnaean, confirming register mixing adds noise
- Cross-hierarchy "up" direction: Linnaean all=0.382 (original 0.360), Eukaryotes=0.416 (original 0.426)
- New convergence pairs confirm literal pattern: blue whale vs bottlenose dolphin species sim=0.427, both Cetacea shared → instant 1.000
- Honey bee vs fruit fly have highest species-level cross-species sim (0.698) — both common model organisms in biology literature (distributional!)

**Artifacts:**
- `prototype/linnaean_hierarchy_large_results.json`
- `prototype/linnaean_hierarchy_large_embeddings.npz`

---

## Experiment 13: Semantic Loadedness 2D Visualization

**Date:** 2026-03-08
**Script:** `python prototype/semantic_loadedness_viz.py`
**Duration:** ~1 minute

**What:** 2D projection of 38 words and phrases onto two interpretable axes: (1) gender direction = normalize(v_woman − v_man), (2) "is cute" transformation = average displacement from bare nouns to "The X is cute" propositions. Tests whether the resulting 2D plane reveals a semantic loadedness spectrum from underloaded (generic) through neurosymbolic (structured) to overloaded (dense).

**Key findings:**
- **Axis orthogonality:** dot product = 0.15 — reasonably independent axes
- **Gender axis separates cleanly:** man (-0.44) vs woman (+0.44), all male terms negative, all female terms positive, neutral/abstract near zero
- **"Is cute" axis reveals loadedness spectrum:**
  - Explicit "X is cute" propositions highest (0.26–0.28) — the transformation direction itself scores highest
  - Cute animals (puppy, kitten, duckling) cluster mid-right (-0.05 to -0.09) — semantically associated but not syntactically loaded
  - Neutral/abstract words far left (-0.27 to -0.41) — minimal cuteness content
  - Complex propositions land mid-range (-0.13 to -0.17) — dense but not along the "cute" direction
- **Interesting patterns:**
  - "teddy bear" is the highest single word on the cute axis (0.049) — the only bare noun above zero
  - "salt" is the lowest (-0.41) — maximally generic/underloaded
  - King and queen show the gendered split: king (-0.39, -0.19) vs queen (-0.33, +0.11) — queen slightly more "cute-loaded" and female
  - Girl/princess cluster together at (-0.17, +0.19) — nearly identical position, confirming distributional similarity
- **The "transformation" itself is the strongest signal:** "The kitten is cute" (0.28) vs bare "kitten" (-0.08) — the act of embedding the proposition shifts dramatically along its own axis

**Artifacts:**
- `prototype/semantic_loadedness_results.json`
- `prototype/semantic_loadedness_plot.png`
- `prototype/semantic_loadedness_words_only.png`

---

## Experiment 14: Complexity Axes — Adjective vs. Predicate Topology

**Date:** 2026-03-08
**Script:** `python prototype/semantic_topology_complexity.py`
**Duration:** ~20 seconds (2,004 embeddings at 9.7ms/item)

**What:** Two dimensions of structural complexity using "Road" as origin. X-axis = normalize(embed("The Icy Road") - embed("Road")) captures adjective modification. Y-axis = normalize(embed("Roads are Great") - embed("Road")) captures predicate embedding. 500 most common nouns embedded in 4 forms: bare, "The Icy X" (adjective), "Xs are Great" (predicate), "Icy Xs are Great" (both). Tests whether adjective and predicate complexity are independent linear transformations and whether they compose additively.

**Key findings:**
- **Axis orthogonality:** dot = 0.274 — moderate correlation but reasonably independent
- **Clean four-quadrant separation:** bare nouns bottom-left, adjective variants bottom-right, predicate variants top-left, both top-right
- **Additivity is approximate:** "Icy Roads are Great" lands at (0.648, 0.526) vs additive prediction (0.720, 0.636) — 90% X, 83% Y
- **Mean category positions confirm separation:**
  - Bare: (0.159, 0.128) — bottom-left
  - Adjective: (0.663, 0.242) — rightward shift
  - Predicate: (0.220, 0.486) — upward shift
  - Both: (0.569, 0.464) — diagonal, sub-additive
- **RMS additivity error:** 0.228 — the combined transformation loses ~15-17% due to dimensional interference
- **Displacement arrows:** blue (adjective) points consistently right, red (predicate) points up, purple (both) points diagonally — confirming independent dimensions

**Artifacts:**
- `prototype/semantic_topology_complexity.py`
- `prototype/semantic_topology_complexity_results.json`
- `prototype/semantic_topology_complexity_full.png`
- `prototype/semantic_topology_complexity_heatmap.png`
- `prototype/semantic_topology_complexity_arrows.png`

---

## Experiment 15: Syllogism Gap — 20-Syllogism Systematic Test

**Date:** 2026-03-10
**Script:** `python prototype/syllogism_gap.py`
**Duration:** ~30 seconds (80 embeddings)

**What:** Systematic test of the "syllogism gap" claim (Section 4.2) across 20 diverse syllogisms. All follow the classical form: Universal(Class, Property) + Member(Individual, Class) → Property(Individual). Domains: biology (6), chemistry (2), geography (2), profession (2), philosophy, astronomy, geology, pharmacology, recreation, linguistics, music, computing. Six analyses: pairwise similarities, displacement vectors, cross-syllogism displacement consistency, within-domain vs cross-domain, individual name proximity, proper noun vs generic.

**Key findings:**

*1. Syllogism gap confirmed — 16/20 (80%):*
- P1↔P2 is the weakest pair in 16/20 syllogisms
- Mean similarities: P1↔P2=0.664, P1↔C=0.722, P2↔C=0.876
- The conclusion is ALWAYS closer to P2 (membership statement) than to P1 (universal)
- Socrates P1↔P2 = 0.560 — matches Experiment 2 exactly

*2. P2↔C is by far the strongest link:*
- Mean P2↔C = 0.876 (std 0.050) — the individual carries through
- Mean displacement |P2→C| = 0.488 — smallest displacement, confirming proximity
- Mean |P1→P2| = 0.817 — largest displacement (premises are far apart)

*3. No universal "apply universal" direction:*
- P2→C pairwise cosine = 0.054 — near zero cross-syllogism consistency
- P1→C slightly higher (0.293), P1→P2 moderate (0.252)
- Each syllogism's bridging operation is domain-specific, not a latent axis

*4. Domain effects are minimal:*
- Within-domain P2→C consistency: 0.075 vs cross-domain: 0.052 (delta +0.023)
- No strong domain clustering of displacement directions

*5. Names gravitate to P2 (16/20):*
- Mean Name↔P2 = 0.857 vs Name↔C = 0.819 vs Name↔P1 = 0.550
- The membership statement (P2) is essentially "X is a Y" — dominated by the individual name
- 4 cases closest to C: rex, johnson, chen, beethoven (conclusion also contains name)

*6. Proper nouns show LARGER gap than generics:*
- Proper noun gap (P2↔C − P1↔P2): +0.254, confirmed 10/10
- Generic term gap: +0.169, confirmed 10/10
- Proper nouns have lower P1↔P2 (0.641 vs 0.688) because they share less vocabulary with the universal

*4 exceptions (P1↔C weakest instead):*
- rex: P1↔P2 ≈ P1↔C (0.592 vs 0.592) — essentially tied
- johnson, chen: "All teachers/surgeons are educators/doctors" very close to "Ms. Johnson/Dr. Chen is an educator/doctor" because the profession words dominate
- beethoven: "All symphonies are musical compositions" ≈ "Beethoven's Fifth is a musical composition" — shared predicate phrase

**Artifacts:**
- `prototype/syllogism_gap.py` — Full analysis script
- `prototype/syllogism_gap_results.json` — All numerical results
- `prototype/syllogism_gap_embeddings.npz` — Raw 1024-dim vectors for 80 texts

---

## Experiment 15b: Syllogism Gap Grid — 10×10×10 Systematic Test

**Date:** 2026-03-10
**Script:** `python prototype/syllogism_gap_grid.py`
**Duration:** ~30 seconds (330 embeddings, 1000 syllogism combinations)

**What:** Rebuilt the syllogism gap test with a perfectly uniform template and full combinatorial grid. Template: "All {class_plural} are {adjective}" + "{member} is a {class_singular}" → "{member} is {adjective}". 10 unambiguous proper-noun members (Socrates, Aristotle, Einstein, Mozart, Shakespeare, Cleopatra, Darwin, Galileo, Confucius, Archimedes) × 10 classes (human, bird, cat, dog, flower, insect, reptile, mammal, vehicle, mineral) × 10 adjectives (mortal, beautiful, dangerous, ancient, fragile, powerful, mysterious, resilient, valuable, complex) = 1000 syllogisms. Only 300 unique sentences (P1 depends on class+adj, P2 on member+class, C on member+adj) + 30 bare words = 330 embeddings. Five analyses: gap rate, per-component breakdown, bare word pull, displacement consistency, shared component structural analysis.

**Key findings:**

*1. P2↔C is ALWAYS the strongest pair (1000/1000):*
- Mean P2↔C = 0.779, P1↔P2 = 0.572, P1↔C = 0.548
- P2↔C never weakest. P1↔C weakest 72.1%, P1↔P2 weakest 27.9%
- The universal premise (P1) is isolated from BOTH the membership statement AND the conclusion
- This is WORSE than the original claim: P1 is the retrieval blind spot

*2. The S > O > P hierarchy explains the gap completely:*
- P2↔C share member as SUBJECT in both → strongest (0.779)
- P1↔P2 share class, but in different syntactic roles (subject in P1, object in P2) → moderate (0.572)
- P1↔C share adjective as PREDICATE in both → weakest (0.548)
- Within-sentence pull: same subject Δ=+0.279, same object Δ=+0.144, same predicate Δ=+0.161
- Ratio: S=1.7x, O=0.9x, P=1.0x — subject dominance confirmed

*3. Bare word pull replicates S > O > P:*
- Member→P2/C (subject role): +0.342 mean pull
- Class→P1 (subject role): +0.244 pull
- Class→P2 (object role): +0.214 pull (same word, weaker in object position)
- Adjective→P1/C (predicate role): +0.220 pull
- The class word shows role-dependent pull: +0.244 as subject (P1) vs +0.214 as object (P2)

*4. Class "human" is the strongest gap (100% rate):*
- P1↔P2 = 0.482, P1↔C = 0.614, P2↔C = 0.853
- "All humans are {adj}" is maximally generic → lowest similarity to member statements
- "mineral" and "flower" have near-zero gap rate (1%) — these domain-specific words pull P1↔P2 together

*5. Displacement directions are NOT universal:*
- P2→C pairwise cosine = 0.197 — low cross-syllogism consistency
- But conditioning on shared adjective raises to 0.580, shared class to 0.550
- Each syllogism's bridge is shaped by its specific content, not a latent "apply universal" axis

*6. Cross-role class pull is the key structural insight:*
- The class word appears as SUBJECT in P1 ("All {class} are...") and as OBJECT in P2 ("{member} is a {class}")
- Subject pull (+0.238) > Object pull (+0.144) for the same word in different positions
- This role asymmetry is why P1 and P2 don't cluster despite sharing the class word

**Artifacts:**
- `prototype/syllogism_gap_grid.py` — Full analysis script
- `prototype/syllogism_gap_grid_results.json` — All numerical results
- `prototype/syllogism_gap_grid_embeddings.npz` — Raw 1024-dim vectors for 330 texts

---

## Experiment 15c: Syllogism Regression — Can C be constructed from P1, P2?

**Date:** 2026-03-10
**Script:** `python prototype/syllogism_regression.py`
**Duration:** <1 second (loads embeddings from 15b, no API calls)

**What:** Reframed the syllogism gap as a regression problem. Instead of asking "are premises similar?", ask "can we construct the conclusion C from the premises P1, P2 (or from bare word embeddings)?" Tested 14 models: 3 baselines, 2 structural (zero-param vector arithmetic), 6 fitted regressions (1-5 global scalars), 2 rich models (1024+ params with leave-one-member-out CV). Cosine(C_pred, C_actual) as metric across all 1000 syllogisms.

**Key findings:**

*1. P1 (the universal premise) contributes NOTHING:*
- P2 alone: 0.779. P2 + γP1: 0.777 (γ = -0.023, essentially zero)
- αP1 + βP2: 0.790 (α=0.153, β=0.692 — P2 dominates)
- In the 4-input kitchen sink (R4), α for P1 is -0.002 — literally zero
- The universal premise is informationally redundant for constructing C

*2. Bare words beat premises:*
- α·member + β·adj: 0.873 >> αP1 + βP2: 0.790
- The bare word embeddings of member name and adjective compose better than full sentence embeddings
- Sentence structure ("All ... are ...", "... is a ...") adds noise, not signal

*3. S1 = P2 + (adj − class) is the star (0.881, ZERO fitted params):*
- Literal vector arithmetic: take P2 ("{member} is a {class}"), subtract the class embedding, add the adjective embedding → predicts C at 0.881
- This is "swap class for adjective in the membership premise" — the syllogism as vector substitution
- Beats all fitted scalar models except the kitchen sink with 5 inputs

*4. The template bias μ captures "is":*
- R3 (α·m + β·adj): 0.873
- R6 (α·m + β·adj + μ, CV): 0.948 (+0.075)
- The 1024-dim bias vector μ captures the "{X} is {Y}" sentence template that bare words lack
- This is the best model overall, achieving 0.948 cosine with cross-validation

*5. Subtracting the class is the key transformation:*
- R4b (5 inputs): coefficients are α_P1=0.122, β_P2=0.542, γ_m=0.344, δ_adj=0.436, **ε_class=-0.464**
- The class coefficient is strongly negative — the model learns to SUBTRACT the class
- Confirms S1: the syllogism = remove class, add adjective

*6. R5 (P2 + constant displacement μ) is mediocre (0.820 CV):*
- A fixed displacement from P2 doesn't generalize because the displacement depends on which adjective and class are involved — there is no single "apply universal" vector

**Model ranking (mean cosine to actual C):**
| Model | Params | Cosine | Key insight |
|---|---|---|---|
| R6: α·m + β·adj + μ (CV) | 1026 | 0.948 | Best: words + template |
| R4b: all 5 inputs | 5 | 0.937 | Class coefficient negative |
| S1: P2 + (adj − class) | 0 | 0.881 | Syllogism = substitution |
| R3: α·member + β·adj | 2 | 0.873 | Words beat premises |
| B3: bare member | 0 | 0.827 | Member alone is strong baseline |
| R5: P2 + μ (CV) | 1024 | 0.820 | No universal displacement |
| R1: αP1 + βP2 | 2 | 0.790 | P1 barely helps |
| B1: P2 alone | 0 | 0.779 | The baseline |

**Implications for the paper:**
- The information for syllogistic inference EXISTS in embedding space (0.948 achievable) but is NOT accessible via similarity search
- A retrieval system can't do vector arithmetic — it can only rank by cosine to a query
- The VKG/logic layer bridges this by extracting propositions and reasoning symbolically over them
- The "gap" isn't missing information, it's the wrong ACCESS PATTERN (similarity vs composition)

**Artifacts:**
- `prototype/syllogism_regression.py` — Regression analysis script
- `prototype/syllogism_regression_results.json` — All model results and fitted coefficients
