"""Semantic Topology Visualization — Voronoi tessellation of embedding space.

Instead of plotting concepts as points, this constructs a Voronoi diagram
on the 2D projection (gender × "is cute" axes), showing the *region* each
concept owns. Cell area directly encodes semantic loadedness:
  - Large cells = underloaded (sparse, generic)
  - Small cells = overloaded (dense, crammed)

This mirrors how softmax partitions logit space into decision regions.

Uses ~150+ diverse items to build a representative topology.
"""

import json
import sys
import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from matplotlib.collections import PatchCollection
from scipy.spatial import Voronoi
import matplotlib.colors as mcolors

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from prototype.pillar2_mapping import embed_texts


def normalize(v):
    norm = np.linalg.norm(v)
    return v / norm if norm > 1e-10 else v


def compute_axes():
    """Compute gender and 'is cute' axes."""
    # Gender axis
    gender_vecs = embed_texts(["woman", "man"])
    gender_axis = normalize(gender_vecs[0] - gender_vecs[1])

    # "Is cute" transformation axis
    nouns = ["cat", "dog", "baby", "flower", "bird", "rabbit", "frog", "rock"]
    bare_vecs = embed_texts(nouns)
    prop_vecs = embed_texts([f"The {n} is cute" for n in nouns])
    cute_axis = normalize(np.mean(prop_vecs - bare_vecs, axis=0))

    dot = float(np.dot(gender_axis, cute_axis))
    print(f"  Axis orthogonality: dot = {dot:.4f}")
    return gender_axis, cute_axis


def build_dense_word_set():
    """Build a dense, diverse set spanning the full embedding landscape.

    Categories:
      gendered     - words with clear gender association
      cute         - things commonly described as cute
      neutral      - generic, content-poor words
      abstract     - abstract concepts
      nature       - natural world terms
      technical    - scientific/technical terms
      action       - verbs and action phrases
      emotion      - emotional/affective terms
      prop_cute    - "X is cute" propositions
      prop_strong  - "X is strong/powerful" propositions
      prop_complex - multi-clause complex propositions
      prop_neutral - simple neutral propositions
    """
    items = [
        # === GENDERED TERMS ===
        ("man", "man", "gendered"),
        ("woman", "woman", "gendered"),
        ("king", "king", "gendered"),
        ("queen", "queen", "gendered"),
        ("prince", "prince", "gendered"),
        ("princess", "princess", "gendered"),
        ("boy", "boy", "gendered"),
        ("girl", "girl", "gendered"),
        ("husband", "husband", "gendered"),
        ("wife", "wife", "gendered"),
        ("father", "father", "gendered"),
        ("mother", "mother", "gendered"),
        ("son", "son", "gendered"),
        ("daughter", "daughter", "gendered"),
        ("uncle", "uncle", "gendered"),
        ("aunt", "aunt", "gendered"),
        ("gentleman", "gentleman", "gendered"),
        ("lady", "lady", "gendered"),
        ("bachelor", "bachelor", "gendered"),
        ("bride", "bride", "gendered"),

        # === CUTE / AFFECTIVE ENTITIES ===
        ("puppy", "puppy", "cute"),
        ("kitten", "kitten", "cute"),
        ("bunny", "bunny", "cute"),
        ("duckling", "duckling", "cute"),
        ("teddy bear", "teddy bear", "cute"),
        ("baby", "baby", "cute"),
        ("lamb", "lamb", "cute"),
        ("hamster", "hamster", "cute"),
        ("butterfly", "butterfly", "cute"),
        ("fawn", "fawn", "cute"),
        ("panda", "panda", "cute"),
        ("otter", "otter", "cute"),
        ("penguin", "penguin", "cute"),
        ("chipmunk", "chipmunk", "cute"),
        ("cupcake", "cupcake", "cute"),

        # === NEUTRAL / GENERIC ===
        ("rock", "rock", "neutral"),
        ("mountain", "mountain", "neutral"),
        ("desk", "desk", "neutral"),
        ("salt", "salt", "neutral"),
        ("concrete", "concrete", "neutral"),
        ("gravel", "gravel", "neutral"),
        ("thing", "thing", "neutral"),
        ("object", "object", "neutral"),
        ("table", "table", "neutral"),
        ("wall", "wall", "neutral"),
        ("floor", "floor", "neutral"),
        ("pipe", "pipe", "neutral"),
        ("wire", "wire", "neutral"),
        ("bolt", "bolt", "neutral"),
        ("slab", "slab", "neutral"),
        ("brick", "brick", "neutral"),
        ("beam", "beam", "neutral"),
        ("post", "post", "neutral"),
        ("block", "block", "neutral"),
        ("plate", "plate", "neutral"),

        # === ABSTRACT CONCEPTS ===
        ("justice", "justice", "abstract"),
        ("democracy", "democracy", "abstract"),
        ("entropy", "entropy", "abstract"),
        ("algorithm", "algorithm", "abstract"),
        ("freedom", "freedom", "abstract"),
        ("truth", "truth", "abstract"),
        ("infinity", "infinity", "abstract"),
        ("logic", "logic", "abstract"),
        ("causality", "causality", "abstract"),
        ("probability", "probability", "abstract"),
        ("consciousness", "consciousness", "abstract"),
        ("morality", "morality", "abstract"),

        # === NATURE ===
        ("ocean", "ocean", "nature"),
        ("forest", "forest", "nature"),
        ("river", "river", "nature"),
        ("volcano", "volcano", "nature"),
        ("glacier", "glacier", "nature"),
        ("thunder", "thunder", "nature"),
        ("sunset", "sunset", "nature"),
        ("meadow", "meadow", "nature"),
        ("coral", "coral", "nature"),
        ("moss", "moss", "nature"),
        ("eagle", "eagle", "nature"),
        ("wolf", "wolf", "nature"),
        ("bear", "bear", "nature"),
        ("shark", "shark", "nature"),
        ("snake", "snake", "nature"),

        # === TECHNICAL / SCIENTIFIC ===
        ("mitochondria", "mitochondria", "technical"),
        ("photosynthesis", "photosynthesis", "technical"),
        ("electrode", "electrode", "technical"),
        ("transistor", "transistor", "technical"),
        ("genome", "genome", "technical"),
        ("catalyst", "catalyst", "technical"),
        ("isotope", "isotope", "technical"),
        ("polymer", "polymer", "technical"),
        ("wavelength", "wavelength", "technical"),
        ("centrifuge", "centrifuge", "technical"),

        # === ACTIONS / VERBS ===
        ("running", "running", "action"),
        ("fighting", "fighting", "action"),
        ("cooking", "cooking", "action"),
        ("building", "building", "action"),
        ("singing", "singing", "action"),
        ("dancing", "dancing", "action"),
        ("destroying", "destroying", "action"),
        ("healing", "healing", "action"),

        # === EMOTIONS ===
        ("love", "love", "emotion"),
        ("anger", "anger", "emotion"),
        ("joy", "joy", "emotion"),
        ("grief", "grief", "emotion"),
        ("fear", "fear", "emotion"),
        ("wonder", "wonder", "emotion"),
        ("tenderness", "tenderness", "emotion"),
        ("rage", "rage", "emotion"),

        # === "X IS CUTE" PROPOSITIONS ===
        ("The kitten is cute", "The kitten is cute", "prop_cute"),
        ("The puppy is cute", "The puppy is cute", "prop_cute"),
        ("The woman is cute", "The woman is cute", "prop_cute"),
        ("The baby is cute", "The baby is cute", "prop_cute"),
        ("The bunny is cute", "The bunny is cute", "prop_cute"),
        ("The duckling is cute", "The duckling is cute", "prop_cute"),
        ("The hamster is cute", "The hamster is cute", "prop_cute"),
        ("The lamb is cute", "The lamb is cute", "prop_cute"),
        ("The panda is cute", "The panda is cute", "prop_cute"),
        ("The penguin is cute", "The penguin is cute", "prop_cute"),

        # === STRENGTH/POWER PROPOSITIONS ===
        ("The man is strong", "The man is strong", "prop_strong"),
        ("The king is powerful", "The king is powerful", "prop_strong"),
        ("The queen is powerful", "The queen is powerful", "prop_strong"),
        ("The warrior is strong", "The warrior is strong", "prop_strong"),
        ("The wolf is fierce", "The wolf is fierce", "prop_strong"),
        ("The eagle is majestic", "The eagle is majestic", "prop_strong"),
        ("The bear is dangerous", "The bear is dangerous", "prop_strong"),
        ("The storm is powerful", "The storm is powerful", "prop_strong"),

        # === NEUTRAL PROPOSITIONS ===
        ("The rock is heavy", "The rock is heavy", "prop_neutral"),
        ("The table is flat", "The table is flat", "prop_neutral"),
        ("The wall is tall", "The wall is tall", "prop_neutral"),
        ("The water is cold", "The water is cold", "prop_neutral"),
        ("The sky is blue", "The sky is blue", "prop_neutral"),
        ("The road is long", "The road is long", "prop_neutral"),

        # === COMPLEX PROPOSITIONS ===
        ("De-icing salts cause\ncorrosion of bridges",
         "De-icing salts applied to road surfaces cause corrosion of reinforced concrete bridge decks",
         "prop_complex"),
        ("The adorable puppy\nchased the butterfly",
         "The adorable golden retriever puppy chased the iridescent butterfly through the sunlit meadow",
         "prop_complex"),
        ("Monetary policy affects\ninflation expectations",
         "Central bank monetary policy decisions affect long-term inflation expectations through forward guidance mechanisms",
         "prop_complex"),
        ("Mitochondrial mutations\ncause neurodegeneration",
         "Mitochondrial DNA mutations in the electron transport chain cause progressive neurodegenerative disease",
         "prop_complex"),
        ("Ocean acidification\nthreatens coral reefs",
         "Rising atmospheric carbon dioxide concentrations drive ocean acidification which threatens calcifying organisms in coral reef ecosystems",
         "prop_complex"),
        ("Antibiotic resistance\nspreads via plasmids",
         "Horizontal gene transfer via conjugative plasmids accelerates the spread of antibiotic resistance genes across bacterial species",
         "prop_complex"),
        ("Glacial melt raises\nsea levels globally",
         "Accelerating glacial melt from the Greenland and Antarctic ice sheets contributes to global sea level rise threatening coastal communities",
         "prop_complex"),
        ("Deforestation reduces\ncarbon sequestration",
         "Tropical deforestation reduces terrestrial carbon sequestration capacity while simultaneously releasing stored carbon into the atmosphere",
         "prop_complex"),
    ]
    return items


def voronoi_finite_polygons_2d(vor, radius=None):
    """Reconstruct infinite Voronoi regions as finite polygons.

    Adapted from scipy docs — clips infinite regions to a bounding box.
    """
    if vor.points.shape[1] != 2:
        raise ValueError("Requires 2D input")

    new_regions = []
    new_vertices = vor.vertices.tolist()

    center = vor.points.mean(axis=0)
    if radius is None:
        radius = vor.points.ptp(axis=0).max() * 2

    # Construct a map from ridge_point pairs to ridge_vertices
    all_ridges = {}
    for (p1, p2), (v1, v2) in zip(vor.ridge_points, vor.ridge_vertices):
        all_ridges.setdefault(p1, []).append((p2, v1, v2))
        all_ridges.setdefault(p2, []).append((p1, v1, v2))

    for p1, region_idx in enumerate(vor.point_region):
        vertices = vor.regions[region_idx]

        if all(v >= 0 for v in vertices):
            # Finite region
            new_regions.append(vertices)
            continue

        # Reconstruct infinite region
        ridges = all_ridges.get(p1, [])
        new_region = [v for v in vertices if v >= 0]

        for p2, v1, v2 in ridges:
            if v2 < 0:
                v1, v2 = v2, v1
            if v1 >= 0:
                continue

            # Compute far point for infinite ridge
            t = vor.points[p2] - vor.points[p1]
            t /= np.linalg.norm(t)
            n = np.array([-t[1], t[0]])  # normal

            midpoint = vor.points[[p1, p2]].mean(axis=0)
            direction = np.sign(np.dot(midpoint - center, n)) * n
            far_point = vor.vertices[v2] + direction * radius

            new_region.append(len(new_vertices))
            new_vertices.append(far_point.tolist())

        # Sort region vertices by angle
        vs = np.asarray([new_vertices[v] for v in new_region])
        c = vs.mean(axis=0)
        angles = np.arctan2(vs[:, 1] - c[1], vs[:, 0] - c[0])
        new_region = [new_region[i] for i in np.argsort(angles)]

        new_regions.append(new_region)

    return new_regions, np.asarray(new_vertices)


def run_topology():
    """Main topology pipeline."""
    print("=" * 60)
    print("SEMANTIC TOPOLOGY VISUALIZATION")
    print("Voronoi tessellation: gender × 'is cute' axes")
    print("=" * 60)

    # Compute axes
    print("\n[1/4] Computing projection axes...")
    gender_axis, cute_axis = compute_axes()

    # Build and embed
    print("\n[2/4] Embedding dense word set...")
    items = build_dense_word_set()
    texts = [item[1] for item in items]
    print(f"  {len(texts)} items to embed...")
    embeddings = embed_texts(texts)
    print(f"  Done. Shape: {embeddings.shape}")

    # Project
    print("\n[3/4] Projecting onto 2D plane...")
    x_coords = embeddings @ cute_axis
    y_coords = embeddings @ gender_axis

    points = np.column_stack([x_coords, y_coords])

    # Collect results
    results = []
    for i, (label, text, category) in enumerate(items):
        results.append({
            "label": label,
            "text": text,
            "category": category,
            "x_cute": float(x_coords[i]),
            "y_gender": float(y_coords[i]),
        })

    # Save results
    results_path = os.path.join(os.path.dirname(__file__), "semantic_topology_results.json")
    with open(results_path, "w") as f:
        json.dump({
            "n_items": len(items),
            "items": results,
        }, f, indent=2)
    print(f"  Results saved to {results_path}")

    # Step 4: Voronoi plots
    print("\n[4/4] Generating Voronoi topology...")
    plot_voronoi(results, points)

    # Print cell area statistics
    print("\n" + "=" * 60)
    print("CELL AREA ANALYSIS (proxy for semantic loadedness)")
    print("=" * 60)
    analyze_cell_areas(results, points)


def plot_voronoi(results, points):
    """Generate Voronoi tessellation colored by category."""

    category_colors = {
        "gendered":      "#E74C3C",
        "cute":          "#FF69B4",
        "neutral":       "#95A5A6",
        "abstract":      "#3498DB",
        "nature":        "#27AE60",
        "technical":     "#8E44AD",
        "action":        "#E67E22",
        "emotion":       "#F39C12",
        "prop_cute":     "#FF1493",
        "prop_strong":   "#C0392B",
        "prop_neutral":  "#7F8C8D",
        "prop_complex":  "#6C3483",
    }

    category_labels = {
        "gendered":      "Gendered words",
        "cute":          "Cute entities",
        "neutral":       "Neutral/generic",
        "abstract":      "Abstract concepts",
        "nature":        "Nature",
        "technical":     "Technical/scientific",
        "action":        "Actions",
        "emotion":       "Emotions",
        "prop_cute":     '"X is cute" propositions',
        "prop_strong":   "Strength propositions",
        "prop_neutral":  "Neutral propositions",
        "prop_complex":  "Complex propositions",
    }

    vor = Voronoi(points)
    regions, vertices = voronoi_finite_polygons_2d(vor, radius=0.3)

    # Clip to bounding box
    x_min, x_max = points[:, 0].min() - 0.08, points[:, 0].max() + 0.08
    y_min, y_max = points[:, 1].min() - 0.08, points[:, 1].max() + 0.08

    # === PLOT 1: Full topology with labels ===
    fig, ax = plt.subplots(1, 1, figsize=(20, 14))

    # Draw Voronoi cells
    for i, region in enumerate(regions):
        if not region:
            continue
        polygon = vertices[region]
        # Clip to bounding box
        polygon = np.clip(polygon, [x_min, y_min], [x_max, y_max])

        cat = results[i]["category"]
        color = category_colors.get(cat, "#CCCCCC")
        # Convert to RGBA with transparency
        rgba = list(mcolors.to_rgba(color))
        rgba[3] = 0.35

        poly_patch = Polygon(polygon, closed=True,
                             facecolor=rgba,
                             edgecolor="white",
                             linewidth=0.8)
        ax.add_patch(poly_patch)

    # Draw points and labels
    for i, r in enumerate(results):
        cat = r["category"]
        color = category_colors.get(cat, "#333333")
        ax.plot(r["x_cute"], r["y_gender"], "o",
                color=color, markersize=4,
                markeredgecolor="black", markeredgewidth=0.3,
                zorder=5)

        # Label — smaller font for dense plot
        fontsize = 5.5 if cat.startswith("prop_") else 6
        ax.annotate(r["label"],
                    (r["x_cute"], r["y_gender"]),
                    xytext=(3, 3),
                    textcoords="offset points",
                    fontsize=fontsize,
                    alpha=0.85,
                    zorder=6)

    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_min, y_max)
    ax.set_xlabel('"Is Cute" Transformation Axis →\n(low = semantically generic → high = semantically loaded)',
                  fontsize=11)
    ax.set_ylabel('← Male          Gender Axis          Female →', fontsize=11)
    ax.set_title(f'Semantic Topology: Voronoi Tessellation of Embedding Space\n'
                 f'({len(results)} concepts, mxbai-embed-large 1024-dim, projected onto gender × "is cute")',
                 fontsize=13, fontweight='bold')

    # Legend
    handles = []
    for cat, label in category_labels.items():
        color = category_colors[cat]
        handles.append(plt.Line2D([0], [0], marker='s', color='w',
                                  markerfacecolor=color, markersize=10,
                                  label=label))
    ax.legend(handles=handles, loc="upper left", fontsize=7.5, framealpha=0.9, ncol=2)

    plt.tight_layout()
    path1 = os.path.join(os.path.dirname(__file__), "semantic_topology_full.png")
    plt.savefig(path1, dpi=150, bbox_inches="tight")
    print(f"  Full topology saved to {path1}")
    plt.close()

    # === PLOT 2: Topology colored by cell AREA (loadedness heatmap) ===
    fig2, ax2 = plt.subplots(1, 1, figsize=(20, 14))

    # Compute cell areas
    cell_areas = []
    valid_polygons = []
    valid_indices = []
    for i, region in enumerate(regions):
        if not region:
            cell_areas.append(0)
            continue
        polygon = vertices[region]
        polygon = np.clip(polygon, [x_min, y_min], [x_max, y_max])

        # Shoelace formula for polygon area
        n = len(polygon)
        if n < 3:
            cell_areas.append(0)
            continue
        area = 0.5 * abs(sum(polygon[j][0] * polygon[(j+1) % n][1] -
                             polygon[(j+1) % n][0] * polygon[j][1]
                             for j in range(n)))
        cell_areas.append(area)
        valid_polygons.append(polygon)
        valid_indices.append(i)

    cell_areas = np.array(cell_areas)

    # Normalize for colormap (log scale to handle range)
    valid_areas = cell_areas[cell_areas > 0]
    log_areas = np.log10(valid_areas + 1e-6)
    norm = plt.Normalize(vmin=log_areas.min(), vmax=log_areas.max())
    cmap = plt.cm.RdYlGn_r  # Red = small (overloaded), Green = large (underloaded)

    for polygon, idx in zip(valid_polygons, valid_indices):
        area = cell_areas[idx]
        log_area = np.log10(area + 1e-6)
        color = cmap(norm(log_area))

        poly_patch = Polygon(polygon, closed=True,
                             facecolor=(*color[:3], 0.6),
                             edgecolor="white",
                             linewidth=0.5)
        ax2.add_patch(poly_patch)

    # Labels
    for i, r in enumerate(results):
        ax2.plot(r["x_cute"], r["y_gender"], "o",
                 color="black", markersize=2.5, zorder=5)
        ax2.annotate(r["label"],
                     (r["x_cute"], r["y_gender"]),
                     xytext=(3, 3),
                     textcoords="offset points",
                     fontsize=5.5,
                     alpha=0.8,
                     zorder=6)

    ax2.set_xlim(x_min, x_max)
    ax2.set_ylim(y_min, y_max)
    ax2.set_xlabel('"Is Cute" Transformation Axis →', fontsize=11)
    ax2.set_ylabel('← Male          Gender Axis          Female →', fontsize=11)
    ax2.set_title('Semantic Loadedness Heatmap: Voronoi Cell Area\n'
                  '(Red = small cells = overloaded / Green = large cells = underloaded)',
                  fontsize=13, fontweight='bold')

    # Colorbar
    sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    cbar = plt.colorbar(sm, ax=ax2, shrink=0.6, pad=0.02)
    cbar.set_label("log₁₀(cell area) — smaller = more overloaded", fontsize=9)

    plt.tight_layout()
    path2 = os.path.join(os.path.dirname(__file__), "semantic_topology_heatmap.png")
    plt.savefig(path2, dpi=150, bbox_inches="tight")
    print(f"  Heatmap saved to {path2}")
    plt.close()


def analyze_cell_areas(results, points):
    """Analyze Voronoi cell areas by category."""
    vor = Voronoi(points)
    regions, vertices = voronoi_finite_polygons_2d(vor, radius=0.3)

    x_min, x_max = points[:, 0].min() - 0.08, points[:, 0].max() + 0.08
    y_min, y_max = points[:, 1].min() - 0.08, points[:, 1].max() + 0.08

    cell_areas = []
    for i, region in enumerate(regions):
        if not region:
            cell_areas.append(0)
            continue
        polygon = vertices[region]
        polygon = np.clip(polygon, [x_min, y_min], [x_max, y_max])
        n = len(polygon)
        if n < 3:
            cell_areas.append(0)
            continue
        area = 0.5 * abs(sum(polygon[j][0] * polygon[(j+1) % n][1] -
                             polygon[(j+1) % n][0] * polygon[j][1]
                             for j in range(n)))
        cell_areas.append(area)

    cell_areas = np.array(cell_areas)

    # Per-category statistics
    categories = {}
    for i, r in enumerate(results):
        cat = r["category"]
        if cat not in categories:
            categories[cat] = []
        if cell_areas[i] > 0:
            categories[cat].append((r["label"], cell_areas[i]))

    print(f"\n{'Category':<20} {'Mean Area':>10} {'Min Area':>10} {'Max Area':>10} {'Count':>6}")
    print("-" * 60)

    cat_means = []
    for cat, items in sorted(categories.items()):
        areas = [a for _, a in items]
        if not areas:
            continue
        mean_a = np.mean(areas)
        cat_means.append((cat, mean_a))
        print(f"{cat:<20} {mean_a:>10.6f} {min(areas):>10.6f} {max(areas):>10.6f} {len(areas):>6}")

    # Sort by mean area (most overloaded first)
    print("\n--- Ranked by density (most overloaded -> most underloaded) ---")
    for cat, mean_a in sorted(cat_means, key=lambda x: x[1]):
        print(f"  {cat:<20} mean area = {mean_a:.6f}")

    # Top 10 smallest cells (most overloaded concepts)
    print("\n--- Top 10 most overloaded concepts (smallest cells) ---")
    indexed = [(cell_areas[i], results[i]["label"], results[i]["category"])
               for i in range(len(results)) if cell_areas[i] > 0]
    for area, label, cat in sorted(indexed)[:10]:
        print(f"  {label:<35} area={area:.6f}  ({cat})")

    # Top 10 largest cells (most underloaded)
    print("\n--- Top 10 most underloaded concepts (largest cells) ---")
    for area, label, cat in sorted(indexed, reverse=True)[:10]:
        print(f"  {label:<35} area={area:.6f}  ({cat})")


if __name__ == "__main__":
    run_topology()
