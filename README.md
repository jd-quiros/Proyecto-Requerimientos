# Silk Road — Marketplace

Proyecto del curso IC-5821 Requerimientos de Software.  
Instituto Tecnológico de Costa Rica — Centro Académico de Alajuela, I Semestre 2026.

**Equipo:** José Pablo Barrantes · José David Quirós · Carlos Andrés Zúñiga · Juan Carlos Monsalve

---

## Tecnologías

| Capa | Stack |
|------|-------|
| Backend | Python 3, Flask, SQLAlchemy, SQLite, JWT, bcrypt |
| Frontend | React 19, Vite, Tailwind CSS, Axios, React Router v7 |

---

## Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior
- pnpm — `npm install -g pnpm`
- Git

---

## Instalación y puesta en marcha

### Backend

```bash
cd back

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate        # Linux/Mac
# .\venv\Scripts\activate       # Windows PowerShell

# Instalar dependencias
pip install flask flask-sqlalchemy flask-cors pyjwt bcrypt werkzeug

# Poblar la base de datos con datos de prueba
python seed.py

# Iniciar el servidor (puerto 5000)
python -m app.app
```

### Frontend

```bash
cd frontend

# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo (puerto 5173)
pnpm dev
```

Acceder en: **http://localhost:5173**

---

## Cuentas de prueba

Todas usan la contraseña **`123456`**

| Rol | Email |
|-----|-------|
| Administrador | admin@admin.com |
| Vendedor (TechZone CR) | carlos@carlos.com |
| Vendedor (ModaUr) | maria@maria.com |
| Cliente | jose@jose.com |

---

## Estructura del proyecto

```
Proyecto-Requerimientos/
├── back/
│   ├── app/
│   │   ├── app.py                  # Punto de entrada Flask, registro de blueprints
│   │   ├── config.py               # Configuración (DB, JWT, secret key)
│   │   ├── db/
│   │   │   └── conexion.py         # Instancia de SQLAlchemy
│   │   ├── models/
│   │   │   ├── usuario.py          # Modelo Usuario (id, nombre, email, password_hash, rol)
│   │   │   ├── tienda.py           # Modelo Tienda (nombre, descripción, categoría, estado)
│   │   │   ├── producto.py         # Modelo Producto (nombre, precio, stock, imagen)
│   │   │   ├── carrito.py          # Modelo Carrito
│   │   │   ├── producto_carrito.py # Relación Carrito ↔ Producto (cantidad)
│   │   │   └── pedido.py           # Modelos Pedido + PedidoProducto (historial)
│   │   ├── routes/
│   │   │   ├── autenticacion.py    # POST /login, /registro — GET/PUT /perfil
│   │   │   ├── tiendas.py          # CRUD tiendas + mis-tiendas + mis-pedidos + stats
│   │   │   ├── productos.py        # CRUD productos
│   │   │   ├── carrito.py          # Carrito, confirmar pedido, historial
│   │   │   └── admin.py            # Panel admin: stats, usuarios, tiendas, productos
│   │   └── servicios/
│   │       ├── hash.py             # bcrypt para contraseñas
│   │       ├── token.py            # Generación/validación JWT
│   │       └── decoradores.py      # @token_requerido
│   └── seed.py                     # Script para poblar la DB con datos de prueba
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              # Barra de navegación compartida (todas las páginas)
│       │   ├── ToggleTema.jsx          # Switch modo oscuro/claro
│       │   ├── CrearProductoModal.jsx  # Modal crear/editar producto
│       │   ├── CrearTiendaModal.jsx    # Modal crear tienda
│       │   └── EditarTiendaModal.jsx   # Modal editar tienda
│       ├── context/
│       │   ├── AuthContext.jsx         # Sesión activa, rol, actualizarUsuario()
│       │   ├── ThemeContext.jsx        # Tema claro/oscuro
│       │   └── LanguageContext.jsx     # Idioma ES/EN, función t()
│       ├── i18n/
│       │   ├── es.json                 # Traducciones en español
│       │   └── en.json                 # Traducciones en inglés
│       ├── pages/
│       │   ├── IniciarSesion.jsx       # Login
│       │   ├── Registro.jsx            # Registro de cuenta
│       │   ├── Inicio.jsx              # Home: tiendas, búsqueda, notificación vendedor
│       │   ├── Explorar.jsx            # Catálogo completo con filtros
│       │   ├── Tienda.jsx              # Página de tienda (productos/dashboard/pedidos)
│       │   ├── Producto.jsx            # Detalle de producto
│       │   ├── Carrito.jsx             # Carrito de compras
│       │   ├── HistorialPedidos.jsx    # Historial de pedidos del cliente
│       │   ├── PedidosTienda.jsx       # Pedidos recibidos (vendedor)
│       │   ├── Perfil.jsx              # Edición de perfil de usuario
│       │   └── Admin.jsx               # Panel de administración
│       ├── services/
│       │   └── api.js                  # Cliente axios con interceptor JWT
│       ├── App.jsx                     # Definición de rutas
│       └── main.jsx                    # Entry point
│
├── requisitos.tex                  # Documento ERS del proyecto
└── README.md
```

---

## Rutas principales

| Ruta | Página | Acceso |
|------|--------|--------|
| `/` | Inicio — listado de tiendas | Todos |
| `/explorar` | Catálogo completo de productos | Todos |
| `/tienda/:id` | Página de tienda | Todos (dueño ve tabs extra) |
| `/producto/:id` | Detalle de producto | Todos |
| `/carrito` | Carrito de compras | Cliente |
| `/historial` | Historial de pedidos | Cliente |
| `/mis-pedidos` | Pedidos recibidos | Vendedor |
| `/perfil` | Editar perfil | Autenticado |
| `/admin` | Panel de administración | Admin |
| `/login` | Iniciar sesión | Público |
| `/registro` | Crear cuenta | Público |

---

## API — Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/login` | Autenticación, devuelve JWT |
| POST | `/api/registro` | Crear cuenta |
| GET/PUT | `/api/perfil` | Ver/editar perfil propio |
| GET | `/api/tiendas` | Listar tiendas activas |
| POST | `/api/tiendas` | Crear tienda (vendedor) |
| PUT | `/api/tiendas/:id` | Editar tienda (dueño) |
| GET | `/api/mis-tiendas` | Tiendas propias del vendedor |
| GET | `/api/mis-pedidos` | Pedidos recibidos en la tienda |
| GET | `/api/mi-tienda/stats` | Dashboard de la tienda |
| GET | `/api/productos` | Listar productos (filtros: busqueda, categoria) |
| POST/PUT/DELETE | `/api/productos` | CRUD de productos (vendedor) |
| GET | `/api/carrito` | Ver carrito |
| POST | `/api/agregar` | Agregar producto al carrito |
| PUT | `/api/actualizar/:id` | Cambiar cantidad en carrito |
| DELETE | `/api/eliminar/:id` | Quitar producto del carrito |
| POST | `/api/confirmar` | Confirmar pedido |
| GET | `/api/historial` | Historial de pedidos del cliente |
| GET | `/api/admin/stats` | Estadísticas globales (admin) |
| GET/PUT/DELETE | `/api/admin/usuarios` | Gestión de usuarios (admin) |
| GET/PUT | `/api/admin/tiendas` | Gestión de tiendas (admin) |
| GET/DELETE | `/api/admin/productos` | Gestión de productos (admin) |

---

## Roles y permisos

| Funcionalidad | Cliente | Vendedor | Admin |
|--------------|:-------:|:--------:|:-----:|
| Explorar tiendas y productos | ✓ | ✓ | ✓ |
| Agregar al carrito y comprar | ✓ | — | — |
| Historial de compras | ✓ | — | — |
| Crear y editar tienda | — | ✓ | — |
| Gestionar productos | — | ✓ | — |
| Ver pedidos recibidos | — | ✓ | — |
| Dashboard de tienda | — | ✓ | — |
| Panel de administración | — | — | ✓ |
| Aprobar/suspender tiendas | — | — | ✓ |
| Cambiar rol de usuarios | — | — | ✓ |
