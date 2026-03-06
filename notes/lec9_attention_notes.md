# Lecture 9: The Attention Mechanism — Study Notes

> Extracted from `Lec9_Attention.pptm` with connections to our Neurosymbolic GraphRAG project.

---

## 1. Why Attention Exists

**The core problem:** Words have different meanings depending on context.

- "This bird is a **crane**." → animal
- "They needed a **crane** to lift the object." → machine

A model needs to *look at the other words* (attend to them) to resolve ambiguity. This is exactly what the attention mechanism does: at every time step, it builds a **context vector** by weighting the importance of every other token in the sequence.

**Key insight:** This is how we interpret language as humans — we constantly re-read surrounding words to pin down meaning.

---

## 2. Embeddings — How Computers See Words

Each token (word) gets mapped to a **dense vector** via a learned **embedding matrix**.

| Model | Embedding Dimensions | Vocab Size |
|-------|---------------------|------------|
| GPT-2 | 768 | ~50,257 |
| GPT-3 (largest) | 12,288 | 50,257 |

**Geometric intuition:** Each word is a *point* in D-dimensional space. Directions in this space encode meaning:

```
vector("woman") - vector("man") ≈ vector("aunt") - vector("uncle")
```

That direction *encodes gender*. Other directions encode plurality, hierarchy, sentiment, etc. The higher the dimensionality, the more "qualities" the model can represent.

> **Connection to our project:** In standard RAG, retrieval uses these embedding vectors directly (feature space). Our neurosymbolic approach adds a *second layer* — the Virtual Knowledge Graph (semantic space) — on top of these embeddings. The embeddings are the "GPS coordinates"; our VKG is the "actual map with roads and traffic laws."

---

## 3. Queries, Keys, and Values (Q, K, V)

The attention mechanism uses three learned projections of the input embeddings:

| Component | Meaning | YouTube Analogy |
|-----------|---------|-----------------|
| **Query (Q)** | "What am I looking for?" | Your search: "funny cat videos" |
| **Key (K)** | "What do I have to offer?" | Each video's tags/metadata |
| **Value (V)** | "What I actually contain" | The video content itself |

Each is computed via a learned linear projection:

```
Q = E · W_Q
K = E · W_K
V = E · W_V
```

where `E` is the input embedding matrix and `W_Q`, `W_K`, `W_V` are learned weight matrices.

### How they interact — the "bank" example:

For the word **"bank"**, the Query asks: "Am I a riverbank or a financial bank?"

| Other token | Attention score (Q·K) | Why |
|-------------|----------------------|-----|
| "river" | **High** → "I'm probably a riverbank" | Strong semantic match |
| "steep" | Medium → reinforces physical terrain | Moderate match |
| "The" | **Low** → not informative | No useful signal |

---

## 4. The Attention Matrix (The Core Mechanism)

### Step 1: Compute raw attention scores

Take the **dot product** of every Query with every Key:

```
         The    ancient    gold    door
The     [ q·k    q·k      q·k     q·k  ]
ancient [ q·k    q·k      q·k     q·k  ]
gold    [ q·k    q·k      q·k     q·k  ]
door    [ q·k    q·k      q·k     q·k  ]
```

Each cell = how much token_i should attend to token_j.

### Step 2: Scale

Divide by √d_k (square root of key dimension) to prevent dot products from growing too large with high dimensions:

```
Attention(Q, K, V) = softmax(Q · K^T / √d_k) · V
```

**Why scale?** Large dot products push softmax into regions with tiny gradients → training slows/stops. Scaling keeps the variance manageable.

### Step 3: Softmax (column-wise)

Apply softmax over each column of the attention matrix. This:
- **Normalizes** scores into a probability distribution (sums to 1)
- **Emphasizes** high scores, **suppresses** low scores
- **Handles** negative values gracefully

### Step 4: Multiply by Values — THE FINAL ATTENTION MATRIX

```
Output = softmax(Q · K^T / √d_k) · V
```

The softmax-weighted attention scores are multiplied by the Value vectors. This produces a **weighted combination of all token values**, where the weights reflect how relevant each token is.

**Geometric view (Slide 30):** Each output embedding gets "nudged" in D-dimensional space by small contributions from every other token. The word "bank" near "river" gets pulled toward the meaning "riverbank" — its embedding *moves* in the direction of its contextual meaning.

```
new_embedding("bank") = original("bank") + weighted_sum(all other token values)
```

> **This is the residual connection** — the original embedding is preserved and the attention output is *added* to it.

---

## 5. Single-Head vs. Multi-Head Attention

### Single-Head
One set of Q, K, V projections → one attention pattern.

### Multi-Head Attention (MHA)
Multiple independent "heads," each learning *different* attention patterns:

```python
d_model = 512
num_heads = 16
d_k = d_model // num_heads  # = 32 per head
```

**Why multiple heads?**
1. **Diverse patterns** — one head might attend to syntactic structure, another to semantic similarity, another to positional proximity
2. **Parallel computation** — heads run simultaneously on GPU
3. **Long-range dependencies** — better captured by an ensemble of attention patterns
4. **Robustness** — less prone to overfitting to specific token relationships

### MHA Code Walkthrough (from slides)

```python
# Step 1: Linear projections
W_Q = nn.Linear(512, 512)  # Single weight matrix for all heads
Q = W_Q(E)                 # Shape: (batch, seq_len, 512)

# Step 2: Reshape into heads
Q = Q.view(batch, seq_len, 16, 32).permute(0, 2, 1, 3)
# Shape: (batch, 16_heads, seq_len, 32_per_head)

# Step 3: Scaled dot-product per head
scores = Q @ K.transpose(-2, -1) / sqrt(32)  # (1, 16, 4, 4)
weights = softmax(scores, dim=-1)
output = weights @ V                           # (1, 16, 4, 32)

# Step 4: Concatenate heads back
output = output.permute(0, 2, 1, 3).view(batch, seq_len, 512)

# Step 5: Final linear projection
final = W_O(output)  # (batch, seq_len, 512)
```

**Why the final projection (W_O)?** The concatenated heads live in "head-specific" subspaces. The final projection lets the model *blend* information across heads into a unified representation.

---

## 6. Layer Normalization and Feed-Forward Network

### Layer Norm
- Unlike batch norm (normalizes across a batch), layer norm normalizes **within a single sequence** across the embedding dimension
- Computes mean and std *per vector*
- Helps with optimization stability

### FFN (Feed-Forward Network)
```
FFN(x) = ReLU(x · W₁ + b₁) · W₂ + b₂
```
Applied independently to each token's embedding. This is where the model does "thinking" — the attention block figures out *what to look at*, the FFN figures out *what to do with it*.

---

## 7. Positional Encodings

**Problem:** Attention is permutation-invariant. If you shuffle the input tokens, the attention scores are the same (just permuted). The model has no sense of word *order*.

**Solution:** Add positional encodings to the embeddings before attention. These encode the position of each token in the sequence so the model knows "this is the 3rd word."

---

## 8. Connections to Our Neurosymbolic GraphRAG Project

This is where it gets exciting. Here's how attention connects to what we're building:

### Attention = System 1 (from our Gemini conversation)
The attention mechanism is *pattern matching* — it finds statistical associations between tokens. It's fast, parallel, and powerful, but it has no concept of logical truth. It can confidently attend to wrong information if the patterns match.

**This is exactly the limitation our project addresses.**

### The Parallel Structure

| Attention Mechanism | Our Neurosymbolic Architecture |
|--------------------|---------------------------------|
| Embeddings (feature space) | Embeddings + VKG (semantic space) |
| Q·K similarity = relevance | Entity bridging = logical connection |
| Softmax weighting | Logic engine pruning |
| Value-weighted output | Reasoning-chain-grounded retrieval |
| Attends to *statistically related* tokens | Retrieves *logically connected* propositions |

### Why Standard Attention Fails on Our Demo Query

**Query:** "At what temperature does water boil on Mount Everest?"

A transformer's attention will give high scores to:
- "water boils at 100°C" (high Q·K similarity with "water boil temperature")
- "Mount Everest is in Nepal" (high Q·K similarity with "Mount Everest")

But it **cannot** build the causal chain:
```
high altitude → low pressure → lower boiling point → ~70°C
```

...because that chain requires *logical inference*, not similarity matching. The attention matrix finds *correlations*; our logic engine finds *causation*.

### Key Takeaway for the Paper

The attention mechanism's softmax-weighted dot product is fundamentally a **similarity function in feature space**. Our contribution is adding a **reasoning function in semantic space** that can:
1. Verify logical consistency (the logic engine "vetoes" hallucinations)
2. Discover multi-hop connections (entity bridging in the VKG)
3. Ground retrieval in propositional truth, not just vector proximity

**In the language of this lecture:** Standard RAG is like attention with only Q and K (find similar things). Our neurosymbolic RAG adds the equivalent of a "logical V" — the *value* isn't just what's similar, it's what's *true and connected*.

---

## Quick Reference: The Full Attention Formula

```
Attention(Q, K, V) = softmax(Q · K^T / √d_k) · V

Where:
  Q = E · W_Q    (queries: what each token is looking for)
  K = E · W_K    (keys: what each token offers)
  V = E · W_V    (values: actual content to retrieve)
  d_k             (dimension of keys, for scaling)
  softmax         (applied column-wise, creates probability distribution)
```

### Multi-Head Version:
```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) · W_O

Where head_i = Attention(Q · W_Qi, K · W_Ki, V · W_Vi)
```
