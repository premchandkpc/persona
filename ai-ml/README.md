# AI/ML Learning Resources

Comprehensive collection of ML fundamentals and implementations — featuring projects by [Andrej Karpathy](https://github.com/karpathy). Each project builds on the previous, forming a complete path from autodiff to modern LLMs.

---

## Projects Overview

All projects are **git submodules** pointing to the upstream repositories.

| # | Project | Core Concept | Lines | Level |
|---|---------|-------------|-------|-------|
| 1 | **Micrograd** | Autodiff & backpropagation | ~150 | Beginner |
| 2 | **Makemore** | Autoregressive models (bigram → Transformer) | ~500 | Beginner → Intermediate |
| 3 | **MinBPE** | Tokenization (Byte Pair Encoding) | ~200 | Beginner |
| 4 | **NG-Video-Lecture** | NN from first principles (Zero to Hero) | varies | Beginner |
| 5 | **Build-NanoGPT** | Step-by-step GPT construction | ~600 | Intermediate |
| 6 | **NanoGPT** | Full GPT training/finetuning | ~1000 | Intermediate |
| 7 | **Llama2.c** | LLM inference in pure C | ~1000 | Advanced |

---

## 1. Micrograd — Automatic Differentiation Engine

**Location**: `micrograd/` (standalone, not a submodule)

A scalar-level autograd engine. Every neural network operation is broken down to individual `Value` nodes that track their computational graph and compute gradients via reverse-mode autodiff.

### Architecture

```
Value (wraps float)
  ├── .data      → scalar value
  ├── .grad      → accumulated gradient
  ├── ._prev     → parent nodes in graph
  ├── ._op       → operation that created this node
  └── .backward()→ chain rule for this node

Neuron  (weights + bias → tanh)
Layer   (list of Neurons)
MLP     (list of Layers)
```

### Key Interview Questions

**Q: How does micrograd compute gradients?**
A: It builds a directed acyclic graph (DAG) during the forward pass. Each `Value` tracks its parents (`_prev`) and the operation (`_op`). When `backward()` is called, it topologically sorts the graph and applies the chain rule backward, accumulating gradients in `.grad`.

**Q: Why does the grad accumulate rather than overwrite?**
A: A node can feed into multiple downstream nodes (fan-out). The chain rule requires summing gradients from all paths (multivariate chain rule). `grad += local_grad * downstream_grad` handles this. Always call `zero_grad()` before each training step.

**Q: What happens with the tanh backward?**
A: `dtanh(x)/dx = 1 - tanh(x)^2`. In code: `out.grad += (1 - self.data**2) * grad_output`.

**Q: Why is this inefficient for real models?**
A: (1) Scalar operations only — no tensor/vector ops. (2) The Python overhead dominates. (3) No GPU support. Real frameworks use tensor-level autodiff (PyTorch, JAX) with C++/CUDA kernels.

### Tricky Points / Common Pitfalls

| Pitfall | Explanation |
|---------|-------------|
| **Grad accumulation** | Forgetting `zero_grad()` doubles gradients each iteration. Always reset before backward. |
| **In-place ops break autodiff** | If you mutate `.data` directly without rebuilding the graph, the backward pass computes wrong gradients. |
| **Graph memory** | The entire computation graph is retained until backward. For large models, this OOMs. PyTorch detaches by default after backward. |
| **Vanishing gradients** | Tanh saturates at ±1 where gradient → 0. Deep networks with tanh stop learning in early layers. |
| **Reused nodes** | If the same `Value` appears in two places in the expression, gradients accumulate from both paths. This is correct but surprises beginners. |

---

## 2. Makemore — Autoregressive Character Language Models

**Location**: `makemore/` (submodule)

Progressively builds character-level language models: **Bigram** → **MLP** → **RNN** → **Transformer**. Each step fixes a limitation of the previous.

### Architecture Progression

| Model | Context | Limitation It Fixes |
|-------|---------|---------------------|
| Bigram | 1 char | No long-range context |
| MLP | N chars (fixed window) | Fixed context window, no weight sharing |
| RNN | All previous chars (hidden state) | Vanishing gradients, sequential-only |
| Transformer | All previous chars (attention) | Quadratic compute, no positional invariance |

### Key Interview Questions

**Q: Why does the MLP use embedding tables rather than one-hot vectors?**
A: One-hot vectors are sparse (vocab_size dimensions) and don't capture similarity between characters. Embeddings are learned, dense, low-dimensional vectors where similar characters have similar representations. This is the first critical insight in modern NLP.

**Q: Why does the RNN suffer from vanishing gradients?**
A: The same weight matrix `Whh` is applied at every timestep. The gradient backpropagates through repeated multiplication by `Whh`. If its eigenvalues < 1, gradients vanish exponentially with sequence length. If > 1, they explode. This is the fundamental motivation for attention mechanisms.

**Q: How does the makemore Transformer differ from the standard GPT?**
A: Same core (self-attention + feedforward + positional encoding), but simplified: no layer norm pre-fix, single head, no bias in attention, learned positional embeddings instead of sinusoidal.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Negative log-likelihood loss** | Cross-entropy loss expects raw logits, not softmax outputs. Applying softmax then log then cross-entropy computes `log(softmax(x))` which is numerically unstable. Use `F.cross_entropy()` which does `log_softmax` + `nll_loss` in one fused kernel. |
| **Label smoothing** | Hard targets (0/1) can cause overconfident models with infinite logits. Label smoothing replaces hard targets with soft targets (e.g., 0.9 / 0.1/vocab). |
| **Training/test loss divergence** | If training loss keeps decreasing but val loss increases, you're overfitting. Reduce model size, add dropout, or increase data. |
| **Embedding dimension too large** | For small datasets, large embeddings memorize the training set. Start small (e.g., 10-30 dims for characters). |

---

## 3. MinBPE — Byte Pair Encoding Tokenizer

**Location**: `minbpe/` (submodule)

Clean implementation of OpenAI's GPT tokenizer. BPE is the algorithm that converts raw text into token IDs — the first step in any LLM pipeline.

### How BPE Works

1. Start with bytes as tokens (256 tokens)
2. Count adjacent token pairs, merge the most frequent pair into a new token
3. Repeat until desired vocabulary size is reached
4. The merge rules form a deterministic encoding

### Key Interview Questions

**Q: Why BPE instead of word-level tokenization?**
A: Word-level gives OOV (out-of-vocabulary) for misspellings, rare words, and compound words. BPE can represent any text via subword units. "unbelievable" → ["un", "believ", "able"]. Unknown words are decomposed into known byte-level pieces.

**Q: What happens to whitespace in BPE?**
A: GPT tokenizers use a regex pre-tokenizer (`GPT4_SPLIT_PATTERN`) that splits on whitespace boundaries but preserves the space as part of the word. This prevents tokens that cross word boundaries.

**Q: Why does the GPT-4 tokenizer have special regex patterns?**
A: The pattern `'(?i:'s|'t|'re|'ve|'m|'ll|'d)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+'` handles English contractions as single units and groups digits separately. This dramatically improves encoding efficiency for code and numbers.

**Q: How does the tokenizer handle Unicode?**
A: Bytes → Unicode via the `chars_to_bytes` mapping. Each Unicode code point is decomposed into 1-4 raw bytes. BPE merges at the byte level, so any Unicode character can be represented.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Regex pre-tokenization differences** | GPT-2 and GPT-4 use different split patterns. The same BPE merges produce different tokenizations with different pre-tokenizers. |
| **Merge order sensitivity** | BPE merges are greedy and order-dependent. A different merge order (from different data) gives completely different tokens. |
| **Tokenizer ↔ model coupling** | You cannot swap tokenizers between models. A model trained with GPT-2 tokenizer expects GPT-2 token IDs. |
| **Byte-level vs Unicode-level BPE** | SentencePiece does BPE on Unicode code points directly (no bytes). Performance is similar but byte-level handles arbitrary Unicode without OOV. |

---

## 4. NG-Video-Lecture — Neural Networks: Zero to Hero

**Location**: `ng-video-lecture/` (submodule)

Companion code for Karpathy's lecture series. Starts from micrograd-level autodiff and builds up to modern architectures through video-guided coding sessions.

### Lecture Map

| Lecture | Topic | Key Takeaway |
|---------|-------|-------------|
| 1 | Building micrograd | Backprop from scratch |
| 2 | Making makemore (MLP) | Embeddings, multi-layer classification |
| 3 | Activations & gradients | Tanh saturation, batch norm, weight init |
| 4 | Manual backprop | Backprop through cross-entropy, batch norm |
| 5 | Building a WaveNet | Dilated convolutions, residual connections |
| 6 | GPT from scratch | Self-attention, transformer blocks |

### Key Interview Questions

**Q: Why does Kaiming initialization matter?**
A: If weights are too large, activations saturate tanh/ReLU. If too small, signals vanish. Kaiming init scales weights as `randn * sqrt(2/fan_in)` which preserves variance through ReLU layers. Without it, deep networks fail to train.

**Q: Why does batch norm help?**
A: It normalizes layer outputs to mean 0, var 1 (per channel). This keeps activations in the non-saturated regime of tanh, prevents internal covariate shift, and allows higher learning rates. During training, it uses batch statistics; during inference, running averages.

**Q: What is the difference between LayerNorm and BatchNorm?**
A: BatchNorm normalizes across the batch dimension (same feature, different examples). LayerNorm normalizes across the feature dimension (same example, different features). LayerNorm is preferred for transformers because it behaves identically at train and test time and works with variable-length sequences.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Weight init + activation mismatch** | Kaiming init is for ReLU. Xavier/Glorot init is for tanh. Using the wrong pair causes gradient explosion/vanishing. |
| **Batch norm at inference** | Must use running mean/var, not batch stats. A batch of 1 at inference gives degenerate normalization. |
| **Gradient clipping** | Essential for RNNs. Clip gradients to a max norm (e.g., 1.0) to prevent explosion from repeated weight multiplication. |

---

## 5. Build-NanoGPT — Building GPT from Scratch

**Location**: `build-nanogpt/` (submodule)

Walks through constructing nanoGPT cell by cell, following Karpathy's "Let's build GPT from scratch" video. Starts with a bigram model and gradually adds attention, multi-head, feedforward, and residual connections.

### Architecture Build Steps

1. **Bigram model** — simply predicts next token via a token embedding lookup
2. **Self-attention** — tokens communicate via weighted average of values
3. **Multi-head attention** — multiple attention patterns in parallel
4. **Feedforward layer** — per-token MLP for learned transformations
5. **Residual connections** — `x + layer(x)` enables deep networks
6. **Layer normalization** — stabilizes training
7. **Full transformer block** — repeat N times for depth

### Key Interview Questions

**Q: What problem does self-attention solve that RNNs don't?**
A: (1) **Parallelization** — RNNs process tokens sequentially; attention processes all tokens at once. (2) **Long-range dependencies** — RNN gradients vanish over distance; attention has direct connections between any pair of tokens.

**Q: Why does attention use Q, K, V?**
A: The query-key-value analogy comes from information retrieval. Each token produces a **query** (what do I want?), a **key** (what do I have?), and a **value** (what do I share?). Attention computes similarity (Q·K) to weight how much value to take from each token.

**Q: Why scale attention by `1/sqrt(d_k)`?**
A: The dot product grows large with dimension (mean ≈ d_k, variance ≈ d_k for unit vectors). Large dot products push softmax into regions with tiny gradients (almost one-hot). Scaling by `1/sqrt(d_k)` keeps the variance ≈ 1, maintaining gradient flow.

**Q: Why causal masking (triangular mask)?**
A: In language modeling, a token should only attend to previous tokens (it cannot see the future). The upper triangle of the attention matrix is set to -inf before softmax, so future tokens get 0 attention weight.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Attention without masking** | Forgetting the causal mask lets the model cheat by looking at future tokens. Training loss drops fast but generation is garbage. |
| **Positional encoding type** | Learned vs sinusoidal. Sinusoidal can extrapolate to longer sequences; learned cannot. GPT uses learned embeddings. |
| **Residual connection order** | Pre-norm (LayerNorm inside residual path) vs post-norm (LayerNorm after residual). Pre-norm is more stable and allows training without warmup. GPT uses pre-norm. |
| **Weight tying** | The embedding layer and the output projection layer can share weights (`lm_head.weight = tok_emb.weight`). This reduces parameters and often improves performance. |

---

## 6. NanoGPT — Full GPT Training & Finetuning

**Location**: `nanoGPT/` (submodule)

Production-style GPT implementation in PyTorch. Supports training from scratch, finetuning, and inference. The model is a decoder-only transformer matching GPT-2 architecture.

### Architecture Details

```
GPT (decoder-only)
├── wte — token embeddings (vocab_size × n_embd)
├── wpe — positional embeddings (block_size × n_embd)
├── blocks × n_layer
│   ├── ln_1 → attn (causal self-attention)
│   ├── ln_2 → mlp  (feedforward: 4× expansion + GeLU)
│   └── residual connections
├── ln_f — final layer norm
└── lm_head — projection to vocab logits
```

### Key Interview Questions

**Q: What is the difference between training and finetuning in nanoGPT?**
A: Training: random init, large learning rate, many epochs, large dataset. Finetuning: load pretrained weights, lower learning rate (1e-5 vs 3e-4), smaller dataset, often freeze early layers.

**Q: How does nanoGPT handle variable-length sequences?**
A: All sequences are padded/cropped to `block_size` (e.g., 1024). The loss is masked so padding tokens don't contribute. During generation, the context window slides: generate one token, append to context, truncate to `block_size`.

**Q: What is the role of the `config` object?**
A: It cleanly separates hyperparameters from code. Model config (`n_layer`, `n_head`, `n_embd`, `block_size`) defines architecture. Training config (`learning_rate`, `batch_size`, `gradient_accumulation_steps`) defines optimization.

**Q: Why `gradient_accumulation_steps`?**
A: GPUs have limited memory for batch size. By accumulating gradients over multiple forward/backward passes before stepping the optimizer, we simulate a larger effective batch size. `effective_batch = micro_batch × grad_accum_steps`.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Learning rate schedule** | GPT training uses cosine decay with warmup. Starting with too high LR causes divergence; too low converges slowly. Warmup (linear increase) stabilizes early training. |
| **Overfitting on small data** | nanoGPT on tiny datasets (e.g., Shakespeare) must heavily regularize. Use dropout (0.1-0.2), smaller model, more epochs, and weight decay. |
| **Precision** | Mixed precision (FP16/BF16) speeds up training 2× but can cause underflow. Gradient scaling and loss scaling are essential. |
| **Generation temperature** | `temperature=0` is greedy (deterministic), `temperature=1` is the trained distribution, `temperature>1` flattens (more random). Above ~1.5, output becomes gibberish. |
| **Top-k / top-p sampling** | Top-k cuts the tail of low-probability tokens; top-p (nucleus) cuts until cumulative prob > p. Top-p adapts better to different contexts. |

---

## 7. Llama2.c — LLM Inference in Pure C

**Location**: `llama2.c/` (submodule)

Inference of Meta's Llama 2 models in a single ~1000-line C file. No external dependencies — just `stdio.h`, `stdlib.h`, `math.h`, `string.h`. Demonstrates that LLM inference is fundamentally simple math.

### Architecture

```
Transformer (same as GPT, decoder-only)
├── token_embedding_table
├── blocks × n_layers
│   ├── rms_norm → wq, wk, wv → attention
│   ├── rms_norm → w1, w2, w3 → feedforward (SwiGLU)
│   └── residual connections
├── rms_norm → final projection
└── sampler (softmax + temperature)
```

**Key difference from GPT**: Llama 2 uses **SwiGLU** activation (instead of GeLU) and **RMSNorm** (instead of LayerNorm). RMSNorm is LayerNorm without the mean subtraction — simpler and faster.

### Key Interview Questions

**Q: How does the C code load a PyTorch checkpoint?**
A: The checkpoint is serialized as a flat binary file of floats. The C code `mmap`s the file and reads the header (config), then maps float pointers to the correct model weight arrays. This avoids any JSON/protobuf parsing.

**Q: What is KV-caching and why does it matter?**
A: During generation, each token's K and V vectors are cached between steps. Without caching, attention recomputes for all previous tokens every time (O(n²) per step). With caching, we only compute for the new token (O(n) per step). This is the single most important optimization for LLM inference.

**Q: How does the quantized inference work?**
A: Weights are stored as `int8` or `int4` instead of `float32`. During matmul, they're dequantized on-the-fly: `w_real = w_quant * scale + offset`. This 4× memory reduction allows larger models to fit in RAM at the cost of minor quality degradation.

**Q: Why does the model need so much RAM?**
A: A 7B parameter model with float32 weights requires 7B × 4 bytes = 28 GB just for weights. Plus KV-cache (n_layers × n_heads × seq_len × 2 × sizeof(float)) and intermediate activations. Quantized (int8) cuts this to ~7 GB.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **Endianness** | The binary checkpoint must match the machine's byte order. x86 is little-endian; network formats are big-endian. |
| **RMSNorm vs LayerNorm** | RMSNorm is `x / sqrt(mean(x²)) * weight` without centering. In Llama2, the RMSNorm weight is stored per channel. |
| **RoPE (Rotary Position Embeddings)** | Llama 2 uses RoPE instead of learned positional embeddings. RoPE applies a rotation to Q and K based on position. The rotation frequency decreases with dimension (longer wavelengths for higher dims). |
| **SwiGLU activation** | `SwiGLU(x) = sigmoid(x_w1) * x_w3 * x_w2`. This uses 3 weight matrices instead of 2 for the feedforward layer. The hidden dimension is 2/3 of the standard 4× expansion. |
| **Memory bandwidth bottleneck** | Inference is memory-bound, not compute-bound. The GPU/CPU spends most time loading weights from RAM. This is why quantization helps more than architectural changes for speed. |
| **Thread safety** | Multi-threaded generation requires separate KV-cache per thread. The model weights (read-only) can be shared. |

---

## Interview Preparation Guide

### Core Concepts (Must-Know for Any ML Interview)

| Concept | Key Insight |
|---------|-------------|
| **Backpropagation** | Chain rule applied to computational DAG. Reverse-mode autodiff computes all gradients in O(n) where n = # nodes. |
| **Vanishing/exploding gradients** | Repeated matrix multiplication causes exponential growth/decay. Fix: proper init (Kaiming/Xavier), normalization (batch/layer norm), residual connections, gradient clipping. |
| **Attention mechanism** | QKV analogy from retrieval. Scaled dot-product attention. Causal masking for autoregressive models. |
| **Transformer architecture** | Decoder-only (GPT) vs encoder-decoder (T5) vs encoder-only (BERT). Pre-norm vs post-norm. |
| **Tokenization** | BPE merges frequent byte pairs. WordPiece merges frequent character sequences. SentencePiece treats input as raw Unicode. |
| **Training vs inference** | Training: forward + backward + optimizer step, uses batch stats for normalization. Inference: forward only, uses running stats, caching (KV-cache). |
| **Overfitting** | Model memorizes training data. Fixes: more data, regularization (dropout, weight decay), smaller model, early stopping, data augmentation. |

### Common Interview Questions by Project

**Micrograd:**
- Explain backpropagation to a non-technical interviewer
- Walk through computing the gradient of `(a*b + c)` step by step
- What is the difference between autograd and symbolic differentiation?
- Why is reverse-mode autodiff preferred for neural networks?

**Makemore:**
- How does an embedding layer work? Why use it instead of one-hot?
- Explain the vanishing gradient problem in RNNs
- Compare RNN, LSTM, GRU, and Transformer for sequence modeling

**MinBPE:**
- Why can't we just use word-level tokenization?
- How does the tokenizer handle a completely new word?
- What happens when you change the tokenizer of a trained model?

**Build-NanoGPT / NanoGPT:**
- Walk through the forward pass of a transformer block
- Why does attention use multi-head instead of single-head?
- How does GPT handle variable-length input?
- What is the role of the residual connections?
- Explain the training loop: data loading, forward, backward, optimizer step

**Llama2.c:**
- What is KV-cache and why is it important for inference?
- How does quantization work at a high level?
- Why is inference memory-bound rather than compute-bound?

### System Design Questions

- **Design a training pipeline** for a 1B-parameter LLM: data preprocessing, tokenization, batching, distributed training (DDP/FSDP), logging, checkpointing
- **Design an inference server**: batching requests (continuous batching), KV-cache management, quantization, serving multiple models
- **Design a finetuning pipeline**: dataset preparation, LoRA/QLoRA, evaluation, deployment

### Behavioral Questions

- Walk through a bug you fixed in a ML system (gradient issues, data pipeline, CUDA errors)
- How do you debug a model that trains but has poor performance?
- How do you decide which hyperparameters to tune first?

---

## Project Structure

```
ai-ml/
├── README.md              # This file
│
├── micrograd/             # Autodiff engine (standalone)
│   ├── __init__.py        # Value, Neuron, Layer, MLP classes
│   ├── micrograd.ipynb    # Interactive tutorial
│   ├── MICROGRAD.md       # Detailed documentation
│   ├── tests_basic.py     # Unit tests
│   ├── setup.py           # Package config
│   ├── Makefile           # Build/test commands
│   └── requirements.txt   # Dependencies
│
├── nanoGPT/              # ⤷ submodule — train/finetune GPTs
├── llama2.c/             # ⤷ submodule — Llama 2 in pure C
├── makemore/             # ⤷ submodule — character-level LM
├── minbpe/               # ⤷ submodule — BPE tokenization
├── build-nanogpt/        # ⤷ submodule — build GPT from scratch
├── ng-video-lecture/     # ⤷ submodule — NN from scratch lecture
│
└── .gitignore            # Git ignore rules
```

---

## Learning Path (Interview-Focused)

### Phase 1: Fundamentals (Weeks 1-2)
1. **Micrograd** — implement autograd from scratch. Understand every line.
2. **NG-Video-Lecture** — watch lecture 1-3, code along.
3. **Key mastery**: You can compute any gradient by hand for a small network.

### Phase 2: Sequence Modeling (Weeks 3-4)
1. **Makemore** — build each model variant. Compare architectures.
2. **MinBPE** — implement the tokenizer. Tokenize sample texts by hand.
3. **Key mastery**: You understand why Transformers replaced RNNs.

### Phase 3: Transformer Deep Dive (Weeks 5-6)
1. **Build-NanoGPT** — code every component from scratch (video-guided).
2. **NanoGPT** — train on a small dataset. Finetune a pretrained model.
3. **Key mastery**: You can whiteboard the full transformer forward pass.

### Phase 4: Production Inference (Week 7)
1. **Llama2.c** — read every line of the C implementation.
2. Run inference with different precision/temperature settings.
3. **Key mastery**: You understand inference optimization (KV-cache, quantization).

---

## Key Concepts (Interview Cheat Sheet)

- **Automatic Differentiation**: Computing gradients exactly via computation graphs. O(n) for forward + O(n) for backward (reverse-mode).
- **Backpropagation**: Chain rule applied to DAG. Gradients flow from loss to inputs.
- **Attention**: Q·K similarity weights values. `Attention(Q,K,V) = softmax(QK^T/√d)V`.
- **Multi-head attention**: h parallel attention heads, concatenated and projected. Each head learns different patterns.
- **Positional encoding**: Sinusoidal (extrapolatable) or learned (absolute position).
- **Residual connections**: `x + F(x)`. Enables training very deep networks by providing gradient shortcut.
- **LayerNorm**: Normalize across features. `(x - μ)/σ * γ + β`. Crucial for transformer stability.
- **BPE Tokenization**: Merge frequent byte pairs. Handles any text without OOV.
- **KV-cache**: Store K,V from previous tokens during generation. Avoids recomputation.
- **Quantization**: Reduce weight precision (FP32 → INT8/INT4). 4× memory reduction with minimal quality loss.
- **Temperature**: Controls sampling randomness. Low = deterministic, high = diverse.
- **Gradient accumulation**: Simulate larger batch size by accumulating gradients over multiple micro-batches.

---

## Setup

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>
cd ai-ml

# Install micrograd (optional)
pip install -e micrograd/

# Each project has its own dependencies — check individual requirements
```

### Update Submodules
```bash
git submodule update --remote --merge
```

---

## Resources

- [Andrej Karpathy's GitHub](https://github.com/karpathy)
- [Neural Networks: Zero to Hero (YouTube)](https://karpathy.ai/zero-to-hero.html)
- [Let's build GPT (YouTube)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- [3Blue1Brown Neural Networks](https://www.3blue1brown.com/lessons/neural-networks)
- [The Annotated Transformer](http://nlp.seas.harvard.edu/2018/04/03/attention.html)
- [CS231N: Convolutional Neural Networks](http://cs231n.stanford.edu/)
- [CS224N: Natural Language Processing](http://web.stanford.edu/class/cs224n/)
- [Deep Learning Book](https://www.deeplearningbook.org/)
