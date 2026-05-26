# Simulation Service (Rust) - Complete Guide

**Project**: Heavy Computation Engine for Simulations
**Language**: Rust
**Difficulty**: Advanced
**Time**: 4-5 hours
**Location**: `/persona/backend/services/simulation-service-rust/`
**Port**: 8005

---

## Table of Contents
1. [What Does It Do?](#what-does-it-do)
2. [Why Rust?](#why-rust)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Simulation Engine](#simulation-engine)
6. [API Endpoints](#api-endpoints)
7. [How to Run](#how-to-run)
8. [Examples](#examples)

---

## What Does It Do?

**TL;DR**: Performs heavy computational work: simulations, complex calculations, optimizations.

### Responsibilities
- Execute simulations (run for seconds to minutes)
- Heavy mathematical computations
- Optimization algorithms
- Physics/chemistry simulations
- Machine learning inference
- Cache results
- Return results and metrics

### Use Cases
```
Physics Simulation:
  "Simulate ball thrown at angle 45°, initial velocity 20 m/s"
  → Compute trajectory, landing distance, time of flight
  → Return JSON with results

Optimization:
  "Find best parameters for neural network"
  → Try 1000s of combinations
  → Return best configuration

Chemistry:
  "Simulate molecular interaction"
  → Complex calculations
  → Return energy state, bonds formed

Machine Learning:
  "Classify image using trained model"
  → Load model weights
  → Run inference
  → Return classification
```

---

## Why Rust?

### Characteristics
**1. Performance (Critical for Simulations)**
```
Rust:      ~1,000,000 calculations/sec
Python:    ~50,000 calculations/sec
Node:      ~100,000 calculations/sec

For 1M simulations: Python = 20 sec, Rust = 1 sec ✓
```

**2. Memory Safety (No Crashes)**
```rust
// Rust compiler checks at compile time
let x = vec![1, 2, 3];
let y = x;  // Moved
// println!("{}", x);  // ❌ Compile error: x moved

// No segfaults, no memory leaks, no undefined behavior
// This is verified BEFORE running!
```

**3. Zero-Cost Abstractions**
```rust
// Can use high-level code without performance penalty
let result: f64 = (0..1_000_000)
    .map(|x| complex_calculation(x))
    .sum();

// Compiles to assembly almost as efficient as C
```

**4. Concurrency Made Safe**
```rust
use std::sync::Arc;
use std::thread;

let data = Arc::new(heavy_computation);

let handles: Vec<_> = (0..4)
    .map(|_| {
        let data = Arc::clone(&data);
        thread::spawn(move || {
            data.parallel_process()
        })
    })
    .collect();

// Compiler ensures thread safety
// Can't have data races (verified at compile time)
```

---

## Tech Stack

### Actix-web (Web Framework)
```rust
use actix_web::{web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/simulations", web::post().to(create_simulation))
            .route("/simulations/{id}", web::get().to(get_simulation))
            .route("/simulations/{id}/results", web::get().to(get_results))
    })
    .bind("127.0.0.1:8005")?
    .run()
    .await
}
```

**Why Actix-web?**
- Fastest Rust web framework
- Async/await support
- Middleware system
- Built-in JSON serialization

### Tokio (Async Runtime)
```rust
use tokio::task;

// Run CPU-intensive work without blocking requests
let result = task::spawn_blocking(|| {
    heavy_computation()
}).await?;

// Event loop continues handling other requests ✓
```

### Serde (Serialization)
```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct SimulationRequest {
    simulation_type: String,
    parameters: HashMap<String, f64>,
}

// JSON ↔ Rust struct automatically
```

### SQLx (Database)
```rust
use sqlx::postgres::PgPool;

let pool = PgPool::connect("postgres://...").await?;

// Type-checked queries at compile time!
let user: (i32, String) = sqlx::query_as(
    "SELECT id, name FROM users WHERE id = $1"
)
.bind(user_id)
.fetch_one(&pool)
.await?;
// If query returns wrong types → compile error ✓
```

### Rayon (Parallel Computing)
```rust
use rayon::prelude::*;

// Parallelize across CPU cores automatically
let results: Vec<f64> = (0..1_000_000)
    .into_par_iter()  // Parallel iterator
    .map(|x| expensive_calculation(x))
    .collect();

// Uses all available cores, no thread management needed
```

---

## Architecture

### Folder Structure
```
simulation-service-rust/
├── src/
│   ├── main.rs              # Entry point
│   ├── config.rs            # Configuration
│   ├── db.rs                # Database
│   │
│   ├── api/
│   │   ├── mod.rs
│   │   ├── handlers.rs      # HTTP handlers
│   │   └── models.rs        # Request/response structs
│   │
│   ├── domain/
│   │   ├── simulation.rs    # Simulation entity
│   │   ├── result.rs        # Result entity
│   │   └── error.rs         # Error types
│   │
│   ├── service/
│   │   ├── simulation_service.rs  # Business logic
│   │   ├── engine/
│   │   │   ├── mod.rs
│   │   │   ├── physics.rs        # Physics simulations
│   │   │   ├── optimization.rs   # Optimization algorithms
│   │   │   └── ml.rs            # ML inference
│   │   └── cache.rs             # Result caching
│   │
│   ├── repository/
│   │   └── simulation_repo.rs   # Database queries
│   │
│   └── worker/
│       ├── mod.rs
│       └── job_processor.rs  # Background jobs
│
├── Cargo.toml               # Dependencies
├── Dockerfile
└── README.md
```

### Request Flow
```
POST /simulations
{
  "type": "physics",
  "parameters": {"angle": 45, "velocity": 20}
}
    ↓
[Auth Middleware]
    ↓
[SimulationHandler]
├─→ Validate input
├─→ Create Simulation record (status: pending)
└─→ Return 202 Accepted with ID
    ↓
[Background Job Queue]
├─→ Fetch Simulation from database
├─→ Call appropriate engine (physics, optimization, ml)
├─→ Engine runs computation (uses all CPU cores)
├─→ Store results in database
├─→ Update status to "completed"
└─→ Publish event: "simulation.completed"

[GET /simulations/{id}/results]
    ↓
Return: { status: "completed", results: {...} }
```

---

## Simulation Engine

### Physics Simulation

```rust
pub struct PhysicsSimulation {
    angle: f64,      // degrees
    velocity: f64,   // m/s
    g: f64,          // gravity (9.81)
    time_step: f64,  // 0.01 sec
}

impl PhysicsSimulation {
    pub fn run(&self) -> SimulationResult {
        let angle_rad = self.angle.to_radians();
        let vx = self.velocity * angle_rad.cos();  // Horizontal
        let vy = self.velocity * angle_rad.sin();  // Vertical
        
        let mut t = 0.0;
        let mut max_height = 0.0;
        let mut landing_distance = 0.0;
        
        // Simulate until ball lands (y < 0)
        loop {
            let y = vy * t - 0.5 * self.g * t * t;
            
            if y < 0.0 {
                landing_distance = vx * t;
                break;
            }
            
            max_height = max_height.max(y);
            t += self.time_step;
        }
        
        let time_of_flight = t;
        
        SimulationResult {
            max_height,
            landing_distance,
            time_of_flight,
        }
    }
}
```

### Optimization Engine

```rust
pub struct OptimizationSimulation {
    target_fn: Box<dyn Fn(&[f64]) -> f64>,  // Function to minimize
    bounds: Vec<(f64, f64)>,                // Parameter bounds
    iterations: usize,
}

impl OptimizationSimulation {
    pub fn run(&self) -> SimulationResult {
        use rayon::prelude::*;
        
        // Parallel random search across parameter space
        let best = (0..self.iterations)
            .into_par_iter()  // Parallel!
            .map(|_| {
                // Generate random parameters
                let params: Vec<f64> = self.bounds.iter()
                    .map(|(min, max)| {
                        rand::random::<f64>() * (max - min) + min
                    })
                    .collect();
                
                // Evaluate
                let value = (self.target_fn)(&params);
                (params, value)
            })
            .min_by(|a, b| {
                a.1.partial_cmp(&b.1).unwrap()
            })
            .unwrap();
        
        SimulationResult {
            best_params: best.0,
            best_value: best.1,
        }
    }
}
```

### Machine Learning Inference

```rust
pub struct MLSimulation {
    model: TensorFlow,  // Pre-trained model
    input_data: Vec<f32>,
}

impl MLSimulation {
    pub fn run(&self) -> SimulationResult {
        // Run inference
        let input_tensor = Tensor::new(&[self.input_data.clone()]);
        let output = self.model.run(input_tensor)?;
        
        // Extract results
        let predictions: Vec<f32> = output.into();
        let class = predictions.iter()
            .enumerate()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap())
            .map(|(idx, _)| idx)
            .unwrap();
        
        SimulationResult {
            class,
            confidence: predictions[class],
            all_probabilities: predictions,
        }
    }
}
```

---

## API Endpoints

### Create Simulation
```
POST /simulations
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "physics",
  "parameters": {
    "angle": 45.0,
    "velocity": 20.0
  }
}

Response: 202 Accepted
{
  "id": "sim_abc123",
  "status": "queued",
  "created_at": "2026-01-20T10:00:00Z"
}
```

### Get Simulation Status
```
GET /simulations/{id}
Authorization: Bearer {token}

Response:
{
  "id": "sim_abc123",
  "type": "physics",
  "status": "running",
  "progress": 45,
  "queued_at": "2026-01-20T10:00:00Z",
  "started_at": "2026-01-20T10:00:05Z",
  "estimated_completion": "2026-01-20T10:00:15Z"
}
```

### Get Results
```
GET /simulations/{id}/results
Authorization: Bearer {token}

Response:
{
  "id": "sim_abc123",
  "status": "completed",
  "results": {
    "max_height": 10.2,
    "landing_distance": 40.8,
    "time_of_flight": 2.87
  },
  "computation_time_ms": 125,
  "completed_at": "2026-01-20T10:00:15Z"
}
```

### Run Simulation (Sync)
```
POST /simulations/run
{
  "type": "physics",
  "parameters": {"angle": 45, "velocity": 20}
}

Response: 200 OK
{
  "results": {
    "max_height": 10.2,
    "landing_distance": 40.8,
    "time_of_flight": 2.87
  },
  "computation_time_ms": 125
}
```

---

## How to Run

### Prerequisites
```bash
# Rust (install from rustup.rs)
rustc --version
cargo --version

# PostgreSQL
psql --version

# Redis (for caching)
redis-cli ping
```

### Setup
```bash
cd /persona/backend/services/simulation-service-rust

# Create database
createdb persona_simulation

# Create .env
cat > .env << EOF
DATABASE_URL=postgres://user:pass@localhost/persona_simulation
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
PORT=8005
RUST_LOG=info
EOF

# Run migrations
sqlx migrate run

# Build (first time takes 2-3 min, compiles dependencies)
cargo build --release
```

### Run Service
```bash
# Development (slower, but auto-recompiles)
cargo watch -q -c -w src/ -x run

# Production (fast)
cargo run --release

# With logging
RUST_LOG=info cargo run --release

# Benchmark
cargo bench
```

### Run Tests
```bash
cargo test

# With output
cargo test -- --nocapture

# Integration tests
cargo test --test '*' -- --nocapture

# Benchmarks
cargo bench
```

---

## Examples

### Example 1: Physics Simulation

**Request**:
```bash
curl -X POST http://localhost:8005/simulations \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "physics",
    "parameters": {
      "angle": 45.0,
      "velocity": 20.0,
      "gravity": 9.81
    }
  }'
```

**Response**:
```json
{
  "id": "sim_abc123",
  "status": "queued",
  "created_at": "2026-01-20T10:00:00Z"
}
```

**Behind the scenes**:
```rust
// api/handlers.rs
async fn create_simulation(
    req: web::Json<SimulationRequest>,
    pool: web::Data<PgPool>,
    queue: web::Data<JobQueue>,
) -> Result<HttpResponse> {
    // 1. Validate
    if req.parameters.is_empty() {
        return Err(BadRequest("No parameters provided"));
    }
    
    // 2. Create simulation record
    let sim = Simulation {
        id: uuid::Uuid::new_v4(),
        user_id: get_user_id(req)?,
        sim_type: req.r#type.clone(),
        parameters: serde_json::to_value(&req.parameters)?,
        status: Status::Queued,
        created_at: chrono::Utc::now(),
    };
    
    // 3. Save to database
    sqlx::query(
        "INSERT INTO simulations (id, user_id, type, parameters, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(&sim.id)
    .bind(&sim.user_id)
    .bind(&sim.sim_type)
    .bind(&sim.parameters)
    .bind(&sim.status)
    .bind(&sim.created_at)
    .execute(pool.get_ref())
    .await?;
    
    // 4. Add to job queue
    queue.add_job(Job {
        simulation_id: sim.id,
        simulation_type: sim.sim_type,
        parameters: sim.parameters,
    })?;
    
    // 5. Return immediately
    Ok(HttpResponse::Accepted().json(json!({
        "id": sim.id,
        "status": "queued"
    })))
}
```

**Job processing** (background):
```rust
// worker/job_processor.rs
async fn process_simulation(job: Job, pool: PgPool) -> Result<()> {
    // 1. Update status to running
    sqlx::query("UPDATE simulations SET status = $1 WHERE id = $2")
        .bind("running")
        .bind(&job.simulation_id)
        .execute(&pool)
        .await?;
    
    // 2. Run simulation (CPU-intensive)
    let result = match job.simulation_type.as_str() {
        "physics" => {
            let physics = PhysicsSimulation {
                angle: job.parameters["angle"].as_f64().unwrap(),
                velocity: job.parameters["velocity"].as_f64().unwrap(),
                g: 9.81,
                time_step: 0.01,
            };
            physics.run()  // ← Uses all CPU cores
        }
        _ => return Err("Unknown simulation type".into()),
    };
    
    // 3. Store results
    sqlx::query(
        "UPDATE simulations SET status = $1, results = $2, completed_at = $3
         WHERE id = $4"
    )
    .bind("completed")
    .bind(serde_json::to_value(&result)?)
    .bind(chrono::Utc::now())
    .bind(&job.simulation_id)
    .execute(&pool)
    .await?;
    
    // 4. Cache result (1 hour)
    redis.set(
        format!("simulation:{}", job.simulation_id),
        serde_json::to_string(&result)?,
        3600
    ).await?;
    
    Ok(())
}
```

### Example 2: Optimization Simulation

**Request**:
```bash
curl -X POST http://localhost:8005/simulations \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "optimization",
    "parameters": {
      "target": "minimize_cost",
      "iterations": 10000,
      "bounds": {
        "x": [0, 100],
        "y": [0, 100]
      }
    }
  }'
```

**Execution**:
```rust
// Uses rayon for parallel search across 10,000 iterations
// All 4 CPU cores: ~40ms
// Sequential: ~160ms

pub fn optimize(&self) -> Result {
    (0..10000)
        .into_par_iter()  // ← Magic! Automatically parallel
        .map(|_| {
            // Random parameter combo
            // Expensive function evaluation
        })
        .min_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
        .unwrap()
}
```

---

## Key Concepts

### Ownership & Borrowing
```rust
// Ownership: only one owner at a time
let x = vec![1, 2, 3];
let y = x;  // x moved → y owns now
// x no longer valid

// Borrowing: temporary access without taking ownership
let x = vec![1, 2, 3];
let y = &x;  // Borrow (read-only)
println!("{:?}", x);  // Still valid ✓

// Mutable borrow
let mut x = vec![1, 2, 3];
let y = &mut x;  // Exclusive access
y.push(4);
// println!("{:?}", x);  // ❌ x borrowed
```

### Lifetimes
```rust
// Ensures references don't outlive data
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    // Return type's lifetime = min(x, y)
    // Compiler checks: result won't outlive x or y
}
```

### Zero-Cost Abstractions
```rust
// High-level code:
let sum: f64 = (0..1_000_000)
    .map(|x| (x as f64).sqrt())
    .sum();

// Compiles to: single loop, no allocations
// Performance = hand-written C
```

---

## Performance Tips

### 1. Use `--release` builds
```bash
cargo run --release  # 100× faster than debug
```

### 2. Profile hot loops
```rust
// time critical code
for i in 0..1_000_000_000 {
    expensive_calculation(i);
}

// Use release mode + flamegraph
cargo install flamegraph
cargo flamegraph --release
```

### 3. Avoid allocations in loops
```rust
// Bad ❌
for i in 0..1_000_000 {
    let vec = vec![1, 2, 3];  // Allocate each iteration!
    process(vec);
}

// Good ✓
let mut vec = vec![0; 3];
for i in 0..1_000_000 {
    vec[0] = 1; vec[1] = 2; vec[2] = 3;
    process(&vec);
}
```

### 4. Use parallel iterators (Rayon)
```rust
// Bad: sequential
(0..1_000_000)
    .map(expensive_fn)
    .collect()

// Good: parallel
(0..1_000_000)
    .into_par_iter()
    .map(expensive_fn)
    .collect()
```

---

## Next Steps
1. Run service: `cargo run --release`
2. Try endpoints with Postman
3. Understand: ownership, borrowing, lifetimes
4. Write physics simulation
5. Deploy with Docker → Kubernetes
