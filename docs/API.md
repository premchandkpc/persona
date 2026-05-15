# API Documentation

Complete API reference for all services.

## Base URLs

| Service | URL |
|---------|-----|
| User Service | http://localhost:8001 |
| Content Service | http://localhost:8002 |
| Media Service | http://localhost:8003 |
| Analytics Service | http://localhost:8004 |
| Simulation Service | http://localhost:8005 |

## Authentication

All endpoints require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

## User Service

### Register User
```
POST /users/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "username"
}
```

### Login
```
POST /users/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Response:
```
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Get User Profile
```
GET /users/{id}
```

### Add User Interests
```
POST /users/{id}/interests
{
  "interests": ["videos", "audios", "simulations"]
}
```

---

## Content Service

### Create Post
```
POST /posts
{
  "title": "My Post",
  "content": "Post content here",
  "tags": ["tag1", "tag2"]
}
```

### Get Posts Feed
```
GET /posts?limit=20&offset=0
```

### Get Post Details
```
GET /posts/{id}
```

### Update Post
```
PUT /posts/{id}
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

### Delete Post
```
DELETE /posts/{id}
```

---

## Media Service

### Upload Media
```
POST /media/upload
Form Data:
  - file: <binary>
  - type: "video|audio"
  - title: "Media Title"
```

Response:
```
{
  "id": "media-id",
  "url": "https://cdn.example.com/media-id",
  "status": "processing"
}
```

### Stream Media
```
GET /media/{id}/stream
```

### Get Media Info
```
GET /media/{id}/info
```

---

## Analytics Service

### Track Event
```
POST /events
{
  "event_type": "view|click|share",
  "target_id": "content-id",
  "metadata": { ... }
}
```

### Get User Analytics
```
GET /analytics/user/{id}
```

### Generate Report
```
GET /reports?start_date=2024-05-01&end_date=2024-05-31
```

---

## Simulation Service

### Create Simulation
```
POST /simulations
{
  "name": "Simulation Name",
  "params": { ... }
}
```

### Run Simulation
```
POST /simulations/{id}/run
```

### Get Results
```
GET /simulations/{id}/results
```

---

## Error Responses

All services return standardized error responses:

```
{
  "error": "error_code",
  "message": "Human-readable message",
  "status": 400
}
```

### Common Error Codes
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `CONFLICT` - 409
- `UNPROCESSABLE_ENTITY` - 422
- `INTERNAL_SERVER_ERROR` - 500

---

For detailed API specs, see OpenAPI documentation in each service folder.
