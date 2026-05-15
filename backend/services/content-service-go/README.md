# Content Service - Go

Content management service for posts, letters, and Instagram content built with Go.

## Features
- Post creation & management
- Letter system
- Instagram content integration
- Content discovery & search
- Tag & category management

## Tech Stack
- **Framework**: Gin/Chi
- **Database**: PostgreSQL
- **Search**: Elasticsearch
- **Language**: Go

## API Endpoints
- `POST /posts` - Create post
- `GET /posts` - Get posts feed
- `GET /posts/{id}` - Get post details
- `PUT /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `POST /letters` - Create letter
- `GET /letters` - Get letters

## Setup
```bash
go mod init github.com/persona/content-service
go get -u ./...
```

## Run
```bash
go run main.go
```

## Port
8002
