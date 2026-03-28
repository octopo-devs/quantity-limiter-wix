# Quantity Limiter for Wix

A Wix app that allows store owners to set quantity limits (min/max) on products, collections, customers, and orders. The app displays warning messages on the storefront when limits are reached.

## Repository Structure

This is a monorepo with three sub-projects:

```
quantity-limiter-wix/
  quantity-limiter-backend/   # NestJS backend API + storefront (excluded)
  quantity-limiter-frontend/  # React dashboard (Wix embedded app)
  quantity-limiter/           # Wix CLI app (embedded script extension)
  openspec/                   # Design specs and change proposals
```

## Sub-Projects

### quantity-limiter-backend (NestJS API)

- **Framework**: NestJS v11 with TypeScript
- **Database**: MariaDB via TypeORM (SnakeNamingStrategy)
- **Cache**: Redis via `@nestjs/cache-manager` + `@keyv/redis`
- **Queue**: Bull (Redis-backed) via `@nestjs/bull`
- **Auth**: Passport (JWT + custom header strategy)
- **API Docs**: Swagger via `@nestjs/swagger` + Scalar UI
- **Logging**: Winston via `nest-winston`
- **Cron**: `@nestjs/schedule`
- **File Storage**: AWS S3 (`@aws-sdk/client-s3`)
- **Default port**: 4000 (configurable via `PORT` env var)
- **API prefix**: configurable via `API_ENDPOINT_PREFIX` (default: `api`, production: `/w/api`)

#### Backend Modules

| Module         | Path                           | Description                                                                    |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| Rules          | `src/modules/rules/`           | CRUD for quantity limit rules (product, collection, customer, order types)     |
| Shop           | `src/modules/shop/`            | Shop info, general settings, onboarding, Crisp chat, Canny feedback            |
| Wix            | `src/modules/wix/`             | OAuth install flow, products/collections proxy from Wix API                    |
| Webhook        | `src/modules/webhook/`         | Wix webhook handler                                                            |
| Attributes     | `src/modules/attributes/`      | Synced product/collection data from Wix                                        |
| Branding       | `src/modules/branding/`        | Storefront appearance/branding configuration                                   |
| Analytics      | `src/modules/analytics/`       | Onboarding and touchpoint logging                                              |
| Admin          | `src/modules/admin/`           | Internal admin dashboard, daily logs, performance metrics                      |
| PublicEndpoint | `src/modules/public-endpoint/` | Unauthenticated APIs for storefront (shop metafields, product info, cart info) |
| CustomerIo     | `src/modules/customer-io/`     | Customer.io event integration                                                  |
| File           | `src/modules/file/`            | File upload/management                                                         |

#### Backend Shared

| Module      | Path                       | Description                                                            |
| ----------- | -------------------------- | ---------------------------------------------------------------------- |
| Database    | `src/shared/database/`     | TypeORM database connection setup                                      |
| Auth        | `src/shared/auth/`         | Passport strategies and guards (`HeaderAuthGuard`, `WebhookAuthGuard`) |
| Cron        | `src/shared/cron/`         | Scheduled jobs (admin daily, attribute sync, data removal)             |
| Queue       | `src/shared/queue/`        | Bull queue processors                                                  |
| CustomCache | `src/shared/custom-cache/` | Custom cache module with `CustomCacheInterceptor`                      |
| Logger      | `src/shared/logger/`       | Winston-based `GlobalLogger`                                           |
| Health      | `src/shared/health/`       | Health check endpoints (`/health/ready`, `/health/live`)               |

#### Database Entities

- **Rule** (`rules`): Core entity. Fields: `id` (UUID), `shop`, `name`, `type` (enum: PRODUCT/COLLECTION/CUSTOMER/ORDER), `isActive`, `minQty`, `maxQty`, notification settings, message templates. Has OneToOne relations to `RuleProduct`, `RuleCollection`, `RuleCustomer`, `RuleOrder`.
- **RuleProduct** (`rule-product.entity.ts`): Product-specific rule config (selection type: ALL/GROUP/SPECIFIC)
- **RuleCollection** (`rule-collection.entity.ts`): Collection-specific rule config
- **RuleCustomer** (`rule-customer.entity.ts`): Customer-specific rule config
- **RuleOrder** (`rule-order.entity.ts`): Order-level rule config (total products/price/weight)
- **ShopGeneral** (`shop-general.entity.ts`): Main shop record, has OneToMany to rules
- **ShopInfo** (`shop-info.entity.ts`): Extended shop information
- **ShopInstalled** (`shop-installed.entity.ts`): Installation tracking

#### Rule Enums

- **RuleType**: `PRODUCT`, `COLLECTION`, `CUSTOMER`, `ORDER`
- **NotificationTrigger**: `LIMIT_REACHED`, `ADD_TO_CART_BUTTON_CLICKED`, `NO_NOTIFICATION`
- **ProductSelectionType**: `ALL_PRODUCTS`, `GROUP_OF_PRODUCTS`, `SPECIFIC_PRODUCTS`
- **GroupProductConditionType**: `TAG`, `VENDOR`, `TITLE`
- **GroupProductConditionOperator**: `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`
- **OrderConditionType**: `TOTAL_PRODUCTS`, `TOTAL_PRICE`, `TOTAL_WEIGHT`

#### Key Backend Scripts

```bash
npm run start:dev     # Dev with watch mode
npm run build         # Build with NestJS CLI
npm run lint          # ESLint with fix
npm run format        # Prettier
npm run isready       # format + lint + build
npm run migration:generate  # Generate TypeORM migration
npm run migration:run       # Run migrations
npm run migration:revert    # Revert last migration
```

### quantity-limiter-frontend (React Dashboard)

- **Framework**: React 18 with TypeScript, Vite bundler
- **UI Library**: `@wix/design-system` (WDS) v1.240+ with `@wix/wix-ui-icons-common`
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`) + Redux Persist
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM v6
- **API Client**: RTK Query (`createApi` with `fetchBaseQuery`)
- **Styling**: styled-components v5
- **Wix SDK**: `@wix/sdk` + `@wix/dashboard` for embedded app context
- **Auth**: Instance token from URL params sent as `Authorization` header

#### Frontend Pages

| Page         | Path              | Description                                                                  |
| ------------ | ----------------- | ---------------------------------------------------------------------------- |
| Home         | `/home`           | Dashboard home                                                               |
| Rules        | `/rules`          | Rules list/table                                                             |
| CreateRule   | `/rules/create`   | Multi-step rule creation wizard (Step 1: type selection, Step 2: rule setup) |
| EditRule     | `/rules/edit/:id` | Edit existing rule (reuses CreateRule component)                             |
| Appearance   | `/appearance`     | Branding/appearance settings                                                 |
| Analytics    | `/analytics`      | Analytics page (stub)                                                        |
| Pricing Plan | `/pricing-plan`   | Pricing page (stub)                                                          |
| Onboarding   | `/onboarding`     | Welcome/onboarding flow (stub)                                               |

#### Frontend Key Components

- **GroupProductConditionBuilder**: Builder for product group conditions (tag/vendor/title filters)
- **SelectWixProductModal**: Product picker modal (Wix products)
- **SelectCollectionModal**: Collection picker modal
- **Preview**: Live preview component (QuantitySelector, WarningMessage, WarningModal)
- **ConfirmDeleteModal**: Delete confirmation dialog
- **Layout**: App shell with sidebar navigation

#### Redux Slices

`auth`, `settings`, `appearance`, `createRule`, `preview`, `highlightPreview`, `toast`, `banner`, `popup`, `session`, `cache`, `loading`, `navigate`, `appbar`, `error`

#### Frontend Key Scripts

```bash
npm run dev      # Vite dev server
npm run build    # Vite production build
npm run lint     # ESLint
npm run format   # Prettier
```

## Infrastructure

### CI/CD (GitLab CI)

- **Registry**: GitLab Container Registry
- **Pipeline stages**: build -> migration_generate -> push_migrations -> migration_apply (manual) -> deploy
- **Environments**:
  - **Dev**: branch `develop`, domain `quantity-limiter-wix-dev.megamind-dev.online`
  - **Production**: tags on `main`, domain `quantity-limiter-wix.synctrack.ioo`
- **Migrations**: Auto-generated, stored in separate `migrations-storage` repo, applied manually

### Kubernetes Deployment

- **Namespace**: `app-quantity-limiter`
- **Deployments**: Main API (port 3000) + separate Cron worker (port 3001)
- **HPA**: CPU-based autoscaling (70% threshold), min/max replicas configurable per env
- **Probes**: Readiness (`/health/ready`) and Liveness (`/health/live`)
- **Resources**: 256Mi-512Mi memory, 200m-500m CPU per pod

### Docker

- Multi-stage build: builder (NestJS) -> storefront_builder (Vite) -> production
- Storefront build output goes to `extensions/` directory
- Production runs with `--max-old-space-size=1024`

## Environment Variables

Key env vars (see `.env.example`):

| Variable                              | Description                                         |
| ------------------------------------- | --------------------------------------------------- |
| `PORT`                                | Server port (default: 4000 dev, 3000 prod)          |
| `API_ENDPOINT_PREFIX`                 | API route prefix (default: `api`, prod: `/w/api`)   |
| `APP_ID`                              | Wix App ID                                          |
| `APP_SECRET`                          | Wix App Secret                                      |
| `DB_HOST/PORT/USERNAME/PASSWORD/NAME` | MariaDB connection                                  |
| `DB_ENTITY_PREFIX`                    | Table prefix (default: `order_limiter`)             |
| `DB_SYNCHRONIZE`                      | TypeORM auto-sync (should be `false` in production) |
| `REDIS_HOST/PORT`                     | Redis for cache and Bull queues                     |
| `AWS_S3_*`                            | S3 file storage                                     |
| `TELEGRAM_TOKEN/CHAT_ID`              | Telegram notifications                              |
| `CIO_SITE_ID/API_KEY`                 | Customer.io integration                             |
| `GA_MEASUREMENT_ID/API_SECRET`        | Google Analytics                                    |

## Conventions

- Backend follows NestJS module pattern: each module has `controller`, `service`, `module`, `dto/`, `entities/`, `types/`, `response/` subdirectories
- Frontend uses RTK Query for API calls, Redux slices for UI state
- Database uses snake_case naming (via `SnakeNamingStrategy`), entity prefix `order_limiter`
- TypeORM migrations are auto-generated and stored externally
- Frontend is embedded in Wix dashboard using `@wix/sdk` + `@wix/dashboard` host
- Auth uses Wix instance token passed as `Authorization` header from frontend
