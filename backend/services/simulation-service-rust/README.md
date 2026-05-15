# Simulation Service - Rust

Heavy computation and simulation service built with Rust.

## Features
- Complex simulation engine
- Real-time calculations
- High-performance processing
- Result caching
- Optimization algorithms

## Tech Stack
- **Language**: Rust
- **Database**: PostgreSQL
- **Cache**: Redis
- **Web**: Actix-web/Rocket

## API Endpoints
- `POST /simulations` - Create simulation
- `GET /simulations/{id}` - Get simulation
- `GET /simulations/{id}/results` - Get results
- `POST /simulations/{id}/run` - Run simulation
- `GET /simulations/{id}/status` - Get status

## Setup
```bash
cargo init
cargo add actix-web tokio serde
```

## Run
```bash
cargo run
```

## Port
8005
