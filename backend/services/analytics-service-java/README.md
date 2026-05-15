# Analytics Service - Java

User behavior tracking and analytics service built with Java.

## Features
- Event tracking system
- User behavior analytics
- Report generation
- Performance metrics
- Real-time dashboards

## Tech Stack
- **Framework**: Spring Boot
- **Database**: PostgreSQL
- **Messaging**: Kafka/RabbitMQ
- **Analytics**: Elasticsearch
- **Language**: Java

## API Endpoints
- `POST /events` - Track event
- `GET /analytics/user/{id}` - Get user analytics
- `GET /reports` - Generate reports
- `POST /reports/custom` - Create custom report
- `GET /metrics` - Get system metrics

## Setup
```bash
mvn archetype:generate -DgroupId=com.persona.analytics -DartifactId=analytics-service
```

## Run
```bash
mvn spring-boot:run
```

## Port
8004
