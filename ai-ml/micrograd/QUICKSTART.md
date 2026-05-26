# Quick Start Guide

Get started with micrograd in 5 minutes.

## Installation

```bash
# Navigate to project
cd ai-ml/micrograd

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Optional: Install with dev tools
pip install -e ".[dev,jupyter]"
```

## Run the Examples

### 1. Standalone Script
```bash
# Run basic training example
python micrograd.py

# Output:
# Micrograd Example
# ==================================================
# Network created with XX parameters
# Training on 50 samples
# Epoch 0: Loss = X.XXXXXX
# ...
# Final accuracy: XX.X%
```

### 2. Interactive Notebook
```bash
# Start Jupyter
jupyter notebook micrograd.ipynb

# Open notebook in browser, run cells sequentially
```

### 3. Using Makefile
```bash
# List available commands
make help

# Run tests
make test

# Start notebook
make notebook

# Format and lint code
make format
make lint
```

## Basic Usage

```python
from micrograd import MLP, Value, train

# Create network: 2 inputs -> 16 hidden -> 1 output
net = MLP(2, [16, 1])

# Prepare data
X = [[1.0, 2.0], [-1.0, 1.5], [0.5, -0.5]]  # Features
y = [1.0, -1.0, 1.0]                         # Labels

# Train
train(net, X, y, epochs=100, lr=0.1)

# Predict
x_test = [Value(0.5), Value(1.0)]
prediction = net(x_test)[0]
print(f"Prediction: {prediction.data:.4f}")
```

## Understanding Backpropagation

### Step 1: Forward Pass
```python
a = Value(2.0)
b = Value(3.0)
c = a * b + a ** 2  # Computation graph
```

### Step 2: Backward Pass
```python
c.backward()  # Compute gradients

print(a.grad)  # dc/da = 3 + 2*2 = 7
print(b.grad)  # dc/db = 2
```

### Step 3: Update Parameters
```python
a.data -= 0.01 * a.grad  # Gradient descent
```

## Project Structure

```
ai-ml/
├── micrograd.ipynb      # Interactive tutorial
├── micrograd.py         # Standalone implementation
├── README.md            # Full documentation
├── MICROGRAD.md         # Detailed explanation
├── requirements.txt     # Dependencies
├── setup.py            # Installation config
├── Makefile            # Common commands
├── tests_basic.py      # Unit tests
└── QUICKSTART.md       # This file
```

## Common Commands

| Command | Purpose |
| --- | --- |
| `python micrograd.py` | Run example |
| `jupyter notebook micrograd.ipynb` | Interactive learning |
| `make test` | Run tests |
| `make format` | Format code |
| `make lint` | Check code quality |
| `python -c "from micrograd import *; print(Value(5) * Value(3))"` | Quick test |

## Learning Roadmap

1. **Day 1**: Run examples, understand Value class
2. **Day 2**: Study backpropagation, trace gradients
3. **Day 3**: Build and train simple network
4. **Day 4**: Modify architecture, try different datasets
5. **Day 5**: Extend with new features

## Troubleshooting

### ImportError: No module named micrograd
```bash
# Install in development mode
pip install -e .
```

### Jupyter notebook not found
```bash
# Install Jupyter
pip install jupyter
```

### Tests fail
```bash
# Install test dependencies
pip install pytest

# Run tests
pytest tests_basic.py -v
```

## Next Steps

- Read [MICROGRAD.md](MICROGRAD.md) for deep dive
- Explore [micrograd.ipynb](micrograd.ipynb) notebook
- Modify network architecture in `setup.py`
- Add new activation functions
- Implement batch processing

## Resources

- [Andrej Karpathy's Micrograd](https://github.com/karpathy/micrograd)
- [Backpropagation Explained](https://www.youtube.com/watch?v=tIeHLnjs5U8)
- [Neural Networks Math](https://www.3blue1brown.com/lessons/neural-networks)
- [Deep Learning Book](https://www.deeplearningbook.org/)

## Need Help?

- Check [README.md](README.md) for FAQs
- Review [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue with details
- Read docstrings: `python -c "from micrograd import *; help(Value)"`

---

Happy learning! 🎓
