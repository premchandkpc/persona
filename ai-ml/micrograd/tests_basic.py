"""Basic tests for micrograd."""

import math
from micrograd import Value, Neuron, Layer, MLP


class TestValue:
    """Test Value class operations."""

    def test_addition(self):
        a = Value(3.0)
        b = Value(2.0)
        c = a + b
        assert c.data == 5.0

    def test_multiplication(self):
        a = Value(3.0)
        b = Value(2.0)
        c = a * b
        assert c.data == 6.0

    def test_power(self):
        a = Value(2.0)
        b = a ** 3
        assert b.data == 8.0

    def test_subtraction(self):
        a = Value(5.0)
        b = Value(3.0)
        c = a - b
        assert c.data == 2.0

    def test_division(self):
        a = Value(10.0)
        b = Value(2.0)
        c = a / b
        assert c.data == 5.0

    def test_tanh_activation(self):
        a = Value(0.0)
        b = a.tanh()
        assert abs(b.data - 0.0) < 1e-6

    def test_relu_activation(self):
        a = Value(-1.0)
        b = a.relu()
        assert b.data == 0.0

        c = Value(2.0)
        d = c.relu()
        assert d.data == 2.0


class TestGradient:
    """Test gradient computation."""

    def test_simple_backward(self):
        a = Value(3.0)
        b = Value(2.0)
        c = a * b + a ** 2
        c.backward()

        # dc/da = b + 2*a = 2 + 6 = 8
        # dc/db = a = 3
        assert abs(a.grad - 8.0) < 1e-6
        assert abs(b.grad - 3.0) < 1e-6

    def test_chain_rule(self):
        a = Value(2.0)
        b = a * a
        c = b + b
        c.backward()

        # dc/da = d(2*a^2)/da = 4*a = 8
        assert abs(a.grad - 8.0) < 1e-6

    def test_zero_grad(self):
        a = Value(5.0)
        a.grad = 10.0
        a.zero_grad()
        assert a.grad == 0.0


class TestNeuron:
    """Test Neuron class."""

    def test_neuron_forward(self):
        neuron = Neuron(2)
        x = [Value(1.0), Value(2.0)]
        output = neuron(x)
        assert isinstance(output, Value)
        assert -1 <= output.data <= 1  # tanh output

    def test_neuron_parameters(self):
        neuron = Neuron(3)
        params = neuron.parameters()
        assert len(params) == 4  # 3 weights + 1 bias


class TestLayer:
    """Test Layer class."""

    def test_layer_forward(self):
        layer = Layer(2, 3)
        x = [Value(1.0), Value(2.0)]
        outputs = layer(x)
        assert len(outputs) == 3
        for out in outputs:
            assert isinstance(out, Value)

    def test_layer_parameters(self):
        layer = Layer(2, 3)
        params = layer.parameters()
        assert len(params) == 3 * (2 + 1)  # 3 neurons, each with 2 weights + 1 bias


class TestMLP:
    """Test MLP class."""

    def test_mlp_creation(self):
        net = MLP(2, [4, 1])
        assert len(net.layers) == 2

    def test_mlp_forward(self):
        net = MLP(2, [4, 1])
        x = [Value(1.0), Value(-1.0)]
        output = net(x)
        assert isinstance(output, Value)

    def test_mlp_parameters(self):
        net = MLP(2, [4, 1])
        params = net.parameters()
        # Layer 1: 2 -> 4 neurons = 4*(2+1) = 12
        # Layer 2: 4 -> 1 neuron = 1*(4+1) = 5
        # Total: 17
        assert len(params) == 17

    def test_mlp_backward(self):
        net = MLP(1, [2, 1])
        x = [Value(0.5)]
        y_true = Value(1.0)

        # Forward
        pred = net(x)
        loss = (pred - y_true) ** 2

        # Backward
        loss.backward()

        # Check that gradients are non-zero
        has_gradients = any(p.grad != 0 for p in net.parameters())
        assert has_gradients


if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v'])
