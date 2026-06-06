# SikRoad - Marketplace

Proyecto de la materia IC-5821 Requerimientos de Software.

## Requisitos previos

Necesita tener instalado:

- **Python 3.10 o superior**
- **Node.js 18 o superior** (incluye npm)
- **pnpm** (instalar con `npm install -g pnpm`)
- **Git**

## Clonar el proyecto

```bash
git clone <URL_DEL_REPO>
cd silkroad

cd back

# Crear entorno virtual
python -m venv venv

# opcion alternativa para Jota
py -3.14 -m venv venv

# Activar entorno virtual
# Linux / Mac:
source venv/bin/activate
# Windows (PowerShell):
.\venv\bin\activate

# Instalar dependencias
pip install flask flask-sqlalchemy flask-cors pyjwt bcrypt

# Ejecutar el servidor
python -m app.app

cd frontend

# Instalar dependencias
pnpm install

# Ejecutar el servidor de desarrollo
pnpm dev

El frontend corre en:
http://localhost:5173

hasta el momento la estructura es:
silkroad/
├── back/
│   └── app/
│       ├── app.py              # Punto de entrada de Flask
│       ├── config.py           # Configuración (DB, JWT, secret key)
│       ├── db/
│       │   └── conexion.py     # Conexión a SQLite con SQLAlchemy
│       ├── models/
│       │   ├── usuario.py      # Modelo Usuario
│       │   ├── tienda.py       # Modelo Tienda
│       │   └── producto.py     # Modelo Producto
│       ├── routes/
│       │   ├── autenticacion.py # Login, registro, logout
│       │   ├── tiendas.py      # CRUD de tiendas
│       │   └── productos.py    # CRUD de productos
│       └── servicios/
│           ├── hash.py         # Bcrypt para contraseñas
│           ├── token.py        # JWT para autenticación
│           └── decoradores.py  # Decorador @token_requerido
├── frontend/
│   └── src/
│       ├── components/
│       │   └── ToggleTema.jsx  # Switch modo oscuro/claro
│       ├── context/
│       │   ├── AuthContext.jsx  # Estado de autenticación
│       │   └── ThemeContext.jsx # Estado del tema
│       ├── pages/
│       │   ├── IniciarSesion.jsx # Página de login
│       │   ├── Registro.jsx     # Página de registro
│       │   ├── Inicio.jsx       # Catálogo de tiendas (home)
│       │   ├── Tienda.jsx       # Página de tienda individual
│       │   └── Producto.jsx     # Página de producto individual
│       ├── services/
│       │   └── api.js          # Conexión con backend (axios)
│       ├── App.jsx             # Rutas principales
│       └── main.jsx            # Entry point
└── README.md
Tecnologías
Backend: Python, Flask, SQLite, JWT, bcrypt
Frontend: React, Vite, Tailwind CSS, Axios, React Router

error actual
Access to XMLHttpRequest at 'http://127.0.0.1:5000/api/login'
from origin 'http://localhost:5173' has been blocked by CORS policy

al intentar iniciar sesión

