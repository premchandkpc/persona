from setuptools import setup, find_packages

setup(
    name='micrograd',
    version='0.1.0',
    description='Tiny automatic differentiation engine',
    author='Educational Implementation',
    author_email='',
    license='MIT',
    packages=find_packages(),
    python_requires='>=3.7',
    install_requires=[
        'numpy>=1.21.0',
        'matplotlib>=3.5.0',
    ],
    extras_require={
        'dev': [
            'pytest>=6.0',
            'pytest-cov>=2.12',
            'black>=21.0',
            'flake8>=3.9',
            'mypy>=0.910',
        ],
        'jupyter': [
            'jupyter>=1.0.0',
            'ipython>=7.30.0',
        ]
    },
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Education',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
    ],
    keywords='automatic differentiation neural networks machine learning',
    project_urls={
        'Source': 'https://github.com/karpathy/micrograd',
        'Documentation': 'https://github.com/karpathy/micrograd/blob/master/README.md',
    },
)
