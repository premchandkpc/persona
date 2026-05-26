# Analytics Service (Java) - Complete Guide

**Project**: Event Tracking, User Behavior Analytics, and Reporting
**Language**: Java + Spring Boot
**Difficulty**: Intermediate-Advanced
**Time**: 4-5 hours
**Location**: `/persona/backend/services/analytics-service-java/`
**Port**: 8004

---

## Table of Contents
1. [What Does It Do?](#what-does-it-do)
2. [Why Java?](#why-java)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Event Processing Pipeline](#event-processing-pipeline)
6. [API Endpoints](#api-endpoints)
7. [How to Run](#how-to-run)
8. [Examples](#examples)

---

## What Does It Do?

**TL;DR**: Collects events from other services, analyzes user behavior, generates reports and dashboards.

### Responsibilities
- Event ingestion (from Kafka/RabbitMQ)
- Event parsing and validation
- Data aggregation and storage
- User behavior analysis
- Report generation
- Metrics computation
- Dashboard data queries
- Real-time analytics

### Event Examples
```
UserCreated { userId, timestamp, email }
PostCreated { userId, postId, timestamp, hashtags }
VideoWatched { userId, mediaId, duration, timestamp }
MediaUploaded { userId, mediaId, filesize, timestamp }
UserInterest { userId, type, entityId, action, timestamp }
SimulationCompleted { userId, simulationId, result, duration }
```

### Data Flow
```
User Service → Event: UserCreated
    ↓
[Kafka] topic: user.created
    ↓
Analytics Service consumes
    ↓
Stores in database
    ↓
Aggregates for dashboards
    ↓
Reports: "500 users registered today"
```

---

## Why Java?

### Characteristics
**1. Enterprise-Grade Reliability**
```java
// Spring framework handles:
- Dependency injection (clean code)
- Transaction management (data consistency)
- Error handling (graceful failures)
- Monitoring (built-in metrics)
```

**2. Perfect for Large-Scale Analytics**
```
Volume: Millions of events/day
Need: Reliable aggregation, exactly-once processing
Java provides: ACID transactions, exactly-once semantics

In Python/Node: Risk of losing events or double-counting
In Java: Guaranteed consistency
```

**3. Excellent Library Ecosystem**
```
Spring Boot     - Web framework
Kafka Streams   - Stream processing
Hibernate       - ORM
Micrometer      - Metrics
Testcontainers  - Integration tests
```

---

## Tech Stack

### Spring Boot
```java
@SpringBootApplication
public class AnalyticsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
    @GetMapping("/user/{id}")
    public UserAnalytics getUserAnalytics(@PathVariable Long id) {
        // Spring handles dependency injection, serialization, etc
    }
}
```

### Kafka (Message Queue)
```java
// Producer (other services)
kafkaTemplate.send("user.interest.created", event);

// Consumer (Analytics Service)
@KafkaListener(topics = "user.interest.created")
public void handleInterestCreated(UserInterestEvent event) {
    aggregationService.recordInterest(event);
}

// Processes: event ordering, deduplication, error handling
```

### Kafka Streams (Stream Processing)
```java
// Real-time aggregation without storing all data
StreamsBuilder builder = new StreamsBuilder();

KStream<String, InterestEvent> events = builder.stream("interests");

// Count interests by user, windowed by minute
KTable<Windowed<String>, Long> interests = events
    .groupByKey()
    .windowedBy(TimeWindows.of(Duration.ofMinutes(1)))
    .count();

interests.toStream()
    .to("interests-aggregated", Produced.with(...));
```

### PostgreSQL
```sql
-- Event storage
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100),
  user_id BIGINT,
  data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Aggregated statistics
CREATE TABLE user_analytics (
  user_id BIGINT PRIMARY KEY,
  posts_count INT,
  videos_watched INT,
  avg_watch_duration FLOAT,
  total_interests INT,
  last_activity_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Micrometer (Metrics)
```java
@Component
public class AnalyticsMetrics {
    private final MeterRegistry meterRegistry;
    
    public void recordEvent(String type) {
        // Sends metric to Prometheus
        Counter.builder("analytics.events")
            .tag("type", type)
            .register(meterRegistry)
            .increment();
    }
}

// Metrics exposed at /actuator/prometheus
# HELP analytics_events_total
# TYPE analytics_events_total counter
analytics_events_total{type="user.created"} 1234.0
```

---

## Architecture

### Folder Structure
```
analytics-service-java/
├── src/
│   ├── main/
│   │   └── java/com/persona/analytics/
│   │       ├── AnalyticsServiceApplication.java
│   │       ├── config/
│   │       │   ├── KafkaConfig.java
│   │       │   ├── DatabaseConfig.java
│   │       │   └── SecurityConfig.java
│   │       │
│   │       ├── api/
│   │       │   ├── controllers/
│   │       │   │   ├── EventController.java
│   │       │   │   ├── AnalyticsController.java
│   │       │   │   └── ReportController.java
│   │       │   ├── dto/
│   │       │   │   ├── EventDTO.java
│   │       │   │   └── AnalyticsResponse.java
│   │       │   └── exception/
│   │       │       └── GlobalExceptionHandler.java
│   │       │
│   │       ├── domain/
│   │       │   ├── Event.java
│   │       │   ├── UserAnalytics.java
│   │       │   └── Report.java
│   │       │
│   │       ├── service/
│   │       │   ├── EventService.java
│   │       │   ├── AggregationService.java
│   │       │   ├── ReportService.java
│   │       │   └── MetricsService.java
│   │       │
│   │       ├── repository/
│   │       │   ├── EventRepository.java
│   │       │   ├── AnalyticsRepository.java
│   │       │   └── ReportRepository.java
│   │       │
│   │       ├── kafka/
│   │       │   ├── EventConsumer.java
│   │       │   ├── EventStreamProcessor.java
│   │       │   └── EventProducer.java
│   │       │
│   │       └── metrics/
│   │           └── AnalyticsMetrics.java
│   │
│   └── test/
│       └── java/com/persona/analytics/
│           ├── service/
│           └── integration/
│
├── pom.xml              # Maven dependencies
└── application.yml      # Configuration
```

### Request Flow - Event Processing
```
Other Service publishes event
    ↓
POST /events/track
{
  "type": "user.interest.created",
  "userId": 123,
  "data": {...}
}
    ↓
[EventController.trackEvent()]
    ├─→ Validate event
    ├─→ Store in events table
    └─→ Publish to Kafka
         (for real-time aggregation)
    ↓
Return 202 Accepted
    ↓
[Kafka Topic: events]
    ├─→ Event Stream Processor
    │   ├─→ Parse event
    │   ├─→ Update user_analytics
    │   ├─→ Increment counters
    │   └─→ Publish to Prometheus
    │
    └─→ Report Generation Job
        (daily, hourly)
        ├─→ Aggregate data
        ├─→ Create report
        └─→ Store in database

[GET /analytics/user/{id}]
    ↓
[AnalyticsController]
    ├─→ Query user_analytics table
    └─→ Return computed metrics
```

---

## Event Processing Pipeline

### Step 1: Event Ingestion

```java
@RestController
@RequestMapping("/events")
public class EventController {
    private final EventService eventService;
    private final KafkaTemplate<String, EventMessage> kafkaTemplate;
    
    @PostMapping("/track")
    public ResponseEntity<?> trackEvent(@RequestBody EventDTO dto) {
        // 1. Validate
        if (!isValidEventType(dto.getType())) {
            return ResponseEntity.badRequest().build();
        }
        
        // 2. Extract user from JWT
        String userId = SecurityContextHolder.getContext()
            .getAuthentication()
            .getName();
        
        // 3. Create event
        Event event = new Event();
        event.setEventType(dto.getType());
        event.setUserId(Long.parseLong(userId));
        event.setData(dto.getData());
        event.setTimestamp(LocalDateTime.now());
        
        // 4. Store in database (for history)
        eventRepository.save(event);
        
        // 5. Publish to Kafka (for real-time processing)
        EventMessage message = EventMessage.from(event);
        kafkaTemplate.send("events", String.valueOf(event.getId()), message);
        
        return ResponseEntity.accepted().build();
    }
}
```

### Step 2: Real-Time Stream Processing

```java
@Component
public class EventStreamProcessor {
    private final AnalyticsRepository analyticsRepo;
    
    @Bean
    public java.util.function.Consumer<EventMessage> processEvents() {
        return event -> {
            // 1. Parse event type
            String type = event.getType();
            Long userId = event.getUserId();
            
            // 2. Route to appropriate handler
            switch(type) {
                case "user.interest.created":
                    handleInterestCreated(event, userId);
                    break;
                case "video.watched":
                    handleVideoWatched(event, userId);
                    break;
                case "post.created":
                    handlePostCreated(event, userId);
                    break;
                default:
                    log.warn("Unknown event type: {}", type);
            }
        };
    }
    
    private void handleInterestCreated(EventMessage event, Long userId) {
        // Update analytics atomically
        analyticsRepository.updateInterestCount(userId, 1);
        metricsService.incrementCounter("interests.created");
    }
    
    private void handleVideoWatched(EventMessage event, Long userId) {
        long duration = event.getData().getLong("duration");
        analyticsRepository.updateWatchStats(userId, duration);
        metricsService.recordDuration("video.watch.duration", duration);
    }
    
    private void handlePostCreated(EventMessage event, Long userId) {
        analyticsRepository.incrementPostCount(userId);
        metricsService.incrementCounter("posts.created");
    }
}
```

### Step 3: Aggregation

```java
@Service
public class AggregationService {
    
    @Scheduled(fixedRate = 60000)  // Every minute
    public void aggregateRecentMetrics() {
        // 1. Query recent events
        List<Event> recentEvents = eventRepository
            .findByCreatedAtAfter(LocalDateTime.now().minusMinutes(1));
        
        // 2. Group by user
        Map<Long, List<Event>> byUser = recentEvents.stream()
            .collect(Collectors.groupingBy(Event::getUserId));
        
        // 3. Compute metrics per user
        for (Map.Entry<Long, List<Event>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<Event> userEvents = entry.getValue();
            
            // Count events by type
            Map<String, Long> counts = userEvents.stream()
                .collect(Collectors.groupingBy(
                    Event::getEventType,
                    Collectors.counting()
                ));
            
            // Update analytics
            UserAnalytics analytics = analyticsRepository
                .findById(userId)
                .orElse(new UserAnalytics(userId));
            
            analytics.setPostsCount(analytics.getPostsCount() + 
                counts.getOrDefault("post.created", 0L).intValue());
            analytics.setVideosWatched(analytics.getVideosWatched() +
                counts.getOrDefault("video.watched", 0L).intValue());
            analytics.setLastActivityAt(LocalDateTime.now());
            
            analyticsRepository.save(analytics);
        }
    }
    
    @Scheduled(cron = "0 0 * * * *")  // Daily at midnight
    public void dailyAggregation() {
        // 1. Calculate daily totals
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        int newUsers = (int) eventRepository
            .countByEventTypeAndCreatedAtBetween(
                "user.created",
                yesterday.atStartOfDay(),
                yesterday.atTime(23, 59, 59)
            );
        
        int newPosts = (int) eventRepository
            .countByEventTypeAndCreatedAtBetween(
                "post.created",
                yesterday.atStartOfDay(),
                yesterday.atTime(23, 59, 59)
            );
        
        // 2. Store in database
        DailyReport report = new DailyReport();
        report.setDate(yesterday);
        report.setNewUsers(newUsers);
        report.setNewPosts(newPosts);
        reportRepository.save(report);
        
        // 3. Publish to message queue (send email, update dashboards)
        kafkaTemplate.send("reports.created", report);
    }
}
```

---

## API Endpoints

### Track Event
```
POST /events/track
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "user.interest.created",
  "data": {
    "entityType": "video",
    "entityId": "vid_123",
    "action": "watch",
    "metadata": {
      "duration": 1200
    }
  }
}

Response: 202 Accepted
```

### User Analytics
```
GET /analytics/user/{userId}
Authorization: Bearer {token}

Response:
{
  "userId": 1,
  "postsCount": 42,
  "videosWatched": 156,
  "avgWatchDuration": 245,  // seconds
  "totalInterests": 523,
  "lastActivityAt": "2026-01-20T15:30:00Z",
  "registeredAt": "2026-01-01T10:00:00Z",
  "engagement": "high"
}
```

### Trending Content
```
GET /analytics/trending?limit=10&period=day

Response:
{
  "trending": [
    {
      "type": "hashtag",
      "value": "#golang",
      "count": 1240,
      "growth": 2.5  // %
    },
    {
      "type": "hashtag",
      "value": "#programming",
      "count": 980,
      "growth": 1.8
    },
    ...
  ]
}
```

### Reports
```
GET /reports?startDate=2026-01-01&endDate=2026-01-31

Response:
{
  "reports": [
    {
      "date": "2026-01-01",
      "newUsers": 125,
      "newPosts": 412,
      "newVideos": 89,
      "engagedUsers": 3240,
      "avgSessionDuration": 1240  // seconds
    },
    ...
  ]
}
```

### Custom Report
```
POST /reports/custom
Authorization: Bearer {token}

{
  "name": "Q1 Growth Report",
  "metrics": ["newUsers", "newPosts", "engagement"],
  "groupBy": "week",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31"
}

Response:
{
  "reportId": "report_abc123",
  "status": "generating",
  "downloadUrl": "/reports/report_abc123/download"
}
```

---

## How to Run

### Prerequisites
```bash
# Java 17+
java --version

# Maven
mvn --version

# PostgreSQL
psql --version

# Kafka
kafka-topics.sh --version

# Redis (optional, for caching)
redis-cli ping
```

### Setup
```bash
cd /persona/backend/services/analytics-service-java

# Create database
createdb persona_analytics

# Create .env
cat > .env << EOF
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/persona_analytics
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_TOPIC_EVENTS=events

JWT_SECRET=your_secret_key

SERVER_PORT=8004
EOF

# Install dependencies
mvn clean install

# Run migrations
mvn flyway:migrate

# Build
mvn clean package -DskipTests
```

### Run Service
```bash
# Development
mvn spring-boot:run

# Production
java -jar target/analytics-service-1.0.0.jar

# With Docker
docker build -t analytics-service:latest .
docker run -p 8004:8004 analytics-service:latest
```

### Run Tests
```bash
# All tests
mvn test

# Integration tests (with testcontainers)
mvn verify

# With coverage
mvn test jacoco:report
# Opens target/site/jacoco/index.html
```

---

## Examples

### Example 1: Track User Interest

**Request**:
```bash
curl -X POST http://localhost:8004/events/track \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.interest.created",
    "data": {
      "entityType": "video",
      "entityId": "vid_456",
      "action": "like",
      "metadata": {
        "duration": 900
      }
    }
  }'
```

**Behind the scenes**:
```java
// EventController.trackEvent()
Event event = new Event();
event.setEventType("user.interest.created");
event.setUserId(123);  // from JWT
event.setData(dto.getData());

// Save to events table
eventRepository.save(event);  // Transactional

// Publish to Kafka (separate topic)
kafkaTemplate.send("events", event.getId().toString(), event);

// Kafka broker receives
// EventStreamProcessor picks up
  → handleInterestCreated()
  → analyticsRepository.updateInterestCount(123, 1)
  → UserAnalytics.totalInterests++ (from 522 to 523)
  → Update last_activity_at
  → Save to user_analytics

// Metrics recorded
metricsService.incrementCounter("interests.created");
→ analytics_interests_created_total = 50234
```

### Example 2: Get User Analytics

**Request**:
```bash
curl http://localhost:8004/analytics/user/123 \
  -H "Authorization: Bearer eyJhbGci..."
```

**Response**:
```json
{
  "userId": 123,
  "postsCount": 42,
  "videosWatched": 156,
  "avgWatchDuration": 245,
  "totalInterests": 523,
  "lastActivityAt": "2026-01-20T15:30:00Z",
  "registeredAt": "2026-01-01T10:00:00Z",
  "engagement": "high"
}
```

**Behind the scenes**:
```java
// AnalyticsController.getUserAnalytics()
UserAnalytics analytics = analyticsRepository.findById(userId)
    .orElseThrow(() -> new NotFoundException("User not found"));

// Calculate engagement level
String engagementLevel = calculateEngagement(analytics);
// if totalInterests > 500 → "very high"
// if totalInterests > 200 → "high"
// etc

return AnalyticsResponse.from(analytics, engagementLevel);
```

### Example 3: Generate Daily Report

**Scheduled job** (runs at midnight):
```java
@Scheduled(cron = "0 0 * * * *")
public void dailyAggregation() {
    LocalDate yesterday = LocalDate.now().minusDays(1);
    
    // 1. Count new users
    int newUsers = eventRepository.countByEventTypeAndDateBetween(
        "user.created",
        yesterday.atStartOfDay(),
        yesterday.plusDays(1).atStartOfDay()
    );
    
    // 2. Count new posts
    int newPosts = eventRepository.countByEventTypeAndDateBetween(
        "post.created",
        yesterday.atStartOfDay(),
        yesterday.plusDays(1).atStartOfDay()
    );
    
    // 3. Count engaged users (at least 1 activity)
    int engagedUsers = eventRepository.countDistinctUsersByDate(yesterday);
    
    // 4. Calculate avg session duration
    Double avgDuration = eventRepository.avgSessionDurationByDate(yesterday);
    
    // 5. Create and save report
    DailyReport report = new DailyReport();
    report.setDate(yesterday);
    report.setNewUsers(newUsers);
    report.setNewPosts(newPosts);
    report.setEngagedUsers(engagedUsers);
    report.setAvgSessionDuration(avgDuration);
    
    reportRepository.save(report);
    
    // 6. Publish event (trigger email, update dashboards)
    kafkaTemplate.send("reports.created", report);
}

// Email service listens to "reports.created" topic
// Sends: "Yesterday: 125 new users, 412 new posts"
```

---

## Key Concepts

### Event Sourcing
```
Store every event immutably
New users = SELECT * FROM events WHERE type='user.created'
Current state = Replay all events
Benefits: Audit trail, replayability, exact history
```

### CQRS (Command Query Responsibility Segregation)
```
Write: Store raw events
       events table (immutable log)

Read: Query pre-aggregated data
      user_analytics table (denormalized, fast queries)

Separates: Write model (events) from Read model (analytics)
Benefits: Optimize each independently
```

### Exactly-Once Processing
```
Kafka guarantees + database transactions
= No lost events, no duplicates

Risk: Network error during processing
Solution: Idempotent operations + deduplication
```

---

## Next Steps
1. Run service: `mvn spring-boot:run`
2. Try endpoints with Postman
3. Understand: Kafka topics, Spring Data, Migrations
4. Write custom report
5. Deploy with Docker → Kubernetes
