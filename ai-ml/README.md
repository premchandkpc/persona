# AI/ML Learning Resources

Comprehensive collection of machine learning fundamentals and implementations — featuring projects by [Andrej Karpathy](https://github.com/karpathy).

## Projects

All projects are included as **git submodules** pointing to the upstream repositories.

### 1. Micrograd
A minimal automatic differentiation engine from scratch (~100 lines). Builds and trains tiny neural networks using only scalar operations, demonstrating backpropagation end-to-end.
- **Concepts**: Autodiff, backpropagation, gradient descent, computation graphs
- **Level**: Beginner — perfect first exposure
- **Run**: `cd micrograd && jupyter notebook micrograd.ipynb`
- **Upstream**: [karpathy/micrograd](https://github.com/karpathy/micrograd)

### 2. NanoGPT
The simplest, fastest repository for training and fine-tuning medium-sized GPTs. A clean implementation of a generative pre-trained transformer in PyTorch.
- **Concepts**: Transformer architecture, self-attention, GPT training, text generation
- **Level**: Intermediate
- **Enter**: `cd nanoGPT`
- **Upstream**: [karpathy/nanoGPT](https://github.com/karpathy/nanoGPT)

### 3. Llama2.c
Inference of Meta's Llama 2 models in a single file of pure C. No dependencies beyond standard library. An incredible demonstration of how simple LLM inference can be.
- **Concepts**: LLM inference, transformer decoding, weight quantization, C performance
- **Level**: Intermediate/Advanced
- **Enter**: `cd llama2.c && make run`
- **Upstream**: [karpathy/llama2.c](https://github.com/karpathy/llama2.c)

### 4. Makemore
An autoregressive character-level language model for "making more" of things. Implements Bigram, MLP, RNN, and Transformer variants in increasing complexity.
- **Concepts**: N-gram models, MLP, RNN, Transformer, character-level generation
- **Level**: Beginner → Intermediate (stepped progression)
- **Enter**: `cd makemore`
- **Upstream**: [karpathy/makemore](https://github.com/karpathy/makemore)

### 5. MinBPE
Minimal, clean implementation of the Byte Pair Encoding (BPE) algorithm used by GPT tokenizers. Includes regex-based GPT-4 tokenizer patterns.
- **Concepts**: Tokenization, BPE, byte-level encoding, GPT-4 tokenizer internals
- **Level**: Beginner/Intermediate
- **Enter**: `cd minbpe`
- **Upstream**: [karpathy/minbpe](https://github.com/karpathy/minbpe)

### 6. Build-NanoGPT
Companion code for Karpathy's "Let's build GPT from scratch" YouTube video. Builds nanoGPT step by step, starting from a bigram model through to a full transformer.
- **Concepts**: Step-by-step transformer construction, attention mechanism, GPT architecture
- **Level**: Beginner/Intermediate (video-guided)
- **Enter**: `cd build-nanogpt`
- **Upstream**: [karpathy/build-nanogpt](https://github.com/karpathy/build-nanogpt)

### 7. NG-Video-Lecture
Code from Karpathy's "Neural Networks: Zero to Hero" lecture series. Builds neural networks from first principles — the foundation behind all the projects above.
- **Concepts**: Neural network fundamentals, backpropagation, PyTorch basics
- **Level**: Beginner (lecture-first approach)
- **Enter**: `cd ng-video-lecture`
- **Upstream**: [karpathy/ng-video-lecture](https://github.com/karpathy/ng-video-lecture)

## Setup

### Prerequisites
- Python 3.7+
- pip or conda

### Installation

```bash
# Clone with submodules
git clone --recurse-submodules <repo-url>
cd ai-ml

# Install micrograd (optional)
pip install -e micrograd/

# Each submodule has its own dependencies — check individual requirements
```

> **Note**: Each project has its own dependencies. Check individual `requirements.txt` files inside each folder.

### Update Submodules

```bash
git submodule update --remote --merge
```

### Run Jupyter Notebook

```bash
cd micrograd && jupyter notebook micrograd.ipynb
```

### Run Tests

```bash
cd micrograd && python -m pytest tests_basic.py -v
```

## Learning Path

### Level 1: Fundamentals
1. Watch Karpathy's "Neural Networks: Zero to Hero" → `ng-video-lecture/`
2. Read `micrograd/MICROGRAD.md` and run `micrograd/micrograd.ipynb`
3. Understand computation graphs and backpropagation

### Level 2: Building Blocks
1. **MinBPE** — learn how tokenizers work (`minbpe/`)
2. **Makemore** — progress from bigram → MLP → RNN → Transformer (`makemore/`)
3. Study different architectures and their trade-offs

### Level 3: Modern LLMs
1. **Build-NanoGPT** — build a GPT step-by-step with video guidance (`build-nanogpt/`)
2. **NanoGPT** — train and fine-tune GPTs (`nanoGPT/`)
3. **Llama2.c** — understand inference in pure C (`llama2.c/`)

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

## Key Concepts

- **Automatic Differentiation**: Computing gradients exactly via computation graphs
- **Backpropagation**: Efficient gradient computation through the chain rule
- **Neural Networks**: Composable layers of non-linear functions
- **Gradient Descent**: Iterative optimization toward loss minimum
- **Transformers & Attention**: Core of modern LLMs (nanoGPT, llama2.c)
- **Tokenization (BPE)**: How text is split for model input (minbpe)
- **Autoregressive Models**: Predicting next token in a sequence (makemore, nanoGPT)

## Resources

- [Andrej Karpathy's GitHub](https://github.com/karpathy)
- [Neural Networks: Zero to Hero (YouTube)](https://karpathy.ai/zero-to-hero.html)
- [Let's build GPT (YouTube)](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- [3Blue1Brown Neural Networks](https://www.3blue1brown.com/lessons/neural-networks)
- [CS231N: Convolutional Neural Networks](http://cs231n.stanford.edu/)
- [Deep Learning Book](https://www.deeplearningbook.org/)

## Contributing

Add examples, extensions, or improvements:

1. Create a branch: `git checkout -b feature/new-feature`
2. Make changes
3. Test: `cd micrograd && python -m pytest tests_basic.py -v`
4. Commit: `git commit -am "Add new feature"`
5. Push: `git push origin feature/new-feature`

## License

Educational use. Based on Andrej Karpathy's open-source educational projects.

## Contact

Questions or suggestions? Open an issue or discussion.
