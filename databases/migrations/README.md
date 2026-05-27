# Database Migrations — Interview Prep & Tricky Points

Migration scripts for schema changes. Version-controlled in `YYYYMMDD_HHmmss` format.

---

## Migration Strategy — Interview Questions

**Q: Why version migrations in filenames instead of a tool's internal metadata?**
A: Filenames are human-readable, sortable, and conflict-detectable in code review. But the real source of truth is the migration tool's tracking table (`alembic_version`, `flyway_schema_history`, `schema_migrations`). The tool checks which migrations have run and applies pending ones in order.

**Q: How do you handle a failed migration?**
A: **Alembic**: wraps each migration in a transaction — auto-rollback on failure. **Flyway**: does NOT wrap in a transaction by default — manual rollback or write a compensating migration. **Go `sql-migrate`**: supports transactions per migration. Always test migrations against a copy of production data first.

**Q: How do you make backward-compatible schema changes?**
A: The expand-migrate-contract pattern: (1) **Expand**: add the new column/table without removing the old one. (2) **Migrate**: update application code to use both old and new. (3) **Contract**: once all code is deployed, remove the old column in a separate migration. This enables zero-downtime deployments.

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Long-running migrations** | Adding an index on a 100M-row table locks writes for minutes | Use `CREATE INDEX CONCURRENTLY` (PostgreSQL) to avoid table lock |
| **NOT NULL on existing table** | Adding `NOT NULL` to a column with NULL values fails | Add column as nullable, backfill data, then add NOT NULL constraint |
| **Renaming columns** | Old application code still references the old name | Expand-migrate-contract pattern. Or rename + deploy in 2 steps. |
| **Migration order in CI** | Multiple developers add migrations with same timestamp | Use timestamps + sequence numbers (`20240515_100000_01`). Or use hash-based IDs (Flyway). |
| **Down migrations** | Without a down migration, rollback is impossible | Always write a `downgrade()` function. Test it. |
| **Irreversible migrations** | Dropping a column loses data, can't be reversed | Keep a backup. Or mark the migration as irreversible and document the data loss. |
| **Environment drift** | Staging and production have different schema states | Use the same migration tool in all environments. Never manually alter schemas. |

## Tool-Specific Questions

**Q: Alembic vs Flyway?**
A: Alembic (Python): auto-generation from SQLAlchemy models, Python-based migrations, great for Python services. Flyway (Java): SQL-based, versioned, idempotent, language-agnostic, widely adopted in Java/Kotlin ecosystems. Choose based on your service language.

**Q: Why auto-generate migrations?**
A: `alembic revision --autogenerate` compares your SQLAlchemy models against the current database and generates a migration script. This catches all differences and reduces human error. **Always review** the generated script — auto-generation can miss subtle changes or generate suboptimal SQL.

## Key Concepts

- **Idempotent migrations**: Running the same migration twice should have no effect (`IF NOT EXISTS`, `CREATE OR REPLACE`)
- **Transactional DDL**: PostgreSQL supports DDL in transactions — rollback if migration fails
- **Version lock**: Multiple services should not share the same `schema_version` table
- **Seed data**: Migration scripts can include `INSERT` for reference/lookup tables
