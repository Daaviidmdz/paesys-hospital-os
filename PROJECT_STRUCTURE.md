
# 📂 Estructura del Proyecto PAESYS

Este documento define la organización oficial de archivos y carpetas para los dos repositorios independientes del proyecto.

## 1️⃣ Repo 1: Backend (`backend-enfermeria-pae`)

**Tecnología:** NestJS + Prisma + PostgreSQL.

```text
backend-enfermeria-pae/
├── src/
│   ├── main.ts                 # Entrada de la aplicación (Bootstrap)
│   ├── app.module.ts           # Módulo raíz
│   │
│   ├── modules/                # Módulos de funcionalidad (Vertical Slicing)
│   │   ├── auth/               # Autenticación (Login, Register, JWT)
│   │   ├── users/              # Gestión de usuarios
│   │   ├── pathologies/        # Gestión de patologías
│   │   ├── drugs/              # Gestión de fármacos
│   │   ├── pae/                # Planes de Cuidados (NANDA/NIC/NOC)
│   │   └── notes/              # Notas personales
│   │
│   ├── common/                 # Código compartido transversal
│   │   ├── filters/            # Filtros de excepciones HTTP
│   │   ├── guards/             # Guards (Roles, Auth)
│   │   └── util/               # Utilidades y helpers
│   │
│   └── prisma/
│       └── prisma.service.ts   # Servicio de conexión DB
│
├── prisma/
│   └── schema.prisma           # Definición de modelos de base de datos
├── package.json
├── .env                        # Variables de entorno (DATABASE_URL, JWT_SECRET)
├── .gitignore
└── test/                       # Tests e2e
```

---

## 2️⃣ Repo 2: Frontend (`frontend-enfermeria-pae`)

**Tecnología:** Next.js (App Router) + TailwindCSS.

```text
frontend-enfermeria-pae/
├── app/                        # Router principal (Next.js App Router)
│   ├── layout.tsx              # Layout raíz (RootLayout)
│   ├── page.tsx                # Home / Redirect
│   │
│   ├── auth/                   # Rutas públicas de autenticación
│   │   ├── login/              # Pantalla de Login
│   │   └── register/           # Pantalla de Registro
│   │
│   ├── dashboard/              # Panel principal (Privado)
│   ├── pae/                    # Sección Planes de Cuidados
│   ├── fármacos/               # Sección Vademécum
│   ├── patologías/             # Sección Biblioteca
│   └── notas/                  # Sección Bloc de notas
│
├── components/                 # Componentes React reutilizables
│   ├── layouts/                # Sidebar, Navbar
│   ├── tablas/                 # Tablas de datos
│   └── tarjetas/               # Cards de información
│
├── lib/                        # Lógica de cliente
│   ├── api.ts                  # Cliente API (Axios/Fetch)
│   ├── hooks/                  # Hooks personalizados (useAuth, usePatient)
│   └── utils.ts                # Funciones de ayuda (formatDate, etc.)
│
├── package.json
├── .env.local                  # Variables de entorno públicas (NEXT_PUBLIC_API_URL)
└── .gitignore
```
