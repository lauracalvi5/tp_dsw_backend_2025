# ParkEasy — Documentación 

> Plataforma para búsqueda y reserva de estacionamientos.  
> Backend desarrollado en **Node.js + Express**, con persistencia en **MongoDB** mediante **MikroORM** y comunicacion en tiempo real con **Socket.IO**.


**Objetivo:**  
Permitir que los usuarios encuentren cocheras disponibles, filtren por ubicación o precio y gestionen sus reservas.



**Entidades principales:**  
Usuario, TipoVehiculo, Vehiculo, Estacionamiento, Cochera.


## Arquitectura y tecnologías

- Node.js + Express 5  
- MongoDB (driver oficial) con MikroORM (MongoDriver)  
- Socket.IO para comunicación en tiempo real  
- Seguridad: Helmet, CORS, Rate limiting, sanitización básica, JWT  
- Tipado: TypeScript con decoradores

**Estructura del proyecto:**
```
src/
│
├── app.ts
├── socket.ts
├── shared/db/orm.ts
├── middlewares/
└── {usuario, tipo_vehiculo, vehiculo, estacionamiento, cochera}/
```


## Configuración y ejecución local

**Requisitos:**
- Node.js 18 o superior  
- MongoDB local en `mongodb://127.0.0.1:27017` (base `parkEasy`)  
- PNPM o NPM

**Variables de entorno recomendadas:**
- `JWT_SECRET`: clave secreta para JWT  
- `NODE_ENV`: `development` | `production`

**Instalación y ejecución:**

Con PNPM:

pnpm install
pnpm run start:dev


Con NPM:

npm install
npx tsc-watch --noClear -p ./tsconfig.json --onSuccess "node ./dist/app.js"


Servidor por defecto: `http://localhost:3000`  
Base de datos: `parkEasy`.

---

## Seguridad y middlewares

- **Helmet:** cabeceras seguras.  
- **CORS:** configurado con medidas anti-MIME sniffing, X-Frame-Options y protección XSS.  
- **Rate limiting:** global de 200 solicitudes/15 min; login limitado a 7 intentos/15 min.  
- **Logs y sanitización:** registro de actividad y eliminación de scripts embebidos.  
- **Autenticación:** mediante JWT (`Authorization: Bearer <token>`).  
- **Autorización:** validación de roles (`cliente` o `admin`).

---

## Modelos de datos

Las entidades se implementan con MikroORM sobre MongoDB.

### Usuario
- `_id`
- `nombre`
- `apellido`
- `email`
- `contrasena`
- `rol`
- `resetToken`
- `resetTokenExpira`

### Estacionamiento
- `_id`
- `nombre`
- `direccion`
- `capacidad`
- `precioHora`
- `lat`
- `lng`
- `activo`
- `cocheras`

### Cochera
- `_id`
- `numero`
- `estado`
- `fechaInicio`
- `fechaFin`
- `usuario`
- `estacionamiento`

---

## Socket.IO

Archivo principal: `src/socket.ts`.

- CORS permitido desde `http://localhost:5173`.  
- Eventos:
  - `connection`: log de conexión.
  - `message`: recepción y retransmisión de mensajes.
  - `disconnect`: log de desconexión.

**Uso en defensa:**  
Demostración de envío y recepción de mensajes en tiempo real entre dos clientes.

---

## API REST

**Base:** `http://localhost:3000`  
Autenticación mediante JWT donde corresponda.

**Módulos principales:**
1. **Usuarios:** registro, login, recuperación y reseteo de contraseña.  
2. **Tipos de Vehículo:** CRUD básico.  
3. **Vehículos:** CRUD dependiente (requiere JWT).  
4. **Estacionamientos:** creación, listado, filtrado, actualización y eliminación (JWT + admin).  
5. **Cocheras:** reserva, cancelación y administración (JWT / admin).

---

## Casos de uso demostrables

1. Registro y login de administrador.  
2. Alta de tipo de vehículo.  
3. Alta de estacionamiento con generación automática de cocheras.  
4. Alta de vehículo por usuario cliente.  
5. Búsqueda de estacionamientos disponibles.  
6. Reserva de cochera.  
7. Cancelación de reserva.  
8. Comunicación en tiempo real con Socket.IO.

---

## Consideraciones y decisiones

- El cálculo de cocheras libres se realiza por agregación en MongoDB.  
- Los filtros geográficos emplean fórmula de Haversine y bounding box.  
- La colección espejo `estacionamientos2` se usa para búsquedas y control.  
- Limitador de solicitudes en login para evitar ataques de fuerza bruta.  
- Sanitización básica de payloads para prevenir inyección de scripts.

---

## Limitaciones y posibles mejoras

- Falta de tests automatizados.  
- JWT sin refresh tokens (expira en 24 h).  
- Manejo simple de roles.  
- SMTP embebido en código (mover a variables de entorno).  
- No se emplean índices geoespaciales en MongoDB (posible mejora con `2dsphere`).

---

## Scripts y build

**package.json**
```json
"start:dev": "tsc-watch --noClear -p ./tsconfig.json --onSuccess \"node ./dist/app.js\""
```

**tsconfig.json**
```json
{
  "target": "es2020",
  "module": "ES2022",
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

---

## Rutas principales

- `/usuarios/registro`, `/usuarios/login`, `/usuarios/recuperar`, `/usuarios/resetear`  
- `/tipos-vehiculo`  
- `/vehiculos` (JWT)  
- `/estacionamientos`, `/estacionamientos/:id`, `/estacionamientos-disponibles`, `/estacionamientos2/buscar`  
- `/cocheras`, `/cocheras/libres`, `/cocheras/mis-reservas`, `/cocheras/reservar`, `/cocheras/:id/cancelar`, `/cocheras/:id/liberar`

---

## Anexos

- Diagrama de dominio: `img/modelo_de_dominio_tpdsw.png`  
- Código fuente: ver estructura del repositorio.

---