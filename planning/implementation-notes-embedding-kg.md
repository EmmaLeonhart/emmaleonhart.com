# Implementation Notes: Neurosymbolic Embedding KG with Authority Control

> Consolidated design notes for implementation. Covers the full architecture from
> embedding-space propositions through authority-controlled entity resolution to
> runtime query flow. Intended as the bridge between theory and code.

---

## 1. Core Architectural Principle

The system has two parallel "training" phases that produce two kinds of learned parameters:

| | Neural Side | Symbolic Side |
|---|---|---|
| **What's learned** | Embedding weights (geometric structure) | Entity → Pramana ID mappings (identity) |
| **Training process** | Backpropagation on corpus | Entity resolution against authority databases |
| **Stored artifact** | Model weights | ID mapping table ("symbolic weights") |
| **Inference** | Forward pass | ID lookup + authority DB query |

Both are expensive offline, cheap online. Neither requires materializing a full knowledge graph.

---

## 2. Propositions as First-Class Embedding Objects

Every proposition — not just entities — gets its own embedding vector. "The cat is fat" is an object in the same space as "cat" or "fat".

### What the embedding space gives us
- **Similarity/relevance**: propositions about related topics cluster
- **Compositional structure**: geometric relationships between proposition and constituent entity embeddings encode S-P-O structure (recoverable at runtime)
- **Relational meaning**: predicate structure is captured (e.g., "The cat is fat" ≈ "The dog is overweight")

### What it does NOT give us (symbolic component handles these)
- **Negation**: "alive" and "not alive" are close in embedding space
- **Quantification**: "all X" vs "some X" — nearly identical vectors
- **Logical entailment**: implication is not algebraically extractable
- **Temporal truth**: "Queen Elizabeth is alive" vs "Queen Elizabeth is dead" — both valid propositions

---

## 3. Two-Level Entity Resolution

### Level 1: Class Resolution (Global — Training Time)

Map language to authority-controlled type system. This is the expensive symbolic training.

```
"cat"     → Pramana:Felis_catus
"water"   → Pramana:H2O
"boiling" → Pramana:Phase_Transition_Boiling
"F135"    → NSN:2840-01-XXX-XXXX
```

The Pramana ID vocabulary is domain-scoped. A defense maintenance system needs part numbers, fault codes, and procedure IDs — not a general ontology of the world. A medical system needs ICD codes, drug compound IDs, procedure codes. The architecture is the same; the ID vocabulary changes.

### Level 2: Instance Resolution (Local — Runtime)

Generic/contextual entities ("the cat", "the left engine") don't need global authority IDs. They need:
- **Class tag**: what type of thing (resolved via Level 1)
- **Scope binding**: which instance, in this context
- **Coreference tracking**: "the cat" in sentence 1 = "it" in sentence 2

```
"the cat" → instance of Pramana:Felis_catus, scope=document_47
"the left engine" → instance of NSN:2840-01-XXX, scope=tail_AF-12-3456_port
```

Generics have a **form that demands resolution** (the definite article, pronouns, demonstratives signal an instance) but the **class is pre-resolved** from training. Only the binding is computed at runtime.

### Entity Resolution Is Probabilistic

```
"bank" in "the river bank" →
  Pramana:River_Bank       0.92
  Pramana:Financial_Bank   0.06
  Pramana:Blood_Bank       0.02
```

The contextual embedding from attention mostly disambiguates, but the system carries uncertainty forward. It can misunderstand a sentence — the resolution is a probability distribution, not a hard assignment.

---

## 4. Consistency Model

### External Consistency
Does the entity resolution match the authority database? Validated against external sources. Errors here mean the symbolic training needs updating.

### Internal Consistency
Within a document/conversation, are generics and coreferences tracked correctly? "The cat is alive" + "The cat is dead" in the same scope = local contradiction, detectable without any external lookup.

### Contradictory Propositions Coexist
The system does not assert truth. It models belief with metadata:

```
Proposition: "Queen Elizabeth is alive"
  entity: Pramana:QE2
  confidence: f(timestamp, source, corroboration)
  conflicts_with: ["Queen Elizabeth is dead"]

Proposition: "Queen Elizabeth is dead"
  entity: Pramana:QE2
  confidence: f(timestamp, source, corroboration)
```

Resolution happens at query time based on context, recency, and source reliability.

---

## 5. Why the Graph Doesn't Need to Be Stored

Traditional KG:
```
Offline:  Extract millions of (S, P, O) triples → store in graph DB
Online:   Traverse stored graph
Storage:  Massive
```

This architecture:
```
Offline:  Entity resolution → store entity-to-Pramana-ID mappings only
Online:   Compute structure from embedding geometry + resolve IDs + query authority DBs
Storage:  Minimal — the ID mappings are the model's symbolic weights
```

- **Structure** (who relates to whom) → recovered from embedding geometry at query time
- **Identity** (which entity) → Pramana ID resolution
- **Facts** → live in external authority databases, queried via resolved IDs

The graph is computed, not stored. The only persisted symbolic artifact is the ID mapping table.

---

## 6. Storage Backend: Azure Cosmos DB with DiskANN

### Why Cosmos DB

Cosmos DB supports both **vector search** (via DiskANN) and **graph queries** (via Gremlin API) on the same data. This maps directly to the dual-mode query pattern:

- **Primary path (DiskANN vector search)**: Embed query → ANN lookup over proposition embeddings → retrieve relevant propositions with their Pramana ID annotations. This is the hot path for most queries. DiskANN gives sub-millisecond approximate nearest neighbor at scale with minimal memory overhead (vectors stay on disk, not RAM).

- **Secondary path (graph query)**: When runtime-computed structure from embeddings isn't sufficient, or when you need to traverse resolved authority relationships, fall back to graph queries over the Pramana ID linkage.

### Data Model

```
Document (one per proposition):
{
  "id": "prop_uuid",
  "source_text": "Water boils at 100°C at standard pressure.",
  "embedding": [0.12, -0.34, ...],          // 1024-dim, DiskANN-indexed
  "class_entities": [                         // Level 1 resolutions
    {"surface": "water", "pramana_id": "Pramana:H2O", "confidence": 0.99},
    {"surface": "100°C", "pramana_id": "Pramana:Temp_100C", "confidence": 0.97},
    {"surface": "standard pressure", "pramana_id": "Pramana:Atm_101325Pa", "confidence": 0.95}
  ],
  "instance_entities": [],                    // Level 2 — empty for non-generic
  "metadata": {
    "source": "chemistry_textbook_ch3",
    "timestamp": "2024-01-15",
    "confidence": 0.95
  }
}
```

### Why DiskANN as Primary

- Proposition retrieval is the first and most frequent operation in every query
- DiskANN scales to billions of vectors without requiring them all in RAM
- Once you have retrieved propositions + their Pramana ID annotations, you can compute structure and query authorities without touching the graph index
- Graph queries become a fallback for complex multi-hop reasoning, not the default path

### Query Flow on Cosmos DB

```
1. Query → embed → DiskANN vector search → top-k propositions
2. Extract Pramana IDs from retrieved propositions
3. Compute structural relationships from embedding geometry of retrieved set
4. If needed: Gremlin graph query over Pramana ID edges for multi-hop
5. Query external authority DBs using resolved Pramana IDs
6. Fuse results → generate answer
```

---

## 7. Domain Scoping — Why This Is Tractable

A general-purpose neurosymbolic system covering all of human knowledge is a moonshot. But domain-scoped systems are buildable today:

| Domain | Authority IDs | Authority Database |
|---|---|---|
| Defense maintenance | NSNs, fault codes, TO numbers | Military logistics DBs |
| Medicine | ICD codes, NDC numbers, CPT codes | FDA, NLM databases |
| Law | Statute numbers, case citations | Legal databases (Westlaw, etc.) |
| Chemistry | PubChem CIDs, CAS numbers | PubChem, ChemSpider |
| General knowledge | Wikidata QIDs | Wikidata SPARQL endpoint |

The entity resolution training is scoped to the domain's ID vocabulary. You don't need to resolve everything — just everything relevant to the system's purpose.

---

## 8. Mapping to Current Prototype

The current prototype (Pillars 1-3) maps to this architecture as follows:

| Current | Proposed |
|---|---|
| Pillar 1: DeepSeek-R1 extraction | Becomes expensive fallback for ambiguous propositions; most S-P-O structure computed from embedding geometry |
| Pillar 2: mxbai-embed-large + VKG | Embedding stays; VKG becomes ephemeral (computed at query time from Cosmos DB DiskANN results) |
| Pillar 3: NetworkX path finding | Operates on runtime-computed graph; Pramana IDs enable authority-grounded reasoning chains |
| Entity matching (string overlap) | Replaced by Pramana ID matching — two entities match iff they resolve to the same ID |
| RDFLib graph | Replaced by Cosmos DB Gremlin for persistent authority relationships; RDF for formal semantics if needed |

---

## 9. Open Implementation Questions

1. **Entity resolution training procedure**: Supervised (human-labeled links)? Semi-supervised (seed from Wikidata/domain DBs, bootstrap with embedding similarity)?
2. **Confidence calibration**: How to produce well-calibrated probability distributions over candidate Pramana IDs, not just rankings?
3. **Novel entities**: What happens when an entity doesn't exist in any authority DB? Mint a new Pramana ID? Flag for human review?
4. **Latency budget**: DiskANN retrieval is fast, but computing structure from embeddings + authority DB queries adds round trips. What's the acceptable latency envelope?
5. **Embedding model choice**: Current `mxbai-embed-large` is general-purpose. Domain-specific fine-tuning could improve structural recoverability. NLI-trained models might better handle negation/entailment.
6. **Pramana ID embedding**: Can the ID space itself be embedded so that similar entities have nearby IDs? Would enable approximate matching for novel/unseen entities.
