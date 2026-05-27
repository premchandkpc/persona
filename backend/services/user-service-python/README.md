# User Service (Python) — Interview Prep & Tricky Points

User management and authentication service built with **Python + FastAPI**.

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Framework | FastAPI | Async, auto-docs, type hints → validation |
| Database | PostgreSQL | ACID compliance for user data |
| Cache | Redis | Session tokens, rate limiting |
| Auth | JWT | Stateless, no DB lookup |
| ORM | SQLAlchemy | Mature, async support, migration integration |

---

## Interview Questions

### Python / FastAPI

**Q: Why FastAPI over Flask or Django?**
A: FastAPI is async-native (coroutines), auto-generates OpenAPI docs from Python type hints, has built-in validation (Pydantic), and performs comparably to Node.js/Go. Flask is synchronous and requires extensions for validation. Django is heavier — great for full-featured apps, overkill for a microservice.

**Q: How does FastAPI validate request bodies?**
A: Uses Pydantic models. Type hints define the schema: `class UserCreate(BaseModel): email: EmailStr; password: str`. FastAPI automatically validates, parses, and returns 422 with detailed error messages on mismatch. No manual validation code needed.

**Q: What is the difference between `async def` and `def` in FastAPI?**
A: `async def` runs on the event loop — use for I/O-bound endpoints (DB queries, HTTP calls). `def` runs in a thread pool — use for CPU-bound code (password hashing, image processing). Blocking the event loop with `def` sync code kills performance.

### Authentication

**Q: How do you store passwords securely?**
A: Never store plaintext. Use a strong hashing algorithm: bcrypt (adaptive cost factor), argon2 (memory-hard), or scrypt. Python's `passlib` library provides a unified API. Always use a unique salt per password. FastAPI: `password = pwd_context.hash(raw_password)`.

**Q: How does JWT authentication work?**
A: User logs in → server verifies credentials → server signs a JWT (`header.payload.signature`) → client stores JWT → client sends JWT in `Authorization: Bearer <token>` header → server middleware verifies signature and expiry → request proceeds.

**Q: Access token vs refresh token?**
A: Access token (short-lived, 15min) is sent with every request. Refresh token (long-lived, 7-30 days) is used to get new access tokens without re-login. Refresh tokens are stored in Redis and can be revoked. This limits the damage if an access token is leaked.

### Database

**Q: Why SQLAlchemy over raw SQL?**
A: ORM provides: object mapping (rows → Python objects), relationship loading (lazy/eager), migration integration (Alembic), and database abstraction (switch PostgreSQL ↔ SQLite for testing). Raw SQL is faster for complex queries but harder to maintain. Use ORM for CRUD, raw SQL for reports.

**Q: How do you handle database migrations?**
A: Alembic + SQLAlchemy. Define models → `alembic revision --autogenerate -m "description"` → review the generated migration → `alembic upgrade head`. Always review auto-generated migrations.

## Tricky Points

| Pitfall | Explanation | Fix |
|---------|-------------|-----|
| **Async database sessions** | Using sync SQLAlchemy session in async endpoint blocks the event loop | Use `AsyncSession` from `sqlalchemy.ext.asyncio` |
| **N+1 queries with ORM** | Lazy-loading relationships in a loop triggers N extra queries | Use `joinedload()` or `selectinload()` to eager-load |
| **JWT secret key exposure** | Hardcoded secret in code → repo leak → all tokens are forgeable | Use environment variables or a secrets manager |
| **Password hashing is slow** | bcrypt cost=12 takes ~250ms per hash. 100 concurrent logins = 25s CPU | Use async (`run_in_executor`) or increase service replicas |
| **SQL injection via raw SQL** | String formatting in SQL queries (`f"WHERE id = {id}"`) | Never use f-strings in SQL. Use parameterized queries (`:id` or `?`) |
| **Email case sensitivity** | "User@Example.com" ≠ "user@example.com" in DB search | Normalize to lowercase before storing and comparing |

## Common Endpoint Patterns

```python
@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == user.email))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")
    hashed = pwd_context.hash(user.password)
    db_user = User(email=user.email, password_hash=hashed)
    db.add(db_user)
    await db.commit()
    return db_user
```
