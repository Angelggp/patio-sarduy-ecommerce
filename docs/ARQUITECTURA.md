# Arquitectura del Sistema

---

## Vision general

El sistema tiene **3 aplicaciones** que se comunican entre si:

```
Navegador (Admin)          Navegador (Cliente)
      |                           |
 e-commerce                customer-store
 (React + Vite)            (React + Vite)
      |                           |
      +----------+----------------+
                 |
            api-backend
           (NestJS REST)
                 |
        +--------+--------+
        |                 |
   PostgreSQL           MinIO
  (base de datos)   (fotos de plantas)
```

---

## Las 3 aplicaciones

### 1. `api-backend` — El servidor

Es el cerebro del sistema. Recibe peticiones HTTP y responde con datos JSON.

- Tecnologia: **NestJS** (framework de Node.js)
- Puerto: `3000`
- Todas las rutas empiezan con `/api`

Ejemplos de lo que hace:
- `POST /api/auth/login` → valida usuario y devuelve tokens JWT
- `GET /api/products` → devuelve la lista de plantas
- `POST /api/orders` → crea un pedido nuevo

**Como esta organizado por dentro:**

```
Una peticion HTTP entra y pasa por 3 capas:

Controller  →  recibe la peticion, valida los datos
Service     →  ejecuta la logica (ej: calcular precio, verificar stock)
Repository  →  consulta o guarda en la base de datos
```

Cada area del sistema es un **modulo** independiente:
- `auth` — login, registro, tokens JWT
- `products` — las plantas (CRUD)
- `orders` — pedidos
- `users` — usuarios y roles
- `uploads` — subida de imagenes a MinIO

---

### 2. `e-commerce` — Panel de administracion

Lo que ve el administrador para gestionar el catalogo.

- Tecnologia: **React + Vite**
- Puerto: `5173`
- URL de entrada: `http://localhost:5173/login`

Paginas disponibles:
| Ruta | Que hace |
|---|---|
| `/login` | Inicio de sesion |
| `/admin/inventario` | Ver, agregar y editar plantas |
| `/admin/pedidos` | Gestionar pedidos activos |
| `/admin/historial` | Historial de pedidos |
| `/admin/usuarios-permisos` | Gestionar usuarios del sistema |

---

### 3. `customer-store` — Tienda publica

Lo que ven los clientes para ver el catalogo y hacer pedidos.

- Tecnologia: **React + Vite**
- Puerto: `5174`
- Acceso libre, sin necesidad de login

Paginas disponibles:
| Ruta | Que hace |
|---|---|
| `/` | Catalogo de plantas |
| `/checkout` | Realizar un pedido |
| `/pedidos` | Ver mis pedidos |
| `/acceso` | Registro / inicio de sesion del cliente |

---

## Como fluye una peticion (ejemplo: ver plantas)

```
1. El admin abre /admin/inventario en el navegador

2. React carga la pagina y pide los datos:
   GET http://localhost:3000/api/products

3. El backend recibe la peticion:
   - Controller: verifica que el token JWT sea valido
   - Service: prepara los filtros de busqueda
   - Repository: consulta SELECT en PostgreSQL

4. PostgreSQL devuelve los registros

5. El backend responde con JSON:
   { data: [...plantas], total: 50, page: 1 }

6. React muestra las plantas en pantalla
```

---

## Seguridad: como funciona el login

```
1. Admin escribe usuario/contrasena

2. El frontend envia:
   POST /api/auth/login  { username, password }

3. El backend verifica la contrasena (bcrypt)
   y devuelve dos tokens:
   - accessToken  (dura 15 minutos)
   - refreshToken (dura 7 dias)

4. El frontend guarda los tokens en localStorage

5. Cada peticion siguiente incluye el accessToken:
   Authorization: Bearer <token>

6. Cuando el accessToken expira, el frontend
   pide uno nuevo automaticamente usando el refreshToken
```

---

## Base de datos: tablas principales

```
product      → plantas del catalogo
app_user     → usuarios del sistema (admin, asistentes, estudiantes)
order        → pedidos realizados
order_item   → cada planta dentro de un pedido
delivery_details → datos de entrega del pedido
migrations   → registro de cambios aplicados a la BD (TypeORM)
```

---

## Roles de usuario

| Rol | Que puede hacer |
|---|---|
| `ADMIN` | Todo: plantas, pedidos, usuarios |
| `ASSISTANT` | Plantas y pedidos (no usuarios) |
| `STUDENT` | Solo ver inventario |
| `CLIENT` | Solo usar la tienda publica |
