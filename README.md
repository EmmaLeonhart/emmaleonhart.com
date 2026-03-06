# Neurosymbolic GraphRAG

Runtime Virtual Knowledge Graphs as a semantic space for logic-gated retrieval — compared against standard vector-similarity RAG.

## Prototype

The `prototype/` directory contains a proof-of-concept demonstrating the core idea using entirely local inference via Ollama.

### Architecture

| File | Role |
|---|---|
| `knowledge_base.py` | Curated 12-sentence corpus, query, ground truth |
| `pillar1_extraction.py` | Propositional extraction via DeepSeek-R1 |
| `pillar2_mapping.py` | Embeddings + VKG construction (entity bridging) |
| `pillar3_logic.py` | Reasoning chain discovery + pruning |
| `standard_rag.py` | Baseline: vector similarity only |
| `neurosymbolic_rag.py` | Full pipeline: all 3 pillars |
| `run_demo.py` | Entry point: side-by-side comparison |

### Prerequisites

- [Ollama](https://ollama.com/) with models:
  - `deepseek-r1:8b` (reasoning)
  - `mxbai-embed-large` (embeddings)
- Python packages: `ollama`, `networkx`, `rdflib`, `numpy`

### Run

```bash
python prototype/run_demo.py
```

### Demo Scenario

**Query**: "At what temperature does water boil on Mount Everest?"

- **Standard RAG** retrieves "Water boils at 100C" and "Everest is in Nepal" by similarity — misses the pressure-altitude-boiling point causal chain
- **Neurosymbolic RAG** uses entity bridging to pull in related propositions, then the logic engine finds the 4-step reasoning chain leading to the correct answer (~70C)
