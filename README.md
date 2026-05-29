# Patio Sarduy — E-commerce

Plataforma de venta online para el organopónico comunitario Patio Sarduy, Cienfuegos, Cuba.  
Permite explorar el catálogo de plantas, armar un carrito y confirmar pedidos de recogida en tienda.

---

## Estructura del proyecto

Monorepo gestionado con **Turborepo** y **pnpm workspaces**.

```
apps/
  api-backend/      → API REST (NestJS 11 + TypeORM + PostgreSQL)
  customer-store/   → Tienda del cliente (React 19 + Vite + Tailwind CSS v4)
  e-commerce/       → Panel de administración (React 19 + Vite)
```

---

## Requisitos previos

- Node.js 18+
- pnpm 9+
- Docker y Docker Compose

---

## Levantar el entorno local

### 1. Infraestructura (base de datos + almacenamiento)

```bash
docker compose up -d
```

Levanta:
- **PostgreSQL 18** → `localhost:5434` (usuario/contraseña: `postgres`, base de datos: `patio_sarduy`)
- **MinIO** → `localhost:9000` (consola en `localhost:9001`, usuario/contraseña: `minioadmin`)

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Aplicar migraciones de base de datos (primera vez)

```bash
cd apps/api-backend
pnpm run migration:run
```

### 4. Iniciar todos los servicios

Desde la raíz del monorepo:

```bash
pnpm dev
```

O por separado:

```bash
# Backend
cd apps/api-backend && pnpm dev      # http://localhost:3000

# Tienda del cliente
cd apps/customer-store && pnpm dev   # http://localhost:5173

# Panel admin
cd apps/e-commerce && pnpm dev
```

---

## Variables de entorno — Backend

Crea un archivo `.env` en `apps/api-backend/` con:

```env
DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=patio_sarduy

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=patio-sarduy

JWT_SECRET=cambia_esto_en_produccion
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11, TypeORM 0.3, PostgreSQL 18 |
| Frontend tienda | React 19, Vite, Tailwind CSS v4, Shadcn/ui, Framer Motion |
| Estado global | Redux Toolkit + TanStack Query |
| Autenticación | JWT (Bearer token) |
| Almacenamiento imágenes | MinIO (compatible S3) |
| Monorepo | Turborepo + pnpm workspaces |

---

## Scripts útiles

```bash
pnpm dev              # Inicia todos los apps en paralelo
pnpm build            # Compila todos los apps
pnpm lint             # Linting en todo el monorepo

# Migraciones (desde apps/api-backend)
pnpm run migration:run     # Aplica migraciones pendientes
pnpm run migration:revert  # Revierte la última migración
```

pnpm dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
