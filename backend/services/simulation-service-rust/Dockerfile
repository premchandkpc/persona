FROM rust:1.81-alpine AS builder
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY Cargo.toml ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release 2>/dev/null; true
COPY src ./src
RUN touch src/main.rs && cargo build --release

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/target/release/simulation-service /server
EXPOSE 8080
CMD ["/server"]
