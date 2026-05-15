# Database Schemas

Database schema definitions for all services.

## Databases
- **PostgreSQL** - Relational data (users, posts, analytics)
- **MongoDB** - Document storage (user content, media metadata)
- **Redis** - Caching & sessions
- **Elasticsearch** - Search & analytics

## PostgreSQL Schemas

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### posts table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(500),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Run Migrations
```bash
# Using Alembic (Python)
alembic upgrade head

# Using Flyway (Java)
mvn flyway:migrate

# Using sql-migrate (Go)
sql-migrate up
```
