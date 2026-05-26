.PHONY: help install install-dev test lint format clean notebook run

help:
	@echo "Available commands:"
	@echo "  make install       Install package"
	@echo "  make install-dev   Install with dev dependencies"
	@echo "  make test          Run tests"
	@echo "  make lint          Run linters (flake8, mypy)"
	@echo "  make format        Format code (black)"
	@echo "  make notebook      Start Jupyter notebook"
	@echo "  make run           Run standalone example"
	@echo "  make clean         Remove build artifacts"

install:
	pip install -e .

install-dev:
	pip install -e ".[dev,jupyter]"

test:
	pytest tests_basic.py -v

lint:
	flake8 __init__.py --max-line-length=100
	mypy __init__.py --ignore-missing-imports

format:
	black __init__.py tests_basic.py

notebook:
	jupyter notebook micrograd.ipynb

run:
	python -c "from micrograd import demo; demo()"

clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name ".pytest_cache" -delete
