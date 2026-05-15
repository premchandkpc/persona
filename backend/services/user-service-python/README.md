# User Service - Python

User management and authentication service built with Python.

## Features
- User registration & login
- Profile management
- Interest tracking (videos, audios, simulations, letters, posts)
- User relationships (follow, connections)
- JWT token management

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **ORM**: SQLAlchemy

## API Endpoints
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user
- `POST /users/{id}/interests` - Add user interests
- `GET /users/{id}/interests` - Get user interests

## Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
fastapi run src/main.py
```

## Port
8001
