# Propuesta TP DSW

## Grupo
### Integrantes
* Calvi Alfie, María Laura (Leg. 51465)

### Repositorios
* [frontend app]()
* [backend app]()


## Tema
### Descripción
* Una plataforma que facilita la búsqueda y reserva de estacionamientos. Permite a los usuarios encontrar espacios disponibles en garajes, aplicar filtros según sus necesidades y gestionar reservas de manera sencilla. Ideal para optimizar tiempo y reducir el estrés al estacionar.

### Modelo
![imagen del modelo](/img/modelo_de_dominio_tpdsw.png)


## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Tipo Vehículo<br>2. CRUD Usuario<br>3. CRUD Estacionamiento|
|CRUD dependiente|1. CRUD Vehículo {depende de} CRUD Tipo Vehículo y CRUD Usuario<br>2. CRUD Cochera {depende de} CRUD Estacionamiento y CRUD Usuario|
|Listado<br>+<br>detalle| 1. Listado de estacionamientos filtrado por ubicacion y precio, muestra nombre y disponibilidad => detalle CRUD Estacionamiento<br>|
|CUU/Epic|1. Reservar una cochera en un estacionamiento|


### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|Listados |1. Listado de estacionamientos administrable (crear, editar, eliminar y ver detalle con cocheras). <br>2.Listado de cocheras ocupadas por estacionamiento|
|CUU/Epic|1. Cancelación de reserva|
|Otros|1. Envío de recupetacion de contraseña por email|