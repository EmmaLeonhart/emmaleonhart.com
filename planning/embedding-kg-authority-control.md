# Embedding KG with Authority Control: Design Notes

> Working notes on the core architectural insight: authority control IDs as "symbolic weights"

---

## The Central Idea

A neurosymbolic model has two parallel training processes:

| | Neural Component | Symbolic Component |
|---|---|---|
| **Training input** | Raw text corpus | Raw text corpus |
| **Training process** | Gradient descent / backprop | Entity resolution against authority databases |
| **Learned artifact** | Embedding weights (float vectors) | Entity → Pramana ID mappings |
| **Inference cost** | Forward pass (cheap) | ID lookup + authority DB query (cheap) |
| **Update mechanism** | Fine-tuning | Incremental re-linking |

Both sides take in text and produce a learned representation. The neural side learns **geometric structure** (where things sit in embedding space). The symbolic side learns **identity** (what things *are*, grounded to external authorities).

---

## Propositions as First-Class Objects

Every proposition ("The cat is fat", "Water boils at 100°C") is treated as an object in its own right — not decomposed into parts, but embedded as a single vector. The embedding space captures:

- **Topic/relevance**: similar propositions cluster together
- **Compositional structure**: the geometric relationships between a proposition embedding and its constituent entity embeddings encode subject/predicate/object structure
- **Relational meaning**: "The cat is fat" is close to "The dog is overweight" because the predicate structure is similar

What the embedding space does **not** reliably capture:

- **Negation**: "X is alive" and "X is not alive" may be close (same topic)
- **Quantification**: "All cats" vs "some cats" — nearly identical vectors
- **Logical entailment**: "A implies B" is not algebraically extractable

These gaps are handled by the symbolic component.

---

## Why the Knowledge Graph Doesn't Need to Be Stored

Traditional approach:
```
Offline:  Extract millions of (S, P, O) triples → store in graph DB
Online:   Traverse stored graph
Storage:  Huge — every triple materialized
```

Proposed approach:
```
Offline:  Entity resolution → learn entity-to-Pramana-ID mappings
Online:   Compute structure from embedding geometry + resolve IDs + query authority DBs
Storage:  Minimal — just the ID mappings (the "symbolic weights")
```

The structural relationships (who relates to whom, and how) are recoverable from the embedding geometry at query time. The **identity** of entities comes from Pramana ID resolution. The **facts** live in external authority databases, queried at runtime.

The graph is computed, not stored.

---

## Pramana ID System as "Symbolic Vocabulary"

Just as a neural model ships with a token vocabulary and learned embeddings for each token, this model ships with a **Pramana ID vocabulary** — a massive set of authority-controlled identifiers that the model was trained to resolve entities against.

The Pramana IDs serve the role that weights serve in a neural network: they are the **learned parameters** of the symbolic component. They were expensive to produce (large-scale entity resolution during training), but cheap to use at inference time (ID lookup).

### Key properties:

1. **Every entity in the model has a Pramana ID** (or a probability distribution over candidate IDs)
2. **IDs link to external authority databases** — so facts don't need to be stored, they can be retrieved
3. **The ID mapping is the main artifact** — not a materialized graph of triples

---

## Modeling Uncertainty and Conflict

Truth in this system is not binary. Every proposition carries:

### Entity resolution uncertainty
```
"bank" in "the river bank" →
  Pramana:River_Bank       0.92
  Pramana:Financial_Bank   0.06
  Pramana:Blood_Bank       0.02
```

The attention mechanism's contextual embedding *mostly* disambiguates, but the Pramana ID resolution carries its uncertainty forward rather than committing prematurely.

### Contextual vs. grounded entities
- **Grounded**: "Queen Elizabeth II" → Pramana:QE2 (resolves to a specific individual)
- **Contextual**: "the cat" → bound variable, meaningful only within source context
- **Partially grounded**: "water" → Pramana:Water (chemical concept), but "the water" in "the water was cold" is contextual

### Contradictory propositions coexist
```
Proposition: "Queen Elizabeth is alive"
  entity: Pramana:QE2
  confidence: f(timestamp, source, corroboration)

Proposition: "Queen Elizabeth is dead"
  entity: Pramana:QE2
  confidence: f(timestamp, source, corroboration)
```

Both exist in the system. Resolution happens at query time based on context, recency, source reliability, etc. The graph doesn't assert truth — it models belief.

---

## Runtime Query Flow

1. **Embed the query** → get query vector
2. **Retrieve relevant propositions** → nearest-neighbor in embedding space (standard retrieval)
3. **Resolve entities to Pramana IDs** → using the learned entity resolution model (probabilistic)
4. **Compute structural relationships** → from embedding geometry between retrieved propositions
5. **Query authority databases** → using resolved Pramana IDs, get current authoritative facts
6. **Fuse** → combine embedding similarity, computed structure, and authority-grounded facts for final answer

Steps 3-5 replace what a traditional KG does by pre-materializing all triples. The cost shifts from storage to computation, but the computation is linear algebra + DB lookups, not LLM inference.

---

## Open Questions

- What is the right training procedure for the entity resolution model? Supervised (human-labeled entity links)? Semi-supervised (seed from Wikidata, bootstrap)?
- How to handle entities that don't exist in any authority database yet (novel concepts, neologisms)?
- What's the latency profile of runtime structure computation vs. pre-materialized graph traversal?
- Can the Pramana ID space itself be embedded, so that similar entities have similar IDs? (This would allow approximate matching for novel entities.)
