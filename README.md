# Discens

**Discens** es una plataforma modular para la gestión integral de instituciones educativas.  
Comienza como una solución para el manejo de personas (alumnos, docentes, familiares, directivos) y está pensada para escalar hacia funcionalidades administrativas y comunicacionales.

---

## 🚀 Tecnologías principales

- **Next.js 15.3** (App Router, Server Actions, Middleware)
- **Supabase** (Base de datos, Auth, RLS)
- **ShadCN UI** (Componentes accesibles sobre Tailwind CSS)
- **TypeScript** para tipado estático y escalabilidad

---

## 🧩 Funcionalidades iniciales

- ABM de personas con multi-tenant (`school_id`)
- Autenticación con Supabase
- Middleware para control de sesión
- Estructura lista para escalar a:

  - Facturación y caja diaria
  - Comunicación interna (chat, notificaciones)
  - Reportes por escuela

---

## 🗂️ Estructura del proyecto

discens/
├── src/
│ ├── app/ # Páginas y rutas Next.js App Router
│ ├── actions/ # Server Actions
│ ├── lib/
│ │ └── supabase/ # Clientes Supabase (client, server, middleware)
│ └── components/ # Componentes UI
├── public/ # Archivos estáticos
├── middleware.ts # Middleware de autenticación Supabase
├── .env.local # Claves Supabase (NO se sube al repo)
└── docs/ # Documentación interna del proyecto


## 📄 Licencia
Este proyecto se encuentra bajo una licencia privada durante la etapa de desarrollo.

## ✍️ Autor
Pablo Macia · @pablormacia