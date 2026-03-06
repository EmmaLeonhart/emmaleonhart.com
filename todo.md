# TODO — Neurosymbolic GraphRAG Paper

## Prototype (Done)
- [x] Knowledge base with curated corpus and ground truth
- [x] Pillar 1: Propositional extraction via DeepSeek-R1
- [x] Pillar 2: VKG construction with entity bridging
- [x] Pillar 3: Logic engine (chain search, contradiction detection, pruning)
- [x] Standard RAG baseline
- [x] Full neurosymbolic pipeline
- [x] Side-by-side demo (100% vs 75% ground truth coverage)

## Paper Preparation
- [ ] Choose paper title (12 candidates in `paper_names.md`)
- [ ] Decide on paper structure / section outline
- [ ] Set up LaTeX template (arXiv compatible)

## Writing
- [ ] Abstract
- [ ] Introduction — motivation, problem statement, contributions
- [ ] Related Work — GraphRAG, neurosymbolic AI, KG embeddings, proposition-first ontologies
- [ ] Method — 3-pillar architecture (extraction, mapping, logic)
- [ ] Experiments / Evaluation
- [ ] Results and Analysis
- [ ] Discussion — limitations, future work
- [ ] Conclusion

## Evaluation (needed for paper)
- [ ] Design additional test queries beyond the Everest boiling point demo
- [ ] Expand corpus or use a public benchmark dataset
- [ ] Define quantitative metrics (coverage, precision, answer correctness)
- [ ] Run comparative evaluation: standard RAG vs neurosymbolic across multiple queries
- [ ] Ablation study: contribution of each pillar individually
- [ ] Consider testing with different LLM backends

## Polish
- [ ] Figures and diagrams (architecture overview, VKG example, pipeline flow)
- [ ] Tables with evaluation results
- [ ] Proofread and revise
- [ ] Submit to arXiv
