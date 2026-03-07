# Exploration Notes: Benchmark Results & Embedding Geometry

These are working notes from our first full evaluation run. The purpose is to document what actually happened, what the numbers mean, and what they tell us about the relationship between embedding (feature) space and semantic (logical) space.

---

## 1. Benchmark Results: 7-Scenario Suite

**Run date:** 2026-03-06
**Hardware:** Local Ollama, deepseek-r1:8b (reasoning), mxbai-embed-large (embeddings)
**Wall time:** ~49 minutes total

### Summary Table

| Scenario | Std Coverage | NS Coverage | Delta | Winner |
|---|---|---|---|---|
| Everest Boiling Point | 75% (3/4) | 100% (4/4) | +25% | NS |
| Drug Interaction Chain | 80% (4/5) | 100% (5/5) | +20% | NS |
| Economic Supply Cascade | 25% (1/4) | 75% (3/4) | +50% | NS |
| Coral Reef Collapse | 50% (2/4) | 50% (2/4) | 0% | Tie |
| Bridge Collapse | 75% (3/4) | 50% (2/4) | -25% | Std |
| Antibiotic Resistance | 80% (4/5) | 80% (4/5) | 0% | Tie |
| Satellite Signal | 50% (2/4) | 25% (1/4) | -25% | Std |

**Aggregate:** Std mean 62%, NS mean 69%, delta +6%. NS wins 3, ties 2, loses 2.

### What the wins tell us

**Everest (NS wins, +25%):** The original scenario and still the cleanest demonstration. Standard RAG retrieves 3/4 chain steps because C3 ("water boils at ~70C on Everest") scores 0.837 and pulls in its neighbors. But it misses C1 ("atmospheric pressure decreases as altitude increases") — scored only 0.560 against the query, below the distractor "Mount Everest is on the border between Nepal and Tibet" (0.641). The VKG rescues C1 because the entity "atmospheric pressure" bridges it to C0 and C3, which are already in the seed set.

**Drug Interaction (NS wins, +20%):** Standard RAG gets 4/5 — it actually does well here because the query mentions both "warfarin" and "ketoconazole" explicitly, pulling in most relevant sentences. But it misses C1 ("Warfarin is primarily metabolized by CYP2C9") which scored lower than the distractor "Ketoconazole is commonly used to treat fungal infections" (0.682 vs 0.619). The VKG bridges through the shared "warfarin" entity. Notably, the neurosymbolic pipeline retrieved all 5 chain steps despite finding 0 formal reasoning chains — the entity bridging in Pillar 2 alone was sufficient.

**Economic Cascade (NS wins, +50%):** The most dramatic win. Standard RAG retrieved only 1/4 chain steps — just C3 ("retail coffee prices rose 22%") because it directly matches the query. The trap distractors worked exactly as designed: "Starbucks announced a 5% price increase" (0.737) and "Consumer demand has grown 15%" (0.674) both outscored the actual causal chain about Brazilian drought and supply contraction. The VKG pulled in 3/4 by bridging through "brazil" as a shared entity between the price sentence and the drought/supply sentences.

### What the ties tell us

**Coral Reef (tie, 50%):** Both pipelines got 2/4. The extraction model struggled with this corpus — it reduced "Anthropogenic carbon dioxide emissions have increased atmospheric CO2 concentration" to `(Anthropogenic | relates to | unknown)`, losing the CO2 entity entirely. Without that entity, the VKG couldn't bridge from the atmospheric domain (CO2 emissions) to the oceanic domain (acidification). Standard RAG at least got C3 (coral/carbonate, 0.767) and C1 (CO2 absorption, 0.620) through direct similarity.

**Antibiotic Resistance (tie, 80%):** Both got 4/5. Standard RAG actually performed well here — the query "how do bacteria become resistant to penicillin-class antibiotics" has enough semantic overlap with the molecular chain steps (beta-lactamase, beta-lactam ring, hydrolysis) that cosine similarity ranked them highly. The one sentence both missed was C0 ("bacteria acquire resistance genes through horizontal gene transfer via conjugative plasmids"), which is about the *delivery mechanism* rather than the *biochemical mechanism* — a different kind of bridge the VKG also failed to construct.

### What the losses tell us

**Bridge Collapse (Std wins, -25%):** The extraction model collapsed badly here. "De-icing salts applied to road surfaces" became `(De | relates to | water)` — the model split "de-icing" at the hyphen and lost the semantic content entirely. "Corrosion of pre-stressed steel tendons" became `(Corrosion | relates to | unknown)`. Without meaningful entities extracted, bridging can't work. Meanwhile standard RAG actually did well: "de-icing salts" (0.751), "chloride ions" (0.607), and "tendon capacity" (0.583) all scored high enough to make the top-5.

**Satellite Signal (Std wins, -25%):** Similar extraction failure. "Coronal mass ejections (CMEs) from the sun" became `(3,000 km | relates to | Es)` — the model latched onto the speed figure and a fragment. "GPS signals passing through a disturbed ionosphere" became `(10 meters | relates to | unknown)`. The 8b model simply cannot handle multi-clause sentences with technical terminology across multiple domains in a single pass.

### Diagnosis: Why NS loses

The pattern is clear. The neurosymbolic pipeline has a **single point of failure: Pillar 1 extraction quality**. When the 8b model produces good subject-predicate-object triples with correct entities, the VKG construction and entity bridging work well (scenarios 0-2). When the model produces degenerate triples like `(X | relates to | unknown)`, the entire downstream pipeline collapses because there are no entities to bridge through.

This is not a flaw in the architecture — it's a flaw in the component. Swapping deepseek-r1:8b for a more capable extraction model (or even just improving the regex fallback) would likely flip the losing scenarios.

### A note on keyword hits

NS scored 0/7 on keyword wins (cases where NS got keywords and Std didn't). This seems bad but is misleading. In 4/7 scenarios, both pipelines hit the keywords. In the remaining 3, neither did (coral reef) or Std hit them and NS didn't. The keyword metric is primarily measuring answer generation quality, which depends on the same 8b model for both pipelines. The *retrieval* quality (coverage) is the metric that measures what our architecture actually changes.

---

## 2. Embedding Geometry Exploration

We embedded 5 families of propositions to understand how mxbai-embed-large (1024-dim) organizes semantic content. This directly addresses the paper's thesis about mapping feature space to semantic space.

### Family 1: "X are cute" (lexical substitution)

```
Dogs/Canines:  0.976    (near-synonyms)
Dogs/Hounds:   0.890    (hyponym)
Dogs/Huskies:  0.791    (specific breed)
Dogs/Wolves:   0.777    (related species)
Huskies/Hounds: 0.747   (most distant pair)
```

**Observation:** The embedding model has a fine-grained understanding of the hyponymy hierarchy. "Dogs" and "Canines" are near-identical (0.976) because they're true synonyms — every dog is a canine and vice versa. "Hounds" (0.890) is more specific but still a clear subset. "Wolves" (0.777) and "Huskies" (0.791) are related but taxonomically distinct.

**Implication for our work:** When two propositions differ only in a subject that the model considers a near-synonym, their embeddings are nearly identical. This means standard RAG would retrieve them interchangeably, which is correct behavior. The VKG doesn't add value here because there's no reasoning gap to bridge.

### Family 2: Socrates Syllogism

```
"Socrates is a man" / "Socrates is mortal":    0.879    (shared subject)
"All men are mortal" / "Socrates is mortal":    0.653    (shared predicate+object)
"All men are mortal" / "Socrates is a man":     0.560    (the logical bridge)
```

**This is the key finding.** The two *premises* of the syllogism — "All men are mortal" and "Socrates is a man" — are the farthest apart in embedding space (0.560). Yet they are the two sentences you need *together* to derive the conclusion. A standard RAG system retrieving top-k by similarity to the conclusion "Socrates is mortal" would rank "Socrates is a man" first (0.879) and "All men are mortal" second (0.653). It would *probably* get both in top-5 for this simple case, but the gap between them (0.560) is the kind of gap that gets exploited in harder scenarios.

The conclusion (0.879 to one premise, 0.653 to the other) is closer to one premise than the other. In embedding space, the conclusion lives near "Socrates is a man" because they share the subject entity, not because the model understands the logical derivation.

**Implication:** Embeddings organize by *entity overlap*, not by *logical role*. The premise-conclusion distance (0.879) is driven by shared "Socrates", not by the model understanding that one entails the other. Our VKG can exploit this by using "man/men" as a bridge entity between the two premises, which is exactly how a human would reason through the syllogism.

### Family 3: Robin Syllogism (structural parallel)

```
"A robin is a bird" / "A robin can fly":        0.912    (shared subject)
"All birds can fly" / "A robin can fly":         0.728    (shared predicate+object)
"All birds can fly" / "A robin is a bird":       0.671    (the logical bridge)
```

Same pattern as Socrates but with slightly higher similarities across the board. The universal premise and the particular instance are again the most distant pair (0.671 vs 0.560 for Socrates). The model "understands" robins and birds better than it understands the Socrates/man relationship — probably because robin-bird co-occurrence is more frequent in training data than Socrates-man.

### Family 4: Causal Chain (Altitude → Pressure → Boiling)

```
Altitude/Pressure:  0.660    (adjacent steps)
Pressure/Boiling:   0.640    (adjacent steps)
Altitude/Boiling:   0.476    (endpoints)
```

**This is our thesis in numbers.** The endpoints of the causal chain — "altitude increases" and "water boils at a lower temperature" — are only 0.476 similar. A query about boiling on a mountain would score the altitude fact very low. Yet the altitude fact is *essential* to the reasoning chain.

The adjacent steps hover around 0.65, close enough that entity bridging can link them if they share entities ("pressure" bridges step 1 and step 2, "temperature" bridges step 2 and step 3). But the endpoints can *only* be connected by traversing the intermediate step. This is exactly the gap that standard RAG fails on and that our VKG bridges.

### Family 5: "X inhibits Y" (shared predicate, different domains)

```
Ketoconazole/Aspirin:    0.553
Ketoconazole/Shade:      0.476
Ketoconazole/Regulation: 0.365
Aspirin/Shade:           0.435
Aspirin/Regulation:      0.410
Shade/Regulation:        0.463
```

Mean similarity: 0.450. This is barely above random.

**Critical insight:** Sharing a predicate ("inhibits") does almost nothing in embedding space. "Ketoconazole inhibits CYP2C9" and "Regulation inhibits competition" share identical relational structure (A inhibits B) but score only 0.365 — lower than many cross-family pairs. The embedding model is encoding *domain content* (pharmacology vs economics vs biology vs governance), not *relational structure*.

**Implication for the VKG:** This confirms that you cannot rely on embedding similarity to identify structurally analogous propositions across domains. A VKG that encodes predicate types (inhibition, causation, etc.) explicitly can make cross-domain analogies that embeddings completely miss. This is a potential direction for the paper: not just multi-hop retrieval but cross-domain structural analogy.

### Cross-Family Analysis

The closest cross-family pair was "Atmospheric pressure decreases" and "Shade inhibits photosynthesis" at 0.602 — probably because both describe a natural phenomenon with a negative effect. This is a **false bridge**: these sentences have no logical relationship, but an embedding-based system might link them.

The "cute animals" family clustered closest to the "robin syllogism" family (centroid similarity 0.509), likely because both involve animals with simple predications. This makes topical sense but is logically meaningless.

---

## 3. Synthesis: What This Means for the Paper

### The core argument, supported by data

1. **Embedding space encodes topical similarity, not logical structure.** The "inhibits" family (0.450 mean) proves this directly — identical relational structure across domains is nearly invisible to embeddings.

2. **Multi-hop chains decay in embedding space.** Causal chain endpoints (0.476) are barely more similar than random cross-domain sentences. Standard RAG will miss chain steps that are essential but topically distant from the query.

3. **Entity bridging recovers what embeddings lose.** In the benchmark, the 3 scenarios where NS wins are exactly the cases where the extraction model successfully identifies shared entities between chain steps. The 2 losses are extraction failures, not architecture failures.

4. **The bottleneck is extraction, not the graph.** The VKG architecture works when fed good propositions. The current 8b model is the weak link. This suggests a clean separation of concerns: improve extraction quality independently, and the end-to-end system improves without changing the VKG or logic engine.

5. **Embeddings are compositional but lopsidedly weighted.** The semantic grid proves that S, P, and O each contribute a consistent, independent, approximately additive vector component. But the weights are drastically unequal: Subject (3.5x) > Object (2.6x) > Predicate (1.0x). The model allocates its dimensions to encode *what things are about* (entities/topics), not *what relationship holds* (predicates). This is optimal for topical retrieval but exactly wrong for logical reasoning, where the predicate is the most important component.

6. **Verbs are consistent translations, not deformations.** Despite weak magnitude, verb displacement vectors point in the same direction across S/O contexts (0.84 alignment). The verb shifts the entity subspace without reshaping it (subspace r=0.958). This explains why entity bridging works robustly — shared entities stay close regardless of what predicate connects them. But it also means you cannot discover structural analogies ("all inhibition relationships") via embedding distance alone. The VKG's explicit predicate labels fill exactly this gap.

### Observations worth highlighting in the paper

- **The Socrates gap:** 0.560 between the two premises of a valid syllogism. This is a vivid, citable example of embedding space failing at logical reasoning.
- **The distractor trap:** In the economic scenario, "Starbucks announced a 5% price increase" (0.737) outscored the actual cause "severe drought in Brazil" (not in top-5 at all). Standard RAG confidently retrieves the wrong explanation.
- **Entity bridging as the mechanism:** The VKG doesn't do anything magical — it simply follows shared entities between propositions. But this simple mechanism recovers chain steps that cosine similarity ranks below distractors.

### Known limitations to address

- **Extraction quality:** 2/7 scenarios fail because deepseek-r1:8b can't parse complex technical sentences. The paper should either use a better model or explicitly frame this as a component limitation, not an architecture limitation.
- **Keyword metric:** NS scores 0/7 on keywords-only-NS-hits, but this is an answer generation issue, not a retrieval issue. The paper should separate retrieval evaluation from generation evaluation.
- **Overhead:** 16.9x time overhead (163s vs 2753s). Most of this is the extraction step (14 LLM calls per scenario vs 1 for standard RAG). This is inherent to the approach but could be parallelized.
- **No formal chains found in winning scenarios:** In 2 of the 3 NS wins (Everest, Drug), the logic engine found 0 formal reasoning chains. The coverage improvement came entirely from Pillar 2 entity bridging, not Pillar 3 chain discovery. This weakens the "logic-gated" claim — really it's "entity-bridged" retrieval doing the work.

---

## 3b. Semantic Grid: Isolating Subject, Predicate, Object Axes

The embedding family experiments (§2) hinted that subject overlap drives similarity more than predicate overlap. The 3×3×3 semantic grid tests this rigorously by crossing 3 subjects (cats, trucks, children) × 3 predicates (eat, carry, watch) × 3 objects (fish, rocks, stars) into 27 propositions. Every word was chosen to be concrete, unambiguous, and maximally distinct from others in its role.

### The axis hierarchy

| Axis | Same-axis mean | Diff-axis mean | Separation | Relative strength |
|---|---|---|---|---|
| Subject | 0.702 | 0.462 | **+0.240** | 3.5x |
| Object | 0.658 | 0.482 | **+0.176** | 2.6x |
| Predicate | 0.583 | 0.515 | **+0.069** | 1.0x (baseline) |

Subject dominates. Two sentences sharing a subject are on average 0.240 more similar than two that don't — the predicate gap is only 0.069. This means that in embedding space, *who does something* matters 3.5x more than *what they do*.

Object is second. *What they act on* matters 2.6x more than the action itself. The predicate — the relational structure that a logician would consider the most important part of a proposition — is almost invisible to the embedding model.

### What this means for VKG design

This result quantitatively confirms what the "inhibits" family showed qualitatively: **embedding models encode entities, not relations**. Two propositions with the same subject and object but different predicates ("Trucks carry stars" vs "Trucks watch stars") score 0.915. Two with the same predicate but different entities ("Cats eat fish" vs "Children carry stars") score 0.247.

For the VKG, this has a specific architectural implication. Entity bridging works *because* embeddings are entity-dominated. When two propositions share an entity (subject or object), they're already close in embedding space and easily bridged. The VKG's contribution is bridging across the *predicate gap* — connecting "CYP2C9 is an enzyme" to "CYP2C9 is inhibited" where the shared entity pulls them together even though the predicates are unrelated.

But it also means the VKG should NOT rely on embedding similarity to identify structurally similar propositions across domains (the "inhibits" failure). If we want cross-domain analogy ("ketoconazole inhibits CYP2C9" ↔ "regulation inhibits competition"), we need explicit predicate-type matching in the ontology, not embedding distance.

### Per-value pull strength

Not all values within an axis pull equally:

- **Subjects:** "trucks" (+0.267) > "cats" (+0.254) > "children" (+0.201). The concrete, unambiguous noun "trucks" pulls harder than the more semantically rich "children" — likely because "children" co-occurs in many more contexts in training data, spreading its embedding across a wider region.
- **Predicates:** All nearly identical (~0.07). "eat", "carry", "watch" are all common verbs with clear meanings, and none pulls harder than the others. The predicate simply doesn't anchor the embedding.
- **Objects:** Also nearly identical (~0.18). Concrete nouns are equally effective as attractors.

### The step function at 0, 1, 2 shared axes

The joint analysis shows a clean staircase:

| Shared axes | Mean similarity | Interpretation |
|---|---|---|
| 0 | 0.361 | Different subject, predicate, object: near-random |
| 1 | 0.546 | Share one axis: moderate pull |
| 2 | 0.750 | Share two axes: strong cluster |

The steps are roughly equal (+0.19, +0.20), suggesting the axes contribute approximately additively. There's no strong interaction effect — sharing two axes is roughly the sum of sharing each independently.

---

## 3c. Verb Structure: Is the Predicate Signal Consistent or Just Weak?

The grid showed predicates have the weakest pull (+0.069). But weak overall doesn't mean incoherent. The verb structure analysis asks: when you swap a verb, does the embedding shift in a *consistent direction* — a "verb vector" — or does it just add noise?

### Verb displacement vectors ARE consistent

When you change eat→carry across all 9 subject/object combinations, the displacement vectors (the literal vector difference in 1024-dim space) have a mean pairwise cosine of **0.671**. This is well above zero — the verb swap moves the embedding in roughly the same direction regardless of what's eating or being eaten.

| Verb swap | Displacement cosine | Mean alignment to centroid direction |
|---|---|---|
| eat → carry | 0.671 | 0.841 |
| eat → watch | 0.640 | 0.825 |
| carry → watch | 0.641 | 0.825 |

All three verb pairs show ~0.65 consistency. The individual alignment to the mean displacement direction is even higher (~0.83), meaning each individual verb swap tracks the mean "verb direction" closely.

**Key finding:** There IS a consistent "verb direction" in embedding space. The predicate has weak *magnitude* (it doesn't move the vector far) but strong *directional consistency* (it moves it the same way every time). This is exactly what you'd expect from compositional semantics — the verb contributes a small but systematic component to the overall embedding.

### The verb direction is modulated by context

Breaking down displacement consistency by what's shared:

| Context | eat→carry | eat→watch | carry→watch |
|---|---|---|---|
| Same subject | 0.769 | 0.697 | 0.720 |
| Same object | 0.713 | 0.691 | 0.697 |
| Neither shared | 0.601 | 0.587 | 0.573 |

When the subject is the same, the verb displacement is MORE consistent (0.769 vs 0.601 for eat→carry). This makes sense: "cats eat fish → cats carry fish" and "cats eat rocks → cats carry rocks" are conceptually similar verb swaps (same agent performing a different action). When the subject also changes, the verb direction gets noisier because you're changing the conceptual frame.

### The verb doesn't change the internal structure

The verb-conditioned subspace analysis asks: within "eat" propositions, does the similarity landscape (which S/O pairs are close?) look the same as within "carry"?

| Verb pair | Pearson r | Rank r |
|---|---|---|
| eat vs carry | 0.958 | 0.889 |
| eat vs watch | 0.939 | 0.856 |
| carry vs watch | 0.973 | 0.935 |

Pearson r of **0.958** between the eat and carry subspaces. The verb changes the *location* of the cluster in 1024-dim space but barely touches its *internal geometry*. cats/fish is close to cats/rocks and far from trucks/stars regardless of whether they eat, carry, or watch. The verb is a translation, not a deformation.

### Naturalness: the model doesn't clearly encode selectional preferences

"Cats eat fish" is natural. "Trucks eat stars" is absurd. Does the embedding position "cats eat fish" closer to the verb centroid (as a more "prototypical" use of "eat")?

**No.** Overall correlation between hand-labeled naturalness (1-3) and centroid distance: **r = -0.031**. Essentially zero. The individual verbs show mixed signals (eat: -0.33, carry: +0.30, watch: -0.05) with no consistent pattern.

This is surprising. It means mxbai-embed-large either doesn't encode selectional preferences, or encodes them in a way that isn't captured by centroid distance. The model places "trucks eat rocks" just as comfortably within the "eat" cluster as "cats eat fish". For our purposes, this is actually useful — it means entity bridging won't be derailed by "weird" combinations that the model might otherwise push to the periphery.

### Interaction effects are minimal

The Subject × Predicate coherence matrix shows no strong interactions:

|  | eat | carry | watch |
|---|---|---|---|
| cats | 0.714 | 0.771 | 0.749 |
| trucks | 0.755 | 0.765 | 0.734 |
| children | 0.759 | 0.719 | 0.698 |

All values cluster between 0.70 and 0.77. No subject has a privileged relationship with any verb. Similarly, Predicate × Object shows flat interactions (0.65-0.70 throughout). The embedding model treats S, P, O as approximately independent contributions — further evidence for compositional structure.

### Synthesis: what this means for the paper

The verb has a small but **directionally consistent** effect on embeddings. It acts as a translation vector that shifts the entire subject/object landscape without deforming it. This has three implications:

1. **Entity bridging is robust.** Because verbs don't deform the S/O subspace, two propositions sharing an entity will be close regardless of their predicates. This is exactly what makes entity bridging work in the VKG.

2. **Predicate-aware retrieval needs explicit structure.** You can't use embedding distance to find "all inhibition relationships" across domains — the verb direction is consistent *within* a verb but the magnitude is too small to create a separable cluster. The VKG's explicit predicate labels fill this gap.

3. **Compositionality is real but lopsided.** The model composes S + P + O approximately additively, but with wildly unequal weights (subject 3.5x, object 2.6x, predicate 1x). A semantic space that rebalances these weights — giving predicates equal standing — would better represent logical structure.

---

## 4. Raw Data Artifacts

- `results.json` — Full benchmark metrics (per-scenario + aggregate)
- `prototype/embeddings_exploration.npz` — Raw 1024-dim embedding vectors for all 18 propositions across 5 families. Load with `np.load('prototype/embeddings_exploration.npz', allow_pickle=True)`. Keys: `vecs_cute_animals`, `vecs_socrates_syllogism`, `vecs_syllogism_variant`, `vecs_causal_chain`, `vecs_inhibits_X`, `all_vecs`, `all_labels`.
- `prototype/embeddings_exploration.json` — Pairwise similarity matrices and cluster statistics for all 5 families.
- `prototype/semantic_grid_results.json` — Full 27×27 similarity matrix and axis/joint/per-value analysis.
- `prototype/semantic_grid_results_embeddings.npz` — Raw 1024-dim vectors for all 27 grid propositions. Keys: `vecs`, `sentences`, `subjects`, `predicates`, `objects`.
- `prototype/verb_structure_results.json` — Displacement consistency, subspace correlation, naturalness, and interaction analysis.
