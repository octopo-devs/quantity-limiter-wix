# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `../CLAUDE.md` for project overview, full command reference, and CI/CD details.

## Commands

```bash
pnpm start:dev           # Dev server with watch (port 4000)
pnpm build               # Production build (nest build)
pnpm isready             # format + lint + build (pre-commit gate)
pnpm test                # Jest unit tests
pnpm test:e2e            # E2E tests (uses ./tests/jest-e2e.json config)
pnpm migration:generate  # Generate TypeORM migration (build first!)
pnpm migration:run       # Apply pending migrations
```

Run a single test: `pnpm jest --testPathPattern=<pattern>`

## Architecture

### Module Layout

Each feature module in `src/modules/` follows: `controller.ts`, `service.ts`, `module.ts`, `dto/`, `entities/`, `types/`, `response/`. Shared infrastructure lives in `src/shared/` (auth, cron, database, health, logger, middlewares, queue).

### Auth Flow

Three guards with distinct use cases:

| Guard | Strategy | Used For |
|---|---|---|
| `HeaderAuthGuard` | `HeaderStrategy` (passport-custom) | Dashboard API — validates HMAC-signed Wix instance token (`sign.base64data` format) or internal secret key |
| `WebhookAuthGuard` | RS256 JWT from raw body | Wix webhook callbacks |
| `ParamsAuthGuard` | Query param strategy | Query-param authenticated endpoints |

The `HeaderStrategy` extracts `instanceId` from the decoded token and injects it as `request.body.shop` (POST/PUT) or `request.query.shop` (GET/DELETE). Internal access bypasses HMAC via `INTERNAL_SECRET_KEY` or `api_key` + `scope` JSON.

### Request Lifecycle

`main.ts` bootstraps: global `ValidationPipe` (transform: true), `ClassSerializerInterceptor`, `LoggingMiddleware` (excluded for webhook routes, logs requests >500ms or non-2xx), URI versioning with `VERSION_NEUTRAL` default.

### Database

- MariaDB via TypeORM, `SnakeNamingStrategy`, entity prefix from `DB_ENTITY_PREFIX` env
- DataSource config: `db/data-source.ts` (used by CLI migrations)
- Migrations output to `dist/db/migrations/` — must `pnpm build` before generating
- Redis-backed query caching via `CustomCacheService` in `src/shared/database/`

### Queues (Bull)

Redis-backed, prefix `quantity-limiter`. Processors in `src/shared/queue/`. Default: 5 retries, 10min exponential backoff.

### Public API (Storefront)

`src/modules/public-endpoint/` — unauthenticated endpoints secured by HMAC-SHA256 (not the auth guards). Used by the storefront IIFE bundle. Endpoints: `shop-metafield`, `currentProduct`, `currentCart`.

### Rule Entity Hierarchy

`Rule` has four optional OneToOne children (`cascade: true`, `orphanedRowAction: 'delete'`, `eager: true`):
- `RuleProduct` — product-level limits with condition groups
- `RuleCollection` — collection-level limits
- `RuleCustomer` — customer-level limits
- `RuleOrder` — order aggregate limits (total products/price/weight)

Only one child relation is populated per rule, matching the `type` enum.

## Testing

- Unit tests: co-located as `*.spec.ts` next to source files
- E2E tests: `tests/` directory, `*.e2e-spec.ts` pattern, uses full `AppModule` with real DB
- Path alias in tests: `src/` maps to `<rootDir>/` (see `moduleNameMapper` in package.json jest config)

## Conventions

- API response format: `{ code, data, meta, message }`
- `shop` parameter: Wix instance ID string, injected by auth guards — never passed manually from frontend
- Entity prefix: all tables prefixed with `DB_ENTITY_PREFIX` value (default: `order_limiter`)
- Husky pre-commit runs lint-staged (prettier + eslint on `*.ts`)
