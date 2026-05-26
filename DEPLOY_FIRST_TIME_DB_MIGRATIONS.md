# Guia de primer despliegue: aplicar migraciones antes de levantar la API

Esta guia aplica al backend Nest + TypeORM del proyecto en `apps/api-backend`.

## Objetivo

Asegurar que la base de datos quede en el esquema correcto antes de iniciar la API por primera vez.

## Scripts reales del proyecto

En `apps/api-backend/package.json` existen:

- `migration:run`: ejecuta migraciones pendientes.
- `migration:revert`: revierte la ultima migracion.
- `typeorm`: CLI de TypeORM con `typeorm-ts-node-commonjs`.

DataSource configurado en `apps/api-backend/src/database/data-source.ts`:

- `synchronize: false` (correcto para produccion)
- DB por variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

## Prerrequisitos

1. Tener Docker y Docker Compose disponibles.
2. Tener Node 18+ y pnpm 9+.
3. Tener variables de entorno de DB correctas para el backend.

Variables esperadas (ejemplo local):

- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=patio_sarduy`

## Flujo recomendado para primer despliegue

Ejecuta estos pasos desde la raiz del monorepo.

### 1) Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### 2) Levantar la base de datos y esperar salud

```bash
docker compose up -d postgres
docker compose ps postgres
```

Debes ver estado `healthy` en el servicio `postgres`.

Si aun no esta healthy, espera unos segundos y vuelve a consultar:

```bash
docker compose ps postgres
```

### 3) Validar conectividad de DB (opcional pero recomendado)

```bash
docker exec -it patio-postgres psql -U postgres -d patio_sarduy -c "select version();"
```

### 4) Ejecutar migraciones ANTES de iniciar la API

```bash
pnpm --filter api-backend run migration:run
```

Esto aplicara, en orden, las migraciones existentes de `apps/api-backend/src/database/migrations`.

### 5) Confirmar que quedaron registradas

```bash
docker exec -it patio-postgres psql -U postgres -d patio_sarduy -c "select * from migrations order by timestamp;"
```

### 6) Iniciar backend

Para desarrollo:

```bash
pnpm --filter api-backend run dev
```

Para produccion (si ya compilaste):

```bash
pnpm --filter api-backend run build
pnpm --filter api-backend run start:prod
```

## Flujo en CI/CD (recomendado)

En cada release:

1. Levantar o conectar a la DB destino.
2. Ejecutar `pnpm --filter api-backend run migration:run` como paso independiente.
3. Si migraciones terminan OK, desplegar la nueva version de la API.
4. Si fallan, detener despliegue y no promover la version.

## Rollback rapido

Si la ultima migracion introdujo un problema:

```bash
pnpm --filter api-backend run migration:revert
```

Importante: esto solo revierte la ultima migracion aplicada.

## Notas importantes para este proyecto

- Existe una migracion que inserta usuario admin inicial con `ON CONFLICT DO NOTHING`, por lo que no duplica admin si ya existe.
- Hay migraciones con cambios de enum y una con `transaction = false`; evita cortar el proceso a mitad.
- Nunca uses `synchronize: true` en entornos compartidos o productivos.
- Haz backup de la DB antes de correr migraciones en produccion.

## Checklist de primer despliegue

- [ ] Variables de entorno de DB correctas
- [ ] Postgres en estado healthy
- [ ] `migration:run` ejecutado sin errores
- [ ] Tabla `migrations` con todas las entradas esperadas
- [ ] API iniciada despues de migrar
