# Shared Protocols

Protocol Buffer definitions for inter-service communication.

## Files
- `user.proto` - User service messages
- `content.proto` - Content service messages
- `media.proto` - Media service messages
- `analytics.proto` - Analytics service messages
- `simulation.proto` - Simulation service messages

## Build
```bash
protoc --go_out=. --go-grpc_out=. *.proto
```

## Usage
Import generated files in your service code.
