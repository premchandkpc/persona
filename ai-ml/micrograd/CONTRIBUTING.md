# Contributing to AI/ML

Guidelines for contributing to this project.

## Code of Conduct

- Be respectful and constructive
- Help others learn and grow
- Focus on educational value
- Respect intellectual property

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/persona.git`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Set up development environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -e ".[dev,jupyter]"
   ```

## Development Workflow

### Code Style

- Follow PEP 8
- Use type hints
- Write docstrings
- Max line length: 100 characters

### Testing

```bash
# Run tests
make test

# Run with coverage
pytest tests_basic.py --cov=micrograd --cov-report=html
```

### Linting & Formatting

```bash
# Format code
make format

# Check linting
make lint
```

## Pull Request Process

1. Update documentation and tests
2. Ensure all tests pass: `make test`
3. Format code: `make format`
4. Run linters: `make lint`
5. Write clear commit messages
6. Submit PR with description of changes

## Commit Message Convention

Use conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(micrograd): add sigmoid activation function`
- `fix(tests): correct gradient computation test`
- `docs: update README with examples`

## What to Contribute

### Good First Issues
- Add new activation functions
- Improve documentation
- Add example notebooks
- Fix typos/bugs
- Optimize code

### Advanced Contributions
- Implement batch processing
- Add optimizer variants (momentum, Adam)
- Create visualization tools
- Write comprehensive tutorials
- Performance optimizations

## Documentation

- Update README.md for major changes
- Add docstrings to new functions
- Include example usage in notebooks
- Document edge cases and limitations

## Questions?

- Check existing issues/discussions
- Open a new issue with `[Question]` prefix
- Be specific about what you need help with

## Acknowledgments

- Based on Andrej Karpathy's micrograd
- Contributors are listed in CONTRIBUTORS.md
