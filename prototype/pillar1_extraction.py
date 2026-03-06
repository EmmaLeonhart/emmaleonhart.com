"""Pillar 1 — Propositional Extraction via DeepSeek-R1.

Converts natural-language sentences into structured propositions
(subject, predicate, object) with entity lists for downstream linking.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

import ollama

MODEL = "deepseek-r1:8b"

EXTRACTION_PROMPT = """\
Extract structured propositions from the following sentence.
Return a JSON object with exactly these keys:
{
  "propositions": [
    {
      "subject": "...",
      "predicate": "...",
      "object": "...",
      "qualifiers": ["..."],
      "entities": ["..."]
    }
  ]
}

Rules:
- Each proposition is one atomic fact.
- "entities" lists every noun/proper-noun mentioned.
- "qualifiers" lists conditions or modifiers (e.g. "at standard pressure").
- Keep values concise — no full sentences.

Sentence: {sentence}
"""


@dataclass
class Proposition:
    subject: str
    predicate: str
    object: str
    qualifiers: list[str] = field(default_factory=list)
    entities: list[str] = field(default_factory=list)
    source_text: str = ""

    @property
    def triple_str(self) -> str:
        return f"({self.subject} | {self.predicate} | {self.object})"


def _parse_json_response(text: str) -> list[dict]:
    """Try to extract a JSON array of propositions from LLM output."""
    # Strip <think>...</think> blocks that deepseek-r1 emits
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    text = text.strip()

    # Try direct parse
    try:
        data = json.loads(text)
        if isinstance(data, dict) and "propositions" in data:
            return data["propositions"]
        if isinstance(data, list):
            return data
    except json.JSONDecodeError:
        pass

    # Try to find JSON block in markdown fences
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1)).get("propositions", [])
        except (json.JSONDecodeError, AttributeError):
            pass

    # Try to find any JSON object in the text
    m = re.search(r"\{[^{}]*\"propositions\"[^{}]*\[.*?\]\s*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))["propositions"]
        except (json.JSONDecodeError, KeyError):
            pass

    return []


def _fallback_extract(sentence: str) -> list[dict]:
    """Regex-based fallback when LLM JSON extraction fails."""
    # Simple heuristic: split on verb-like patterns
    entities = re.findall(r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*", sentence)
    # Also grab numbers with units
    entities += re.findall(r"\d+[\d.,]*\s*(?:degrees|Celsius|kPa|meters|km)", sentence)

    return [{
        "subject": entities[0] if entities else "unknown",
        "predicate": "relates to",
        "object": entities[1] if len(entities) > 1 else "unknown",
        "qualifiers": [],
        "entities": list(set(entities)) if entities else [sentence.split()[0]],
    }]


def extract_propositions(sentence: str) -> list[Proposition]:
    """Extract propositions from a single sentence using DeepSeek-R1."""
    prompt = EXTRACTION_PROMPT.format(sentence=sentence)

    try:
        response = ollama.chat(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0.1, "num_predict": 512},
        )
        raw = response["message"]["content"]
        props_data = _parse_json_response(raw)
    except Exception as e:
        print(f"  [pillar1] LLM call failed ({e}), using fallback")
        props_data = []

    if not props_data:
        props_data = _fallback_extract(sentence)

    propositions = []
    for p in props_data:
        propositions.append(Proposition(
            subject=p.get("subject", "unknown"),
            predicate=p.get("predicate", "relates to"),
            object=p.get("object", "unknown"),
            qualifiers=p.get("qualifiers", []),
            entities=[e.lower() for e in p.get("entities", [])],
            source_text=sentence,
        ))

    return propositions


def extract_all(corpus: list[str]) -> list[Proposition]:
    """Extract propositions from every sentence in the corpus."""
    all_props: list[Proposition] = []
    for i, sentence in enumerate(corpus):
        print(f"  [pillar1] Extracting from sentence {i}: {sentence[:60]}...")
        props = extract_propositions(sentence)
        all_props.extend(props)
        for p in props:
            print(f"    -> {p.triple_str}  entities={p.entities}")
    return all_props
