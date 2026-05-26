# Micrograd: Complete Step-by-Step Guide

**Project**: Andrej Karpathy's Automatic Differentiation Engine (Educational AI/ML)
**Language**: Python
**Difficulty**: Intermediate
**Time**: 2-3 hours to fully understand
**Location**: `/persona/ai-ml/`

---

## Table of Contents
1. [What is Micrograd?](#what-is-micrograd)
2. [Core Concepts](#core-concepts)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
5. [How to Run](#how-to-run)
6. [Extensions & Exercises](#extensions--exercises)

---

## What is Micrograd?

**TL;DR**: A 300-line Python library that implements automatic differentiation (backpropagation), the algorithm that powers all neural networks. It's educational—teaches *why* neural networks work, not *how* to use them.

### Why Learn It?

Most engineers use PyTorch/TensorFlow as a black box:
```python
loss.backward()  # Magic happens?
```

Micrograd shows the magic:
```python
# Every operation tracks how to compute gradients
a = Value(2.0)
b = Value(3.0)
c = a * b  # Creates a computation graph node
loss = c ** 2
loss.backward()  # Walks graph backward, computes gradients
print(a.grad, b.grad)  # 24.0, 16.0 ✓
```

---

## Core Concepts

### 1. Scalar Values with Gradients

Every number can compute its own derivative.

```python
class Value:
    def __init__(self, data):
        self.data = data           # The actual number
        self.grad = 0.0            # Its derivative (∂Loss/∂data)
        self._backward = lambda: None  # How to update grad
        self._prev = set()         # Dependencies (inputs)
        self._op = ''              # Operation ('+', '*', etc)
```

**Example**:
```
a = Value(3.0)  → data=3.0, grad=0.0
b = Value(2.0)  → data=2.0, grad=0.0
c = a * b       → data=6.0, grad=0.0 (initially)
                → _prev={a, b}, _op='*'
```

### 2. Computation Graphs

Every operation creates a node in a Directed Acyclic Graph (DAG).

```
         c (output)
        / \
       a   b
    (inputs)
```

When we compute `c = a * b + a`:
```
        +
       / \
      *   a
     / \
    a   b
```

### 3. Chain Rule (Backpropagation)

Derivatives flow backward through the graph via chain rule.

**Math**:
```
If z = f(x) and loss = g(z)
Then: d(loss)/dx = d(loss)/dz × dz/dx
```

**Example**:
```
loss = (a * b) ** 2
d(loss)/da = d(loss)/d(c) × dc/da  where c = a*b
           = 2*c × b
           = 2*(a*b) × b
```

### 4. Neural Network = Composition of Operations

```
Input → [Linear] → [Activation] → ... → Output
         (matrix ops)

Each operation is a Value that tracks gradients.
```

---

## Architecture Deep Dive

### Part 1: Value Class

Core abstraction wrapping scalars.

**Operations**:
```python
# Arithmetic
c = a + b      # __add__: c.grad = a.grad + b.grad
c = a * b      # __mul__: a.grad += b.data * c.grad
c = a ** 2     # __pow__: a.grad += 2 * a.data * c.grad
c = a / b      # __truediv__: a / b = a * (b ** -1)

# Activations
y = x.tanh()   # d(tanh)/dx = 1 - tanh²(x)
y = x.relu()   # d(relu)/dx = 1 if x > 0 else 0
```

**Backward Function Pattern**:
```python
def __mul__(self, other):
    out = Value(self.data * other.data, (self, other), '*')
    
    def _backward():
        # Chain rule for multiplication
        # d(loss)/da = d(loss)/dc * dc/da
        # where c = a*b, so dc/da = b
        self.grad += other.data * out.grad
        other.grad += self.data * out.grad
    
    out._backward = _backward
    return out
```

**Key insight**: Each operation stores a lambda that knows how to propagate gradients.

### Part 2: Neural Network Layers

#### Neuron (Single Unit)
```python
class Neuron:
    def __init__(self, nin):
        self.w = [Value(random()) for _ in range(nin)]
        self.b = Value(random())
    
    def __call__(self, x):
        # output = tanh(w₁·x₁ + w₂·x₂ + ... + b)
        z = sum(wi * xi for wi, xi in zip(self.w, x)) + self.b
        return z.tanh()
```

**Why this structure?**
- `w`: Weights (learned parameters, shape: `nin`)
- `b`: Bias (learned offset, scalar)
- `tanh`: Squashes output to [-1, 1], smooth gradient

#### Layer (Multiple Neurons)
```python
class Layer:
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]
    
    def __call__(self, x):
        return [n(x) for n in self.neurons]
```

**Example**: `Layer(2, 3)` = 3 neurons, each takes 2 inputs
- **Total params**: 2×3 weights + 3 biases = 9 params

#### MLP (Multi-Layer Perceptron)
```python
class MLP:
    def __init__(self, nin, nouts):
        # nin=2, nouts=[16, 1] means:
        # Layer 1: 2 → 16  (project 2 inputs to 16 neurons)
        # Layer 2: 16 → 1  (project 16 to 1 output)
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i+1]) 
                       for i in range(len(nouts))]
```

**Total parameters**: 2×16 + 16 (bias) + 16×1 + 1 (bias) = **65 params**

---

## Step-by-Step Walkthrough

### Phase 1: Forward Pass (Building Graph)

```python
# Input data
x = [Value(0.5), Value(-0.3)]
y_target = Value(1.0)

# Forward through network
hidden = net.layers[0](x)           # 2 inputs → 16 values
output = net.layers[1](hidden)[0]   # 16 values → 1 output

# Compute loss (MSE: Mean Squared Error)
loss = (output - y_target) ** 2

# Graph structure:
# y_target
#     |
#    -
#     |
#    **2
#     |
#   output
#     |
#   tanh
#     |
#   [sum + tanh] × 16 (layer 2)
#     |
#   tanh × 16 (layer 1)
#     |
#     x (inputs)
```

**Key**: Graph is created implicitly during forward pass. No graph object needed.

### Phase 2: Backward Pass (Computing Gradients)

```python
# Step 1: Topological sort
# Order all nodes so dependencies come first
topo = []
visited = set()

def build_topo(v):
    if v not in visited:
        visited.add(v)
        for child in v._prev:
            build_topo(child)
        topo.append(v)

build_topo(loss)
# topo = [x[0], x[1], ..., hidden[0], ..., output, loss]
```

**Why topological sort?**
- Ensures we compute gradients of dependencies before dependents
- If we process `a` before computing `grad(b)`, but `b` depends on `a`, we'd lose `a.grad`

```python
# Step 2: Initialize output gradient
loss.grad = 1.0  # d(loss)/d(loss) = 1

# Step 3: Backward propagate (reverse order)
for v in reversed(topo):
    v._backward()  # Apply chain rule
```

**What happens**:
```
loss.grad = 1.0
→ output.grad += 2 * (output - target) * loss.grad
→ For tanh: input_grad += (1 - tanh²(input)) * output.grad
→ For weights: w.grad += x.data * input.grad
→ ... propagates all the way to inputs
```

### Phase 3: Gradient Descent Update

```python
learning_rate = 0.01

# Update all parameters (weights & biases)
for p in net.parameters():
    p.data -= learning_rate * p.grad
```

**Intuition**: Move opposite to gradient (direction of steepest descent)
- If `∂loss/∂w = 0.5`, loss increases as `w` increases
- So decrease `w` by `0.5 * learning_rate`

### Full Training Loop

```python
for epoch in range(100):
    # FORWARD
    loss = sum(
        ((net([Value(x[0]), Value(x[1])])[0] - Value(y))**2)
        for x, y in zip(X, Y)
    ) / len(X)
    
    # ZERO GRADIENTS
    for p in net.parameters():
        p.grad = 0.0
    
    # BACKWARD
    loss.backward()
    
    # UPDATE
    for p in net.parameters():
        p.data -= 0.01 * p.grad
    
    if epoch % 10 == 0:
        print(f"Epoch {epoch}: Loss = {loss.data:.4f}")
```

---

## How to Run

### Setup
```bash
cd /Users/ramyachowdary/Documents/prem-work/persona/ai-ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Option 1: Run Jupyter Notebook (Interactive)
```bash
jupyter notebook micrograd.ipynb
# Opens browser → Run cells → See output & visualizations
```

### Option 2: Run Python Script
```bash
python -c "
from ai_ml.micrograd import *

# Create network: 2 inputs, 16 hidden neurons, 1 output
net = MLP(2, [16, 1])
print(f'Network parameters: {len(net.parameters())}')

# Generate 2-moon dataset
import math
X, y = [], []
for i in range(100):
    t = i / 100
    if i < 50:
        x = math.cos(math.pi * t)
        y_val = math.sin(math.pi * t)
        label = 1.0
    else:
        x = 1 - math.cos(math.pi * t)
        y_val = 0.5 - math.sin(math.pi * t)
        label = -1.0
    X.append([x, y_val])
    y.append(label)

# Train for 50 epochs
for epoch in range(50):
    loss = None
    for xi, yi in zip(X, y):
        pred = net([Value(xi[0]), Value(xi[1])])[0]
        sample_loss = (pred - Value(yi)) ** 2
        loss = sample_loss if loss is None else loss + sample_loss
    
    loss = loss * (1.0 / len(X))
    
    for p in net.parameters():
        p.grad = 0.0
    loss.backward()
    
    for p in net.parameters():
        p.data -= 0.01 * p.grad
    
    if epoch % 10 == 0:
        print(f'Epoch {epoch}: Loss = {loss.data:.4f}')
"
```

### Run Tests
```bash
python -m pytest tests/ -v
```

---

## Extensions & Exercises

### Easy
1. **Add `exp()` and `log()` operations**
   ```python
   def exp(self):
       t = math.exp(self.data)
       out = Value(t, (self,), 'exp')
       def _backward():
           self.grad += t * out.grad  # d(e^x)/dx = e^x
       out._backward = _backward
       return out
   ```

2. **Visualize computation graph**
   ```python
   import graphviz
   # Draw nodes and edges showing computation
   ```

3. **Change activation function** (relu instead of tanh)

### Medium
4. **Add batch processing** (vectorize for multiple samples)
5. **Implement momentum optimizer** (smoother updates)
   ```python
   # v = momentum * v + gradient
   # param -= learning_rate * v
   ```

6. **Add L2 regularization** (penalize large weights)
   ```python
   loss += 0.001 * sum(p**2 for p in net.parameters())
   ```

### Hard
7. **Implement Adam optimizer** (learning rates per parameter)
8. **Add dropout** (regularization technique)
9. **Multi-class classification** (softmax + cross-entropy)
10. **Convolutional layers** (spatial operations)

---

## Key Takeaways

| Concept | Why It Matters |
|---------|---|
| **Value abstraction** | Every number tracks its own gradient |
| **Implicit graph** | Built on-the-fly, no separate graph object needed |
| **Topological sort** | Ensures correct order of gradient computation |
| **Chain rule** | How gradients "know" where to flow |
| **Backward function** | Each operation stores how to differentiate |
| **Scalar-only** | Simple but impractical; real code uses matrices |

---

## Files
- `micrograd.ipynb` - Interactive notebook (run cells one by one)
- `micrograd.py` - Standalone implementation (~300 lines)
- `MICROGRAD.md` - Original documentation
- `tests_basic.py` - Test suite
- `requirements.txt` - Dependencies (just `matplotlib` for plotting)

---

## Common Errors & Fixes

**Error**: `AttributeError: 'Value' object has no attribute 'grad'`
- **Cause**: Forgot to initialize Value; add `self.grad = 0.0` in `__init__`

**Error**: `ZeroDivisionError` during training
- **Cause**: Data contains zeros; normalize data to [-1, 1] range

**Error**: Loss doesn't decrease
- **Cause**: Learning rate too small or data distribution wrong
- **Fix**: Try `lr = 0.1` instead of `0.01`, or shuffle data

**Error**: Gradient is `None` after `backward()`
- **Cause**: Didn't create computation graph; ensure operations use Value objects

---

## Next Steps

1. Run the notebook → understand forward/backward
2. Modify architecture (change layer sizes, activations)
3. Implement one extension (add operation or optimizer)
4. Build intuition: how do gradients flow? What breaks?
5. (Advanced) Read PyTorch source code → recognize patterns
