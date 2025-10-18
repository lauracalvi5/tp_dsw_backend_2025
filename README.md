# tp-dsw-backend-2025

Proyecto backend del Trabajo Práctico de Desarrollo de Software Web (DSW) — gestión de estacionamientos.

## Descripción
API REST en TypeScript/Node.js (Express) con persistencia en MongoDB usando MikroORM. El backend es agnóstico respecto al frontend y expone endpoints para gestionar usuarios, estacionamientos, cocheras y reservas.

---

## Requisitos
- Node.js >= 18
- pnpm (o npm/yarn)
- MongoDB (mongod) corriendo localmente o accesible vía URI
- (Opcional) Redis si se desea un rate-limiter distribuido

---

## Instalación
Desde la raíz del repositorio:

```powershell
pnpm install
```

Si usás npm:

```powershell
npm install
```

---

## Variables de entorno
Copiar y completar `.env.example` como `.env` (no commitear `.env`).

Variables mínimas necesarias:

- JWT_SECRET=tu_secreto_de_jwt
- DB_URL=mongodb://127.0.0.1:27017/?directConnection=true
- NODE_ENV=development

(.env.example se encuentra en el repo)

---

## Scripts disponibles
- `pnpm start:dev` - compila y ejecuta en modo desarrollo (tsc-watch + node)

Podés añadir otros scripts para build/test según convenga.

---

## Ejecutar localmente
1. Asegurate de tener MongoDB corriendo y apuntando al dbpath correcto. Ejemplo (PowerShell):

```powershell
mongod --dbpath C:\ruta\a\tu\mongodata
# en otra terminal
pnpm start:dev
```

2. Crear un usuario de prueba (registro) y obtener token via `/usuarios/login`.

---

## Endpoints principales (resumen)
- POST /usuarios/registro — registrar nuevo usuario
- POST /usuarios/login — iniciar sesión y obtener token JWT
- GET /cocheras/libres?estacionamientoId=... — listar cocheras libres para un estacionamiento
- POST /cocheras/:id/reservar — reservar cochera (protegido)
- POST /cocheras/:id/liberar — liberar cochera (protegido)
- GET /cocheras/mis-reservas — reservas del usuario autenticado
- GET /vehiculos — listar vehículos (populate tipo)
- CRUD para estacionamientos, tipo_vehiculo, vehiculos y usuarios (ver rutas en `src/*/*.routes.ts`)

> Nota: revisá `src/*/*.routes.ts` para la lista completa y parámetros.

---

## Notas de seguridad y tokens
- El JWT se firma con `JWT_SECRET`. Cambiar este valor invalidará todos los tokens existentes — los usuarios deberán volver a iniciar sesión.
- No guardes secretos en el repositorio. Usá `.env` y agregálo a `.gitignore`.
- Implementado: Helmet y rate-limiting básico. Recomendado: validar entradas con Zod/Joi y usar logging estructurado en producción.

---

## Preparar la demo para la defensa (pasos rápidos)
1. Ejecutar MongoDB con la carpeta de datos correcta.
2. `pnpm install` y `pnpm start:dev`.
3. Registrar un usuario de prueba via `POST /usuarios/registro`.
4. Login `POST /usuarios/login` y guardar el JWT.
5. Crear (si aplica) un estacionamiento y que tenga capacidad >0.
6. Reservar una cochera con `POST /cocheras/:id/reservar` (enviar Authorization: Bearer <token>).
7. Mostrar que `GET /cocheras/mis-reservas` lista la reserva.
8. Liberar la cochera con `POST /cocheras/:id/liberar`.

Incluí en la defensa:
- Diagrama de entidades (img/ o drawio)
- Flujo de reserva (secuencia)
- Decisiones técnicas: porqué Express, porqué MikroORM, seguridad aplicada (Helmet, rate-limit)
- Evidencia de trabajo en equipo: commits, issues, board (capturas o links)

---

Si querés, puedo generar ahora `.env.example`, agregar `.env` a `.gitignore` (si no existe), y crear un `docs/defensa.md` con los pasos detallados y capturas de ejemplo. ¿Lo hago?
