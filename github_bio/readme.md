## Hi there 👋

I'm Emma. I'm building an interpretable substrate for AI: a stack of geometric tensor systems meant to be the readable alternative to opaque neural-computer runtimes, in place before the opaque version locks in. The flagship is **Topaz**, an interpretable neural computer (a GPU-native operating system) written in my own language, **Sutra**, whose programs are vector symbolic architecture (VSA) operations compiled to tensor arithmetic.

I treat this as a venture, not a side project: Sutra and Topaz are a coherent product stack with their own domains, a published paper, and working prototypes, and I'm building the company around them. Most of what I ship is driven by AI coding agents working inside my own scaffolding ([cleanvibe](https://github.com/EmmaLeonhart/cleanvibe)), with the judgment to know when to take the wheel. Since March 2026 I have been shipping at a pace I did not know I had, across dozens of repositories.

### What I'm working on

- **Topaz**: the GPU-native neuro-symbolic operating system I'm building in Sutra. The kernel, processes, and GUI run as a single differentiable tensor-op graph on the GPU, so the whole running system is one inspectable neural network. From nothing to a working v0.0 prototype (terminal, calculator, GUI) plus a hand-rolled `no_std` Rust bootloader that boots on bare metal in QEMU (PCI scan, GPU framebuffer write, long-mode transition).
- **Sutra**: my embedding-native language, public with a paper on arXiv ([arXiv:2605.20919](https://arxiv.org/abs/2605.20919)). Programs are vector symbolic architecture (VSA) operations (bind, unbind, bundle) compiled to straight-line tensor ops and round-tripped back to verifiable source. [site](https://sutra.yantraos.org) · [source](https://github.com/EmmaLeonhart/Sutra)
- **Thermodynamic computing**: early but measured experiments mapping Sutra's VSA operations onto a thermodynamic (thrml) sampling substrate. Associative memory, content-addressable retrieval, and bind/unbind all run as energy-based sampling on the hardware model, with measured recovery numbers rather than a sketch.
- **cleanvibe**: the open-source scaffolding underneath all of it. The docs, queue, and devlog conventions an AI coding agent works inside to stay on-task and self-documenting across long sessions. [source](https://github.com/EmmaLeonhart/cleanvibe)

### Find me

- **Website** (canonical home for projects, research, and interactive tools): https://emmaleonhart.com
- **LinkedIn**: https://www.linkedin.com/in/emmahleonhart/
- **Google Scholar**: https://scholar.google.com/citations?user=kiJ9hGYAAAAJ
- **More projects** (Loka, QueryKey, Alignment, Latent Space Cartography, Reservoir): https://emmaleonhart.com/projects/

### Programming Languages

**Know well:**

[![Rust][Rust]][Rust-url]
[![C#][CSharp]][CSharp-url]
[![Python][Python]][Python-url]
[![CUDA][CUDA]][CUDA-url]
[![TypeScript][TypeScript]][TypeScript-url]

**Working knowledge:**

[![OCaml][OCaml]][OCaml-url]
[![F#][FSharp]][FSharp-url]
[![Haskell][Haskell]][Haskell-url]
[![Lean][Lean]][Lean-url]
[![PHP][PHP]][PHP-url]
[![Lisp][Lisp]][Lisp-url]

### Frameworks & tools

[![PyTorch][PyTorch]][PyTorch-url]
[![Hugging Face][HuggingFace]][HuggingFace-url]
[![LaTeX][LaTeX]][LaTeX-url]

### Semantic web

[![SPARQL][SPARQL]][SPARQL-url]
[![RDF][RDF]][RDF-url]
[![Wikidata][Wikidata]][Wikidata-url]

---

[Protege]: https://img.shields.io/badge/Protégé-8CAAE6?style=for-the-badge&logo=stanford&logoColor=white
[Protege-url]: https://protege.stanford.edu/
[Wikidata]: https://img.shields.io/badge/Wikidata-990000?style=for-the-badge&logo=wikidata&logoColor=white
[Wikidata-url]: https://www.wikidata.org/
[RDF]: https://img.shields.io/badge/RDF-005A9C?style=for-the-badge&logo=w3c&logoColor=white
[RDF-url]: https://www.w3.org/RDF/
[OWL]: https://img.shields.io/badge/OWL2-FFD700?style=for-the-badge&logo=w3c&logoColor=black
[OWL-url]: https://www.w3.org/TR/owl2-overview/
[SPARQL]: https://img.shields.io/badge/SPARQL-336699?style=for-the-badge&logo=semantic-web&logoColor=white
[SPARQL-url]: https://www.w3.org/TR/sparql11-query/
[Jena]: https://img.shields.io/badge/Apache_Jena-602E83?style=for-the-badge&logo=apache&logoColor=white
[Jena-url]: https://jena.apache.org/
[CSharp]: https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white
[CSharp-url]: https://learn.microsoft.com/en-us/dotnet/csharp/
[Python]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Rust]: https://img.shields.io/badge/Rust-CE422B?style=for-the-badge&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
[CUDA]: https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white
[CUDA-url]: https://developer.nvidia.com/cuda-zone
[OCaml]: https://img.shields.io/badge/OCaml-EC6813?style=for-the-badge&logo=ocaml&logoColor=white
[OCaml-url]: https://ocaml.org/
[FSharp]: https://img.shields.io/badge/F%23-378BBA?style=for-the-badge&logo=fsharp&logoColor=white
[FSharp-url]: https://fsharp.org/
[Haskell]: https://img.shields.io/badge/Haskell-5D4F85?style=for-the-badge&logo=haskell&logoColor=white
[Haskell-url]: https://www.haskell.org/
[PHP]: https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white
[PHP-url]: https://www.php.net/
[Lisp]: https://img.shields.io/badge/Lisp-000000?style=for-the-badge&logo=commonlisp&logoColor=white
[Lisp-url]: https://lisp-lang.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Lean]: https://img.shields.io/badge/Lean_4-2C3E50?style=for-the-badge&logoColor=white
[Lean-url]: https://leanprover.github.io/
[PyTorch]: https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white
[PyTorch-url]: https://pytorch.org/
[HuggingFace]: https://img.shields.io/badge/Hugging%20Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black
[HuggingFace-url]: https://huggingface.co/
[LaTeX]: https://img.shields.io/badge/LaTeX-008080?style=for-the-badge&logo=latex&logoColor=white
[LaTeX-url]: https://www.latex-project.org/
[Go]: https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white
[Go-url]: https://go.dev/
[AzureDevOps]: https://img.shields.io/badge/Azure_DevOps-0078D7?style=for-the-badge&logo=azure-devops&logoColor=white
[AzureDevOps-url]: https://azure.microsoft.com/en-us/products/devops/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[K8s]: https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white
[K8s-url]: https://kubernetes.io/
[OpenClaw]: https://img.shields.io/badge/OpenClaw-FF4500?style=for-the-badge&logo=github&logoColor=white
[OpenClaw-url]: https://github.com/OpenClaw/OpenClaw
[SQLite]: https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/
[SQL]: https://img.shields.io/badge/SQL-CC2927?style=for-the-badge&logo=sqlite&logoColor=white
[SQL-url]: https://en.wikipedia.org/wiki/SQL
[MongoDB]: https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
[CosmosDB]: https://img.shields.io/badge/Cosmos%20DB-008AD7?style=for-the-badge&logo=azure-cosmos-db&logoColor=white
[CosmosDB-url]: https://azure.microsoft.com/en-us/products/cosmos-db/
[GraphDB]: https://img.shields.io/badge/GraphDB-FFD43B?style=for-the-badge&logo=ontotext&logoColor=black
[GraphDB-url]: https://graphdb.ontotext.com/
