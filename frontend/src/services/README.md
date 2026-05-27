# Frontend Services — Interview Prep & Tricky Points

Business logic, data fetching, and utility functions for the React component library.

## Files

| File | Purpose | Key Interview Point |
|------|---------|-------------------|
| `api.js` | HTTP client wrapping `fetch()` | Error handling, request/response interception |
| `storage.js` | localStorage wrapper with JSON serialization | SSR safety, quota handling, try-catch |
| `formatter.js` | Date/number/currency/bytes/string formatters | Locale-aware formatting, pure functions |

---

## API Service (`api.js`)

**Q: Why wrap `fetch()` instead of using Axios?**
A: `fetch()` is native — no dependency, smaller bundle. Axios adds JSON parsing, interceptors, cancellation, and wider browser support. Our wrapper matches the project's zero-dependency philosophy. For production, consider adding interceptors for auth token injection and 401 redirect.

**Q: How do you handle network errors vs HTTP errors?**
A: `fetch()` only rejects on network failure (DNS, timeout, connection refused). HTTP 4xx/5xx are not rejections — they're successful responses with `response.ok = false`. The wrapper must check `response.ok` and throw for non-2xx.

**Q: How would you add request cancellation?**
A: Pass an `AbortController.signal` to `fetch()`. Call `controller.abort()` to cancel. In a hook, abort on cleanup (unmount) or when a new request starts. This prevents updating state with stale responses.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| `fetch()` doesn't throw on 4xx/5xx | Must check `response.ok` explicitly |
| JSON parsing can fail | `response.json()` throws SyntaxError on non-JSON. Wrap in try-catch. |
| Credentials omitted by default | Set `credentials: 'include'` for cross-origin cookies |
| No timeout by default | Use `AbortSignal.timeout(5000)` or wrap with a timeout race |
| CORS preflight | POST with JSON content-type triggers OPTIONS preflight. Server must handle it. |

---

## Storage Service (`storage.js`)

**Q: Why wrap localStorage at all?**
A: (1) JSON serialization — localStorage stores strings. The wrapper auto-serializes. (2) Error handling — `QuotaExceededError`, private browsing mode, SSR. (3) Unified API — consistent `set/get/remove/clear`.

**Q: How do you handle SSR (server-side rendering)?**
A: Wrap all localStorage access in try-catch. On the server, localStorage is undefined. The `get()` function catches the ReferenceError and returns the default value. This is essential for frameworks like Next.js.

**Q: What happens when localStorage is full?**
A: `setItem` throws `QuotaExceededError` (~5-10MB limit per origin). Handle gracefully: catch the error, evict old data, or notify the user. Never let a storage write crash the app.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **QuotaExceededError** | User has too much stored data. Catch and handle gracefully. |
| **Private/incognito mode** | Some browsers throw on localStorage access. Try-catch catches it. |
| **SSR crash** | Calling localStorage on the server throws. Always guard with try-catch. |
| **Stale data** | Data written by an old app version may be incompatible. Version your schema. |
| **Race conditions** | `set` in one tab, `get` in another. Use `storage` event to sync across tabs. |

---

## Formatter Service (`formatter.js`)

**Q: Why use `Intl` APIs instead of manual formatting?**
A: `Intl.NumberFormat`, `Intl.DateTimeFormat`, and `Intl.ListFormat` are native, locale-aware, and handle edge cases (Arabic numerals, right-to-left, calendar systems). Manual formatting always misses edge cases and is significantly more code.

**Q: How do you format bytes (1024 vs 1000)?**
A: Use IEC binary prefixes (KiB, MiB, GiB) for RAM/file sizes (1024-based). Use SI decimal prefixes (KB, MB, GB) for disk/networking (1000-based). The `bytes()` function should accept a `standard` parameter.

### Tricky Points

| Pitfall | Explanation |
|---------|-------------|
| **toLocaleString behavior differs by browser** | IE used different format than Chrome. Polyfill for older browsers. |
| **Currency formatting and rounding** | `style: 'currency'` handles rounding automatically. Manual rounding + string concat gives wrong results. |
| **Time zone handling** | Dates without time zone info are treated as UTC in `toLocaleString`. Always specify `timeZone`. |
| **Large number performance** | Formatting thousands of numbers in a loop is slow. Memoize or use a VirtualList. |
