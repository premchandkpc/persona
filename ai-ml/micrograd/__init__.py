"""
Micrograd: Tiny Automatic Differentiation Engine
Based on Andrej Karpathy's educational implementation
"""

import math
import random
from typing import List, Tuple, Set


class Value:
    """Scalar value with automatic differentiation support."""

    def __init__(self, data: float, _children: Tuple = (), _op: str = ''):
        self.data = data
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    def __repr__(self):
        return f'Value(data={self.data:.4f})'

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def __pow__(self, other):
        assert isinstance(other, (int, float))
        out = Value(self.data ** other, (self,), f'**{other}')

        def _backward():
            self.grad += (other * self.data ** (other - 1)) * out.grad
        out._backward = _backward
        return out

    def __rmul__(self, other):
        return self * other

    def __radd__(self, other):
        return self + other

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other):
        return other + (-self)

    def __truediv__(self, other):
        return self * (other ** -1)

    def __rtruediv__(self, other):
        return other * (self ** -1)

    def __neg__(self):
        return self * -1

    def tanh(self):
        """Hyperbolic tangent activation."""
        x = self.data
        t = (math.exp(2 * x) - 1) / (math.exp(2 * x) + 1)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad
        out._backward = _backward
        return out

    def relu(self):
        """Rectified Linear Unit activation."""
        out = Value(0 if self.data < 0 else self.data, (self,), 'relu')

        def _backward():
            self.grad += (out.data > 0) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        """Topological sort and backpropagation."""
        topo = []
        visited = set()

        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)

        build_topo(self)
        self.grad = 1.0

        for v in reversed(topo):
            v._backward()

    def zero_grad(self):
        """Reset gradient to zero."""
        self.grad = 0.0


class Neuron:
    """Single artificial neuron."""

    def __init__(self, nin: int, nonlin: bool = True):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))
        self.nonlin = nonlin

    def __call__(self, x):
        act = sum((wi * xi for wi, xi in zip(self.w, x)), self.b)
        return act.tanh() if self.nonlin else act

    def parameters(self):
        return self.w + [self.b]


class Layer:
    """Fully connected layer of neurons."""

    def __init__(self, nin: int, nout: int, **kwargs):
        self.neurons = [Neuron(nin, **kwargs) for _ in range(nout)]

    def __call__(self, x):
        return [n(x) for n in self.neurons]

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]


class MLP:
    """Multi-layer perceptron."""

    def __init__(self, nin: int, nouts: List[int]):
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i + 1], nonlin=i != len(nouts) - 1)
                      for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for l in self.layers for p in l.parameters()]


def train(net: MLP, X: List, y: List, epochs: int = 100, lr: float = 0.01):
    """Train network on data."""
    losses = []

    for epoch in range(epochs):
        loss = None

        for xi, yi in zip(X, y):
            xi_vals = [Value(x) for x in xi]
            yi_val = Value(yi)

            pred = net(xi_vals)[0] if len(net.layers[-1].neurons) == 1 else net(xi_vals)
            diff = pred - yi_val if isinstance(pred, Value) else pred[0] - yi_val
            sample_loss = diff * diff

            if loss is None:
                loss = sample_loss
            else:
                loss = loss + sample_loss

        loss = loss * (1.0 / len(X))
        losses.append(loss.data)

        for p in net.parameters():
            p.grad = 0.0

        loss.backward()

        for p in net.parameters():
            p.data -= lr * p.grad

        if epoch % (epochs // 10) == 0:
            print(f'Epoch {epoch}: Loss = {loss.data:.6f}')

    return losses


def evaluate(net: MLP, X: List, y: List):
    """Evaluate classification accuracy."""
    correct = 0

    for xi, yi in zip(X, y):
        xi_vals = [Value(x) for x in xi]
        pred = net(xi_vals)[0] if len(net.layers[-1].neurons) == 1 else net(xi_vals)[0]
        pred_label = 1.0 if pred.data > 0 else -1.0

        if pred_label == yi:
            correct += 1

    return correct / len(X) * 100


if __name__ == '__main__':
    # Example: Simple classification
    print('Micrograd Example')
    print('=' * 50)

    # Create network
    net = MLP(2, [16, 1])
    print(f'Network created with {len(net.parameters())} parameters')

    # Generate synthetic data
    X, y = [], []
    for i in range(50):
        x1 = random.uniform(-1, 1)
        x2 = random.uniform(-1, 1)
        label = 1.0 if x1 * x2 > 0 else -1.0
        X.append([x1, x2])
        y.append(label)

    print(f'Training on {len(X)} samples')

    # Train
    losses = train(net, X, y, epochs=100, lr=0.1)

    # Evaluate
    acc = evaluate(net, X, y)
    print(f'Final accuracy: {acc:.1f}%')
    print('=' * 50)
