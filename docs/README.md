# Documentation

Project documentation and guides.

## Contents
- `API.md` - API documentation
- `DEPLOYMENT.md` - Deployment guide
- `MONITORING.md` - Monitoring & logging
- `SECURITY.md` - Security guidelines
- `CONTRIBUTING.md` - Contributing guide
- `FAQ.md` - Frequently asked questions
- `TROUBLESHOOTING.md` - Common issues

## Generate API Docs
```bash
# OpenAPI/Swagger
openapi-generator generate -i persona-api.yaml -g html

# FastAPI (Python)
# Automatically available at http://localhost:8000/docs
```

## Postman Collection
See `postman/` folder for Postman collection.
