# Micrograd: Tiny Automatic Differentiation Engine

Educational implementation of automatic differentiation (backpropagation) from scratch. Based on Andrej Karpathy's micrograd project.

## Overview

Micrograd is a minimal (~300 lines) implementation of automatic differentiation that teaches how neural networks actually work. It demonstrates:

- **Scalar autograd**: Computing gradients of arbitrary computational graphs
- **Backpropagation**: Efficient gradient computation via chain rule
- **Neural networks**: Building MLPs from primitive operations
- **Training**: Gradient descent optimization

## Architecture

### 1. Value Class

Core abstraction that wraps scalars with gradient tracking.

```python
class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = data          # Scalar value
        self.grad = 0.0           # Gradient (dn/dd)
        self._backward = lambda: None  # Backward function
        self._prev = set(_children)     # Previous nodes
        self._op = _op            # Operation name
```

**Supported Operations:**
- Arithmetic: `+`, `-`, `*`, `/`, `**`
- Activation: `tanh()`, `relu()`

**Computation Graph:**
- Forward pass: Operations create nodes in DAG
- Backward pass: Chain rule flows gradients backwards

### 2. Neuron

Single artificial neuron: `output = activation(w₁·x₁ + w₂·x₂ + ... + b)`

```python
class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))
    
    def __call__(self, x):
        act = sum((wi * xi for wi, xi in zip(self.w, x)), self.b)
        return act.tanh()
```

**Parameters:**
- Weights: `w` (one per input)
- Bias: `b` (learned offset)

### 3. Layer

Fully connected layer of `nout` neurons.

```python
class Layer:
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]
```

### 4. MLP (Multi-Layer Perceptron)

Stack of layers forming a deep network.

```python
class MLP:
    def __init__(self, nin, nouts):
        # nin=2 inputs, nouts=[16, 1] means:
        # Layer 1: 2 -> 16 neurons
        # Layer 2: 16 -> 1 neuron
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i+1]) for i in range(len(nouts))]
```

## Backpropagation Algorithm

### Forward Pass
1. Input → through each layer → output
2. Operations create computation graph
3. Calculate loss

### Backward Pass
1. **Topological Sort**: Order nodes so dependencies processed first
2. **Initialize**: Set output gradient to 1.0
3. **Chain Rule**: For each node in reverse order:
   ```
   dL/dx = (dL/dout) * (dout/dx)
   ```
4. **Accumulate**: Sum gradients to parameters

### Gradient Flow Example

```
         Loss
          |
        / | \
       /  |  \
    Pred Yi   (loss computation)
     |  |
    [neurons]
     |
    Inputs
```

Each arrow has a gradient flow direction in backward pass.

## Training Loop

```python
for epoch in range(epochs):
    # Forward
    predictions = [net(x) for x in X]
    loss = sum((pred - y)**2 for pred, y in zip(predictions, Y)) / len(X)
    
    # Zero gradients
    for p in net.parameters():
        p.grad = 0.0
    
    # Backward
    loss.backward()
    
    # Update (gradient descent)
    for p in net.parameters():
        p.data -= learning_rate * p.grad
```

## Key Concepts

### Automatic Differentiation
Computing exact derivatives through symbolic manipulation of code. Two modes:
- **Forward mode**: Compute all ∂y/∂xᵢ in one pass (expensive for many inputs)
- **Reverse mode** (used here): Compute all ∂L/∂xᵢ in one pass (cheap for many outputs)

### Backpropagation
Efficient reverse-mode autodiff applied to neural networks. Complexity: O(n) where n = # parameters (linear, not exponential).

### Gradient Descent
Update rule: `x ← x - α · ∇L(x)` where α = learning rate

Intuition: Move opposite to gradient (direction of steepest descent).

### Loss Function
Measures how wrong predictions are. Common choices:
- **MSE** (regression): `(pred - target)²`
- **Cross-entropy** (classification): `-Σ yᵢ log(predᵢ)`

## Usage Example

```python
# Create network: 2 inputs -> 16 hidden -> 1 output
net = MLP(2, [16, 1])

# Forward pass
x = [Value(1.0), Value(-1.5)]
output = net(x)[0]

# Loss
loss = (output - Value(1.0)) ** 2

# Backward pass
loss.backward()

# Access gradients
for i, p in enumerate(net.parameters()):
    print(f'Parameter {i}: grad = {p.grad}')
```

## Limitations

⚠️ Educational only:
- **Scalar only**: Works on individual numbers, not batches
- **Single precision**: No float32/float64 handling
- **No GPU**: Pure Python, CPU only
- **Slow**: No optimizations (matrix ops, etc.)

For production: Use **PyTorch**, **TensorFlow**, **JAX** instead.

## Extensions & Exercises

1. **Add operations**: Implement `log()`, `exp()`, `sin()`, etc.
2. **Matrix support**: Extend to 2D tensors
3. **Optimizers**: Implement momentum, Adam, RMSprop
4. **Regularization**: Add L1/L2 penalty to loss
5. **Batch processing**: Vectorize for minibatches
6. **Visualization**: Plot computation graphs with `graphviz`

## References

- [Karpathy's Micrograd](https://github.com/karpathy/micrograd)
- [Backpropagation Algorithm](https://en.wikipedia.org/wiki/Backpropagation)
- [Automatic Differentiation](https://en.wikipedia.org/wiki/Automatic_differentiation)
- Goodfellow, Bengio, Courville: "Deep Learning" (Chapter 6)

## Files

- `micrograd.ipynb` - Interactive notebook with runnable examples
- `MICROGRAD.md` - This documentation
- `micrograd.py` - Minimal standalone implementation (~300 lines)

## Quick Start

```bash
# Run notebook
jupyter notebook micrograd.ipynb

# Or run standalone
python -c "
from micrograd import *
net = MLP(2, [16, 1])
x = [Value(1.0), Value(-1.5)]
y = net(x)[0]
y.backward()
print('Gradients computed!')
"
```
