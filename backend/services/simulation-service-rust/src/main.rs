use actix_web::{web, App, HttpServer, HttpResponse, middleware};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}

async fn health() -> HttpResponse {
    HttpResponse::Ok().json(HealthResponse {
        status: "healthy".into(),
        service: "simulation-service".into(),
    })
}

async fn index() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Persona Simulation Service",
        "version": "0.1.0"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("SERVICE_PORT").unwrap_or_else(|_| "8080".into());
    println!("Simulation service starting on port {}", port);

    HttpServer::new(|| {
        App::new()
            .route("/health", web::get().to(health))
            .route("/", web::get().to(index))
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
