"""Pillar 3 — Logic Engine: reasoning chain discovery and pruning.

Operates on the VKG built by Pillar 2 to find multi-hop reasoning paths,
detect contradictions, prune irrelevant nodes, and format grounded context
for the final LLM answer generation.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import networkx as nx

from prototype.pillar2_mapping import NS, VKG, _safe_uri


@dataclass
class ReasoningChain:
    """An ordered sequence of propositions forming a logical argument."""
    steps: list[str]            # source texts in order
    path_nodes: list[str]       # URI fragments for the path
    score: float = 0.0         # chain quality score


def find_reasoning_chains(
    vkg: VKG,
    max_depth: int = 6,
    max_chains: int = 5,
) -> list[ReasoningChain]:
    """Find reasoning chains by searching for paths in the VKG.

    Strategy:
      - Identify anchor nodes (high degree or from seed propositions)
      - Find paths between all pairs of anchor nodes
      - Score chains by coverage of distinct source texts
    """
    G = vkg.nx_graph
    if G.number_of_nodes() == 0:
        return []

    # Use undirected view for path finding (causal links go both ways)
    G_undirected = G.to_undirected()

    # Anchor nodes: those with highest degree (connection hubs)
    degrees = sorted(G.degree(), key=lambda x: x[1], reverse=True)
    anchor_nodes = [n for n, d in degrees[:min(6, len(degrees))] if d >= 1]

    if len(anchor_nodes) < 2:
        anchor_nodes = list(G.nodes())[:min(4, G.number_of_nodes())]

    chains: list[ReasoningChain] = []
    seen_source_sets: set[frozenset[str]] = set()

    for i, src in enumerate(anchor_nodes):
        for tgt in anchor_nodes[i + 1:]:
            try:
                for path in nx.all_simple_paths(
                    G_undirected, src, tgt, cutoff=max_depth
                ):
                    # Collect source texts along the path
                    sources = []
                    for u, v in zip(path[:-1], path[1:]):
                        edge_data = G_undirected.edges.get((u, v), {})
                        source = edge_data.get("source", "")
                        if source and source not in sources:
                            sources.append(source)

                    if not sources:
                        continue

                    source_set = frozenset(sources)
                    if source_set in seen_source_sets:
                        continue
                    seen_source_sets.add(source_set)

                    path_labels = [
                        G.nodes[n].get("label", str(n).split("/")[-1])
                        for n in path
                    ]

                    chains.append(ReasoningChain(
                        steps=sources,
                        path_nodes=path_labels,
                        score=len(sources),  # longer chains = more reasoning
                    ))
            except nx.NetworkXNoPath:
                continue

    # Sort by score (prefer chains covering more source texts)
    chains.sort(key=lambda c: c.score, reverse=True)
    return chains[:max_chains]


def detect_contradictions(vkg: VKG) -> list[str]:
    """Use SPARQL on the RDF graph to find contradictory statements.

    Looks for pairs where the same subject has conflicting predicates
    (e.g., "boils at 100C" vs "boils at 70C" without qualifiers).
    """
    query = """
    SELECT ?s ?p1 ?o1 ?p2 ?o2
    WHERE {
        ?s ?p1 ?o1 .
        ?s ?p2 ?o2 .
        FILTER(?p1 = ?p2 && ?o1 != ?o2)
    }
    """
    contradictions = []
    try:
        results = vkg.rdf_graph.query(query)
        for row in results:
            s, p1, o1, p2, o2 = row
            contradictions.append(
                f"Potential conflict: {s} has {p1} -> {o1} AND {p2} -> {o2}"
            )
    except Exception:
        pass  # SPARQL on small graphs may not find patterns
    return contradictions


def prune_irrelevant(
    vkg: VKG,
    chains: list[ReasoningChain],
) -> list[str]:
    """Return only source texts that appear in at least one reasoning chain.

    Propositions not on any valid chain are pruned as logically irrelevant.
    """
    on_chain: set[str] = set()
    for chain in chains:
        on_chain.update(chain.steps)

    # If no chains found, fall back to all VKG propositions
    if not on_chain:
        return [p.source_text for p in vkg.propositions if p.source_text]

    return list(on_chain)


def format_grounded_context(
    chains: list[ReasoningChain],
    pruned_sources: list[str],
) -> str:
    """Format the reasoning chains into structured context for the LLM.

    Produces a human-readable chain-of-thought prompt section.
    """
    parts = ["=== Grounded Context (from Virtual Knowledge Graph) ===\n"]

    if chains:
        best = chains[0]
        parts.append("Reasoning chain (ordered logical steps):")
        for i, step in enumerate(best.steps, 1):
            parts.append(f"  Step {i}: {step}")
        parts.append("")

    parts.append("All relevant facts:")
    for src in pruned_sources:
        parts.append(f"  - {src}")

    if len(chains) > 1:
        parts.append(f"\n({len(chains) - 1} alternative chain(s) also found)")

    return "\n".join(parts)
