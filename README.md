
# 🏥 PAESYS - Sistema de Gestión de Enfermería v21.0

Plataforma integral de gestión clínica, planes de cuidados (PAE) y soporte a la decisión para enfermería.

![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20NestJS-black)

## 🔐 Protocolo de Admisión (Autenticación)

El sistema utiliza **Google Identity Platform (Firebase Auth)** para la gestión de usuarios, siguiendo una lógica clínica estricta:

1.  **La Pulsera (UID):** Cada usuario tiene un identificador único (UID) proporcionado por Google. Esta es su "pulsera de hospital".
2.  **El Archivo (Firestore):**
    *   Al hacer login, el sistema busca en la colección `users` si existe un documento con ese UID.
    *   **Paciente Conocido:** Si existe, recupera su perfil y preferencias.
    *   **Nuevo Ingreso:** Si no existe, crea automáticamente la ficha con los datos básicos (Nombre, Email, Avatar) y asigna el rol por defecto.

---

## 🏗️ Arquitectura de Repositorios

El proyecto se divide estrictamente en dos repositorios para desacoplar el desarrollo:

### 1. Repo 1: Backend (`backend-enfermeria-pae`)
*   **Framework:** NestJS.
*   **Lenguaje:** TypeScript.
*   **Base de Datos:** PostgreSQL + Prisma ORM.
*   **Responsabilidad:** API REST, Autenticación JWT, Lógica de Negocio.

### 2. Repo 2: Frontend (`frontend-enfermeria-pae`)
*   **Framework:** Next.js (App Router).
*   **Lenguaje:** TypeScript.
*   **Estilos:** TailwindCSS.
*   **Responsabilidad:** UI/UX, Estado de Sesión, Visualización de Datos.

---

## 🚀 Scripts de NPM

### Repo 1: Backend (`backend-enfermeria-pae`)
```bash
npm run dev     # Inicia servidor en modo desarrollo (watch)
npm run build   # Compila el proyecto (dist/)
npm run start   # Inicia servidor en producción
npm run test    # Ejecuta suites de tests
```

### Repo 2: Frontend (`frontend-enfermeria-pae`)
```bash
npm run dev     # Inicia servidor de desarrollo Next.js
npm run build   # Construye la aplicación para producción
npm start       # Inicia el servidor de producción
```

---

## ☁️ Guía de Despliegue a Producción (Firebase)

Para llevar la aplicación a un entorno real, sigue estos pasos:

### 1. Configuración en Firebase Console
1.  Crear nuevo proyecto en [console.firebase.google.com](https://console.firebase.google.com).
2.  **Authentication:** Activar proveedores "Email/Password" y "Google".
3.  **Firestore Database:** Crear base de datos en modo producción.

### 2. Conexión del Código (Variables de Entorno)
En tu panel de Vercel o Netlify, añade las siguientes variables copiadas de la configuración de Firebase:

| Variable | Descripción |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | La API Key pública de tu proyecto Firebase. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación (ej: `paesys.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto (ej: `paesys-app`). |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento (ej: `paesys-app.appspot.com`). |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID numérico del remitente. |
| `VITE_FIREBASE_APP_ID` | ID de la aplicación web. |

### 3. Switch Mock -> Real
Sustituir el archivo de servicio simulado por la implementación real:
*   El código actual usa `services/firebaseMock.ts` para desarrollo local.
*   Para producción, descomentar las líneas de importación de `firebase/auth` y `firebase/firestore` indicadas en el servicio y usar el objeto `config.firebase` definido en `config.ts`.

---

## 📂 Estructura Detallada

Para ver el árbol de archivos completo y la organización de carpetas, consulta [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

© 2024 PAESYS Health Technologies.
