# Guia de Instalacion y Configuracion
## Patio Sarduy — Sistema de Catalogo de Plantas

---

## Requisitos previos

| Herramienta | Version minima | Notas |
|---|---|---|
| Node.js | 22.x | Verificar con `node --version` |
| pnpm | 9.0.0 | `npm install -g pnpm@9` |
| Docker Desktop | Cualquier reciente | Debe estar corriendo antes de levantar los servicios |
| Git | Cualquiera | — |

---

## 1. Instalar dependencias

```bash
# Desde la raiz del proyecto
pnpm install
```

---

## 2. Variables de entorno del backend

Crear el archivo `apps/api-backend/.env` con el siguiente contenido:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5434
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=patio_sarduy

JWT_ACCESS_SECRET=change_this_access_secret_in_production
JWT_REFRESH_SECRET=change_this_refresh_secret_in_production
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=patio-sarduy
MINIO_PUBLIC_BASE_URL=http://localhost:9000/patio-sarduy

UPLOAD_PRESIGNED_URL_EXPIRES_SECONDS=300
UPLOAD_MAX_FILE_SIZE_BYTES=5242880
```

> **Importante:** El archivo `.env` no esta en el repositorio (esta en `.gitignore`).
> Hay que crearlo manualmente cada vez que se clona el proyecto.

---

## 3. Levantar la infraestructura con Docker

```bash
# Desde la raiz del proyecto
docker compose up -d
```

Esto levanta dos contenedores:

| Contenedor | Imagen | Puerto externo | Para que sirve |
|---|---|---|---|
| `patio-postgres` | `postgres:18-alpine` | `5434` | Base de datos PostgreSQL |
| `patio-minio` | `minio:...` | `9000` (API) / `9001` (Consola) | Almacenamiento de imagenes |

Verificar que esten saludables:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
Ambos deben mostrar `(healthy)`.

### Por que el puerto 5434 y no 5432?

La maquina de desarrollo tiene una instalacion local de PostgreSQL que ocupa los puertos **5432 y 5433**. Docker esta mapeado al puerto **5434** para evitar el conflicto.

---

## 4. Crear el bucket de MinIO

1. Abrir `http://localhost:9001` en el navegador
2. Iniciar sesion con `minioadmin` / `minioadmin`
3. Ir a **Buckets** → **Create Bucket**
4. Nombre: `patio-sarduy`
5. En la configuracion del bucket, ir a **Access Policy** y ponerlo en **Public**

> Este paso hay que repetirlo si se borran los volumenes de Docker (`docker compose down -v`).

---

## 5. Correr las migraciones de base de datos

```bash
cd apps/api-backend
pnpm migration:run
```

Esto crea todas las tablas y el usuario administrador inicial:
- **Usuario:** `admin`
- **Contrasena:** `admin`

> Solo es necesario correrlo la primera vez, o despues de un `docker compose down -v`.

---

## 6. Levantar los servicios (en terminales separadas)

### Terminal 1 — Backend (API NestJS)
```bash
cd apps/api-backend
npx nest start --watch
```
Corre en `http://localhost:3000/api`

### Terminal 2 — Panel de administracion
```bash
cd apps/e-commerce
pnpm dev
```
Corre en `http://localhost:5173`

### Terminal 3 — Tienda publica (catalogo de clientes)
```bash
cd apps/customer-store
pnpm dev
```
Corre en `http://localhost:5174` (o el siguiente puerto disponible)

> **Nota sobre `pnpm dev` desde la raiz:** El comando usa Turborepo con modo TUI (`ui: "tui"`)
> que **no funciona en Windows** y termina con error. Siempre levantar cada servicio
> en su propia terminal como se indica arriba.

---

## 7. Accesos

| Servicio | URL | Usuario | Contrasena |
|---|---|---|---|
| Panel admin | `http://localhost:5173/login` | `admin` | `admin` |
| Tienda publica | `http://localhost:5174` | — | — |
| API backend | `http://localhost:3000/api` | — | — |
| MinIO consola | `http://localhost:9001` | `minioadmin` | `minioadmin` |

---

## 8. Secuencia completa (arranque desde cero)

```bash
# 1. Instalar deps (solo la primera vez o tras cambios en package.json)
pnpm install

# 2. Levantar Docker
docker compose up -d

# 3. Correr migraciones (solo la primera vez o tras borrar volumenes)
cd apps/api-backend
pnpm migration:run
cd ../..

# 4. Abrir 3 terminales separadas y en cada una:
#    Terminal 1:  cd apps/api-backend  &&  npx nest start --watch
#    Terminal 2:  cd apps/e-commerce   &&  pnpm dev
#    Terminal 3:  cd apps/customer-store  &&  pnpm dev
```

---

## 9. Problemas conocidos y soluciones

### El backend no conecta a la base de datos
Verificar que el contenedor Docker esta corriendo:
```bash
docker ps
```
Si `patio-postgres` no aparece o no esta `healthy`, reiniciar:
```bash
docker compose down
docker compose up -d
```

### Puerto 3000 ya en uso al arrancar el backend
Hay un proceso Node anterior corriendo. Matar todos:
```bash
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Error 404 en el navegador al entrar al admin
Se esta accediendo a la `customer-store` en vez del panel admin.
El panel admin es la app `e-commerce`. Verificar que se corre `pnpm dev` dentro de `apps/e-commerce`
y acceder al puerto correcto que indique la terminal.

### Las migraciones fallan con `ForbiddenTransactionModeOverrideError`
El `data-source.ts` debe tener `migrationsTransactionMode: 'each'`.
Ya esta corregido en el codigo. Si ocurre de nuevo, verificar que esa linea existe en
`apps/api-backend/src/database/data-source.ts`.

---

## 10. Estructura del proyecto

```
patio-sarduy-ecommerce/
├── apps/
│   ├── api-backend/        NestJS + TypeORM + PostgreSQL
│   │   ├── src/
│   │   │   ├── auth/       JWT (access 15m + refresh 7d)
│   │   │   ├── products/   Entidad Planta / catalogo
│   │   │   ├── orders/     Pedidos y estado
│   │   │   ├── users/      Roles: ADMIN, ASSISTANT, STUDENT, CLIENT
│   │   │   └── uploads/    MinIO (imagenes de plantas)
│   │   └── .env            (crear manualmente, ver seccion 2)
│   │
│   ├── e-commerce/         React 19 + Vite — Panel de administracion
│   │   └── src/modules/
│   │       ├── admin/      Layout del admin
│   │       ├── auth/       Login con JWT
│   │       ├── inventory/  Gestion de plantas
│   │       ├── orders/     Gestion de pedidos
│   │       └── users-permissions/
│   │
│   └── customer-store/     React 19 + Vite — Tienda publica
│       └── src/modules/
│           ├── catalog/    Catalogo de plantas
│           ├── checkout/   Proceso de compra
│           └── orders/     Mis pedidos
│
├── docker-compose.yml      PostgreSQL (5434) + MinIO (9000/9001)
└── docs/
    └── INSTALACION.md      Este archivo
```

---

---

# Tareas Pendientes (Tesis)

## Pendiente inmediato

- [ ] **Crear bucket MinIO** `patio-sarduy` en `http://localhost:9001`
  con politica de acceso **Public** (necesario para que las fotos funcionen)

---

## Adaptaciones para el catalogo de plantas de la tesis

### Backend

- [ ] **Agregar campos faltantes a la entidad `Product`**
  Los datos del CSV de 284 plantas incluyen campos que no estan en la entidad actual:
  - `noPlanta` — numero de planta (identificador del inventario fisico)
  - `addedAt` / `fechaAlta` — fecha en que se registro la planta
  - `diedAt` / `fechaMuerte` — fecha en que murio la planta (nullable)

  Pasos:
  1. Editar `apps/api-backend/src/products/entities/product.entity.ts`
  2. Generar una nueva migracion: `pnpm migration:generate -- -n AddPlantDatesAndNumber`
  3. Correr la migracion: `pnpm migration:run`

- [ ] **Script de importacion del CSV**
  Crear un script que lea el CSV con los 284 registros de plantas y los inserte
  en la base de datos usando la API o directamente via TypeORM.

- [ ] **Ajustar el DTO de creacion/edicion de plantas**
  Para que acepte los nuevos campos (`noPlanta`, `addedAt`, `diedAt`).

### Frontend — Panel admin (`e-commerce`)

- [ ] **Formulario de planta:** agregar campos `noPlanta`, `fechaAlta`, `fechaMuerte`
- [ ] **Vista de inventario:** mostrar columnas relevantes para el contexto academico
  (nombre cientifico, familia, forma de crecimiento, categoria de amenaza IUCN)
- [ ] **Ajustar textos:** cambiar "Patio Sarduy" por el nombre definitivo del sistema
  si corresponde a la tesis

### Frontend — Tienda publica (`customer-store`)

- [ ] **Ficha de planta:** pagina de detalle con todos los campos botanicos
  (nombre comun, cientifico, genero, familia, origen, usos, endemismo, etc.)
- [ ] **Filtros en el catalogo:** por familia, forma de crecimiento, uso principal,
  categoria de amenaza
- [ ] **Ajustar textos y nombre del sistema** para el contexto de la tesis

---

## Mejoras tecnicas recomendadas

- [ ] **Cambiar `"ui": "tui"` a `"ui": "stream"` en `turbo.json`**
  para poder usar `pnpm dev` desde la raiz en Windows sin que falle

- [ ] **Instalar `dotenv` como dependencia directa del backend**
  ```bash
  # Cuando haya conexion estable a npm:
  pnpm add dotenv --filter api-backend
  ```
  Luego agregar `import 'dotenv/config'` como primera linea de `main.ts`.
  Esto permite que el `.env` se cargue automaticamente sin depender de los
  valores hardcodeados en el codigo.

- [ ] **Configurar variables de entorno para los frontends**
  Crear `apps/e-commerce/.env.local` y `apps/customer-store/.env.local`
  con `VITE_API_BASE_URL=http://localhost:3000/api` para no depender del fallback
  hardcodeado en `api-client.ts`.
