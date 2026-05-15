# Database Migrations

Migration scripts for database schema changes.

## Format
- Version: YYYYMMDD_HHmmss
- Example: `20240515_100000_create_users_table.sql`

## Python (Alembic)
```bash
alembic revision --autogenerate -m "Create users table"
alembic upgrade head
```

## Go (sql-migrate)
```bash
sql-migrate up
```

## Java (Flyway)
```bash
mvn clean flyway:migrate
```

## All migrations are version controlled in this directory.
