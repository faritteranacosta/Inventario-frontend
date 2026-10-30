# Requisitos funcionales del frontend

## 1. Objetivo

El frontend debe permitir operar completamente el sistema de inventario SaaS
consumiendo la API REST. Este documento describe las páginas, módulos,
funcionalidades, datos, estados y reglas que deben existir. No prescribe un
lenguaje, framework, librería ni estrategia visual.

La definición de la API está disponible en:

- `http://localhost:5082/openapi/v1.json` durante el perfil HTTP de desarrollo.
- `https://localhost:7194/openapi/v1.json` durante el perfil HTTPS de desarrollo.

La URL base debe ser configurable por ambiente. El frontend no debe asumir que
la base de datos es persistente ni que los identificadores son consecutivos:
los identificadores son GUID y las fechas se manejan como fechas UTC.

## 2. Alcance funcional de la API

El frontend debe cubrir estos dominios:

1. Autenticación y sesión.
2. Administración global de la plataforma.
3. Tenants, membresías y selección del negocio.
4. Usuarios y roles.
5. Dashboard de ventas e ingresos.
6. Categorías.
7. Productos e imágenes.
8. Ventas.

La API devuelve objetos de error con la forma:

```json
{
  "message": "Descripción del error"
}
```

El frontend debe mostrar ese mensaje cuando sea apropiado, sin reemplazarlo
silenciosamente por un mensaje de éxito.

Este documento distingue entre capacidades implementables con el OpenAPI
vigente y capacidades que requieren una ampliación coordinada del backend.
Una funcionalidad marcada como futura no debe simular respuestas exitosas ni
inventar parámetros o endpoints.

## 3. Modelo de acceso multi-negocio

El sistema debe distinguir entre la administración de la plataforma y la
operación de cada negocio. `Admin` y `User` son roles de un negocio, no
administradores globales:

| Rol | Alcance | Responsabilidades |
|---|---|---|
| `PlatformAdmin` | Toda la plataforma | Crear, activar, suspender y consultar negocios; administrar membresías; asignar o revocar administradores de negocio; consultar el estado operativo global. |
| `Admin` | Un negocio al que pertenece | Administrar el catálogo, categorías, ventas y usuarios de ese negocio según los permisos definidos por el producto. |
| `User` | Un negocio al que pertenece | Consultar el catálogo y ejecutar las operaciones diarias permitidas, como registrar ventas. |

Un mismo usuario puede pertenecer a varios negocios. Por eso el usuario
autenticado no debe modelarse únicamente con un `tenantId` fijo: la sesión
debe conservar el usuario, sus membresías y el negocio activo. Cada membresía
debe incluir como mínimo `tenantId`, nombre del negocio, rol dentro de ese
negocio y estado (`Active`, `Suspended` o `Revoked`).

El `PlatformAdmin` no pertenece automáticamente a todos los negocios como
`Admin` y no debe recibir acceso operativo implícito a sus inventarios. Para
entrar al contexto de un negocio debe seleccionarlo explícitamente y la API
debe validar que ese contexto está autorizado. El frontend debe mostrar una
indicación clara cuando el administrador esté actuando como administrador de
plataforma o dentro de un negocio seleccionado.

### 3.1 Flujos administrativos requeridos

El frontend debe contemplar estos flujos para `PlatformAdmin`:

1. Ver el listado global de negocios con estado, fecha de creación y cantidad
   de usuarios.
2. Crear un negocio y asignar su primer `Admin`.
3. Abrir el detalle de un negocio y consultar sus administradores, usuarios y
   estado.
4. Invitar o crear usuarios para un negocio y asignarles `Admin` o `User`.
5. Cambiar el rol de una membresía, revocar el acceso o reactivarlo.
6. Suspender o reactivar un negocio, solicitando confirmación y explicando el
   impacto sobre sus usuarios.
7. Seleccionar un negocio para operar sus pantallas, siempre que la política
   de auditoría lo permita.

Estas acciones deben registrar quién las ejecutó, sobre qué negocio y cuándo.
El frontend debe mostrar ese contexto en las confirmaciones y evitar acciones
globales ambiguas.

### 3.2 Contrato de API necesario

El frontend debe consumir el contrato multi-negocio expuesto por la API. Los
payloads definitivos, nombres de propiedades y estados deben validarse contra
el OpenAPI vigente antes de implementar cada formulario:

- `GET /api/platform/tenants`: listado global para `PlatformAdmin`.
- `POST /api/platform/tenants`: crear negocio y, opcionalmente, su primer
  administrador.
- `GET /api/platform/tenants/{tenantId}`: detalle, estado y resumen de acceso.
- `PATCH /api/platform/tenants/{tenantId}/status`: suspender o reactivar.
- `GET /api/platform/tenants/{tenantId}/members`: listar membresías.
- `POST /api/platform/tenants/{tenantId}/members`: invitar o crear una
  membresía.
- `PATCH /api/platform/tenants/{tenantId}/members/{userId}`: cambiar rol o
  estado.
- `DELETE /api/platform/tenants/{tenantId}/members/{userId}`: revocar acceso.
- `GET /api/auth/me`: devolver el usuario y todas sus membresías.
- `POST /api/auth/context`: seleccionar un negocio autorizado.

Los nombres y payloads definitivos deben salir del OpenAPI vigente. Mientras
estos endpoints no existan, el frontend no debe simularlos ni presentar
acciones exitosas: debe marcar la capacidad como no disponible o restringirla
al flujo actual.

## 4. Reglas generales de sesión y seguridad

### 4.1 Inicio de sesión

Debe existir una pantalla de inicio de sesión con:

- Campo de correo electrónico.
- Campo de contraseña.
- Validación de campos obligatorios y formato de correo.
- Estado de envío y prevención de doble envío.
- Mensaje para credenciales inválidas.
- Enlace o flujo para crear una cuenta, si el producto lo habilita.

La pantalla llama a `POST /api/auth/login` con:

```json
{
  "email": "usuario@dominio.com",
  "password": "contraseña"
}
```

La respuesta contiene `token` y `user`. El frontend debe:

- Guardar la sesión de forma segura según las capacidades del entorno.
- Enviar la cabecera de autorización con el token vigente en las solicitudes protegidas.
- Conservar el usuario autenticado, su `id`, correo y rol.
- Conservar sus membresías, el rol global si existe y el `tenantId` activo.
- Redirigir al dashboard después de iniciar sesión.
- No guardar ni mostrar la contraseña.
- Limpiar la sesión al cerrar sesión.

### 4.2 Expiración y respuestas no autorizadas

Debe existir un único comportamiento para una sesión inválida o expirada:

- Detectar respuestas `401`.
- Limpiar el token y el contexto de usuario.
- Redirigir a inicio de sesión.
- Mostrar una explicación breve, sin entrar en un ciclo de redirecciones.

Las respuestas `403`, si la API las utiliza para permisos, deben mostrar una
página o estado de acceso denegado y no intentar repetir la solicitud.

### 4.3 Tenant activo

El frontend debe mantener un tenant activo para la sesión. Debe:

- Leer el `tenantId` activo y las membresías del usuario autenticado.
- Mostrar claramente el negocio activo.
- Permitir cambiar de negocio solo entre membresías activas autorizadas.
- Invalidar o recargar los datos del negocio anterior antes de mostrar los del
  nuevo negocio.
- Evitar que el usuario crea que está viendo datos de otro tenant.
- Recargar categorías, productos, ventas y dashboard cuando cambie el tenant.

La API actual obtiene el tenant desde el contexto autenticado para las
operaciones de inventario y ventas. El frontend no debe enviar un `tenantId`
arbitrario como sustituto del contexto de sesión.

## 5. Páginas y módulos requeridos

## 5.1 Página de bienvenida o selección de tenant

Debe existir un flujo inicial para usuarios que aún no tienen sesión:

- Crear un negocio/tenant.
- Capturar el nombre del negocio.
- Mostrar confirmación con el identificador creado.
- Continuar al registro del primer usuario.

La creación usa `POST /api/tenants`:

```json
{
  "name": "Mi negocio"
}
```

La respuesta contiene `id`, `name` y `createdAtUtc`.

Si el producto decide no exponer la administración global de tenants a todos
los usuarios, esta página debe estar restringida al flujo de onboarding o a
usuarios con permiso administrativo.

## 5.2 Página de registro de usuario

Debe permitir registrar un usuario asociado a un tenant:

- Tenant seleccionado o `tenantId` recibido del paso anterior.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña en el frontend.
- Rol: `Admin` o `User`.
- Validaciones antes de enviar.
- Mensajes para correo duplicado y datos inválidos.

La API usa `POST /api/auth/register`:

```json
{
  "tenantId": "guid-del-tenant",
  "email": "usuario@dominio.com",
  "password": "contraseña",
  "role": "Admin"
}
```

La respuesta nunca debe exponer ni solicitar el hash de contraseña. El
frontend puede ofrecer registro de `User`, pero debe reservar la asignación de
`Admin` a `PlatformAdmin` o a un `Admin` autorizado del negocio. La creación
de usuarios debe crear una membresía en el negocio, no convertir al usuario
en administrador global.

## 5.3 Layout autenticado y navegación

Todas las páginas internas deben compartir:

- Menú de navegación.
- Identificación del negocio activo.
- Identificación del usuario y su rol.
- Acción de cerrar sesión.
- Indicadores de carga.
- Notificaciones de éxito y error.
- Manejo consistente de estados vacíos.

La navegación mínima debe incluir Dashboard, Productos, Categorías, Ventas y
Usuarios. La administración de tenants debe aparecer solo donde corresponda.
Para `PlatformAdmin`, la navegación debe separar Administración de plataforma
de Operación del negocio, y nunca mezclar un listado global con el catálogo del
negocio activo.

## 5.4 Dashboard

Debe ser la página principal después del inicio de sesión y mostrar una visión
operativa del negocio:

- Ingresos totales del periodo.
- Cantidad de ventas del periodo.
- Gráfica de ingresos agrupados por día o por mes.
- Tabla o gráfica de evolución de ventas.
- Filtros de fecha `from` y `to`.
- Selector de agrupación `day` o `month`.
- Accesos rápidos para crear producto, registrar venta y administrar
  categorías.
- Estado de carga, error y ausencia de ventas.

Para obtener la información se debe usar:

`GET /api/sales/summary?from=<fecha>&to=<fecha>&groupBy=day|month`

La respuesta tiene:

```json
{
  "items": [
    { "period": "2026-10-30T00:00:00Z", "total": 125000, "count": 3 }
  ],
  "grandTotal": 125000,
  "totalCount": 3
}
```

El frontend debe presentar `grandTotal`, `totalCount` y cada elemento de
`items`. Las fechas deben enviarse en un formato inequívoco y el periodo debe
indicarse según la zona horaria elegida por la interfaz.

## 5.5 Página de categorías

Debe existir un módulo completo de administración de categorías.

### Lista de categorías

- Consultar `GET /api/categories`.
- Mostrar nombre, descripción y fecha de creación.
- Estado vacío con acción para crear la primera categoría.
- Acción para ver o editar.
- Acción para eliminar con confirmación explícita.
- Actualizar la lista después de crear, editar o eliminar.

### Crear categoría

- Campos: `name` obligatorio y `description` opcional.
- Validar que el nombre no esté vacío.
- Enviar `POST /api/categories`.
- Mostrar la categoría creada y volver a la lista o al detalle.

### Editar categoría

- Cargar `GET /api/categories/{id}` cuando sea necesario.
- Editar `name` y `description`.
- Enviar `PUT /api/categories/{id}`.
- Manejar `404` si fue eliminada en otra sesión.

### Eliminar categoría

- Confirmar la acción y advertir que la eliminación puede estar restringida
  cuando existen productos asociados.
- Enviar `DELETE /api/categories/{id}`.
- Interpretar `204` como eliminación exitosa.
- Mostrar el error devuelto por la API si la operación no es posible.

## 5.6 Página de productos

Debe ser el catálogo y punto principal de control de existencias.

### Lista y búsqueda

- Consultar `GET /api/products`.
- Filtrar por `categoryId`.
- Buscar por `search`.
- Permitir combinar búsqueda y categoría.
- Mostrar imagen, nombre, descripción, precio, stock, categoría y fecha.
- Mostrar claramente stock cero y stock bajo según una regla configurable del
  frontend.
- Estado vacío para catálogo sin productos y para filtros sin resultados.
- Acciones de detalle, edición, eliminación y cambio de imagen.

La API no define paginación en el contrato actual. El frontend debe soportar
la lista completa sin asumir páginas, y no debe inventar parámetros de
paginación que la API no reconoce.

### Crear producto

- Campos:
  - `name`: obligatorio.
  - `description`: opcional.
  - `price`: decimal mayor o igual a cero.
  - `stock`: entero mayor o igual a cero.
  - `categoryId`: categoría obligatoria.
  - `imageUrl`: opcional.
- Cargar categorías para el selector.
- Validar precio, existencias y categoría antes de enviar.
- Enviar `POST /api/products`.
- Mostrar la respuesta creada.

### Editar producto

- Cargar el producto mediante `GET /api/products/{id}`.
- Permitir editar nombre, descripción, precio, stock y categoría.
- Enviar `PUT /api/products/{id}`.
- No modificar el identificador ni la fecha de creación.
- Refrescar el catálogo al terminar.

### Imágenes

El módulo debe soportar las dos operaciones disponibles:

1. URL:
   - Campo de URL.
   - Enviar `POST /api/products/{id}/image`.
   - Body: `{ "imageUrl": "https://..." }`.
2. Archivo:
   - Selector de archivo y, cuando el dispositivo lo permita, cámara.
   - Vista previa antes de enviar.
   - Enviar `POST /api/products/{id}/image/upload` como
     `multipart/form-data` con el campo `file`.
   - Mostrar progreso, error y resultado.

El frontend debe validar tamaño, tipo y selección de archivo antes de enviar,
pero debe aceptar que la validación definitiva corresponde al servidor.
Después de una carga exitosa debe usar la `imageUrl` devuelta por la API.

### Eliminar producto

- Confirmar antes de ejecutar `DELETE /api/products/{id}`.
- Mostrar advertencia porque la operación es eliminación física.
- Interpretar `204` como éxito.
- Manejar `404` si el producto ya no existe.

## 5.7 Página de registrar venta

Debe existir una pantalla para construir una venta con uno o varios productos:

- Buscar y seleccionar productos existentes.
- Mostrar stock disponible.
- Elegir cantidad por producto.
- Impedir cantidades cero, negativas o no enteras.
- Impedir agregar el mismo producto varias veces o consolidar sus cantidades.
- Mostrar subtotal por línea y total estimado.
- Permitir quitar líneas y cancelar la operación.
- Exigir al menos una línea.
- Confirmar la venta antes de enviarla.

La API usa `POST /api/sales`:

```json
{
  "items": [
    {
      "productId": "guid-del-producto",
      "quantity": 2
    }
  ]
}
```

El precio no debe ser capturado por el usuario: la API carga el producto y
determina el precio unitario vigente. Al enviar:

- Mostrar estado de procesamiento.
- Deshabilitar el doble envío.
- Mostrar la venta creada, fecha, líneas, precios unitarios y total.
- Actualizar productos, stock, dashboard y listados relacionados.
- Mostrar el conflicto de stock (`409`) de forma accionable, indicando que la
  cantidad debe ajustarse.

## 5.8 Página de historial de ventas

Debe existir una lista de ventas con:

- Fecha inicial `from`.
- Fecha final `to`.
- Tabla con identificador, fecha, cantidad de líneas y total.
- Estado vacío para el periodo seleccionado.
- Acción para abrir el detalle.
- Orden visual coherente por fecha.

La consulta es:

`GET /api/sales?from=<fecha>&to=<fecha>`

Los filtros son opcionales. El frontend debe evitar enviar un rango invertido
y debe definir claramente si la fecha final incluye todo el día.

### Detalle de venta

Al consultar `GET /api/sales/{id}`, mostrar:

- Identificador y fecha de la venta.
- Cada `productId`.
- Cantidad.
- Precio unitario.
- Total de la línea.
- Total de la venta.

La API actual devuelve `productId`, no el nombre del producto dentro de la
venta. El frontend puede resolver y mostrar nombres desde el catálogo cuando
sea seguro hacerlo, pero debe seguir funcionando si el producto ya no está
disponible.

## 5.9 Administración de usuarios y membresías

Debe existir una página de usuarios para `Admin` y una administración global
adicional para `PlatformAdmin`:

- Ver el usuario actual.
- Consultar un usuario por identificador con
  `GET /api/users/{id}`.
- Mostrar correo, rol, tenant y fecha de creación.
- Nunca mostrar contraseñas ni datos sensibles.
- Para un `Admin`, listar y gestionar únicamente usuarios del negocio activo,
  según las operaciones que exponga la API.
- Para un `PlatformAdmin`, listar las membresías de cualquier negocio,
  filtrar por negocio, rol y estado, e invitar, cambiar rol, suspender o
  revocar acceso con confirmación.
- Mostrar la diferencia entre el rol global y el rol dentro del negocio.
- Ocultar o bloquear cada acción para usuarios sin permisos.

Las acciones deben respetar el alcance del rol y de la membresía activa. Si
una operación no está disponible para un rol o devuelve `403`, el frontend
debe mostrar el estado de acceso denegado y no simular un resultado exitoso.

## 5.10 Administración global de negocios

Debe existir una página exclusiva para `PlatformAdmin` cuando el producto
necesite administrar varios negocios:

- Consultar el listado global con `GET /api/platform/tenants`.
- Ver detalle, miembros y estado con
  `GET /api/platform/tenants/{id}`.
- Crear con `POST /api/platform/tenants`.
- Suspender o reactivar con
  `PATCH /api/platform/tenants/{id}/status`, con confirmación de alto impacto.
- Mostrar nombre, identificador, estado, fecha de creación y administrador
  principal.
- Acceder al selector de negocio sin cambiar accidentalmente el rol global.

La administración global de negocios no debe confundirse con el tenant activo
de la sesión. El frontend debe consumir el contrato de plataforma y mostrar
por separado el contexto global y el contexto operativo del negocio
seleccionado.

## 6. Contrato de datos que debe respetarse

El frontend debe modelar, como mínimo, estas respuestas:

- Categoría: `id`, `name`, `description`, `createdAtUtc`.
- Producto: `id`, `name`, `description`, `price`, `stock`, `categoryId`,
  `imageUrl`, `createdAtUtc`.
- Venta: `id`, `saleDateUtc`, `items`, `total`.
- Línea de venta: `productId`, `quantity`, `unitPrice`, `total`.
- Resumen: `items`, `grandTotal`, `totalCount`.
- Tenant: `id`, `name`, `createdAtUtc`.
- Usuario: `id`, `tenantId`, `email`, `role`, `createdAtUtc`.
- Login: `token`, `user`.
- Membresía: `tenantId`, `tenantName`, `role`, `status`, `createdAtUtc`.
- Sesión: `user`, `memberships`, `activeTenantId` y, si aplica,
  `platformRole`.

Los campos opcionales pueden ser nulos. El frontend debe mostrar un valor
neutro para descripciones o imágenes ausentes, sin enviar cadenas inválidas.

## 7. Estados y errores obligatorios

Cada página que consulte o modifique la API debe contemplar:

- Carga inicial.
- Carga de actualización.
- Éxito.
- Error de red o API caída.
- Error de validación.
- Estado vacío.
- Reintento cuando tenga sentido.
- Cancelación o navegación durante una solicitud.

Mapeo mínimo de respuestas:

- `400`: datos inválidos o regla de negocio; mostrar `message`.
- `401`: cerrar sesión y solicitar autenticación.
- `404`: recurso inexistente; ofrecer regresar o actualizar.
- `409`: conflicto, principalmente stock insuficiente o usuario duplicado.
- `500`: mostrar mensaje genérico y opción de reintentar; no mostrar
  información interna.

No se deben presentar operaciones optimistas de eliminación, venta o cambio de
imagen como exitosas antes de recibir respuesta satisfactoria.

## 8. Permisos y visibilidad

El frontend debe centralizar las reglas de autorización:

- `PlatformAdmin`: administración global de negocios y membresías; no obtiene
  acceso operativo a un negocio sin seleccionarlo y validarlo.
- `Admin`: administración del negocio activo, usuarios de ese negocio y
  operaciones de catálogo.
- `User`: operación diaria permitida por el producto, como consultar catálogo
  y registrar ventas.
- Membresía `Suspended` o `Revoked`: no puede seleccionar ni operar ese
  negocio.

Las reglas deben evaluarse con el rol efectivo para el negocio activo, no solo
con el nombre del rol guardado en el usuario. La interfaz debe ocultar
acciones no permitidas, pero nunca considerar el ocultamiento como seguridad:
la API sigue siendo la autoridad final.

## 9. Requisitos de usabilidad

- Diseño adaptable a escritorio y dispositivos móviles.
- Formularios utilizables desde teléfono.
- Carga de imágenes desde cámara o galería cuando el dispositivo lo soporte.
- Confirmaciones antes de eliminar datos o registrar una venta.
- Formateo consistente de moneda, cantidades y fechas.
- No depender de nombres de productos para identificar registros: usar GUID
  internamente.
- Mantener filtros y contexto al volver de un detalle cuando sea posible.
- Proporcionar textos accesibles para controles, imágenes, errores y estados
  de carga.

## 10. Límites conocidos y trabajo futuro

El frontend debe diseñarse para evolucionar sin asumir que estas capacidades
ya existen:

- Paginación y ordenamiento del servidor no están definidos.
- Los payloads definitivos de plataforma, membresías y contexto deben
  mantenerse alineados con el OpenAPI vigente.
- La disponibilidad de cada acción depende del rol global, el rol de la
  membresía activa y su estado.
- El filtrado por tenant debe seguir el contexto autenticado actual.
- La persistencia real y transacciones del backend pueden cambiar al pasar de
  almacenamiento en memoria a un proveedor definitivo.
- Los nombres de productos no forman parte del detalle de venta actual.

Estas limitaciones no deben resolverse inventando endpoints o parámetros.
Cuando se requieran, deben agregarse primero al contrato de la API y luego al
frontend.

## 11. Criterios de completitud

Se considera que el frontend utiliza completamente la API cuando:

- Un `PlatformAdmin` puede administrar negocios, membresías y accesos sin
  confundirse con el rol `Admin` de un negocio.
- Un usuario puede crear o seleccionar un tenant, registrarse e iniciar sesión.
- Un usuario con varias membresías puede cambiar de negocio y ver solo datos
  del contexto activo.
- Las solicitudes autenticadas envían el token correctamente.
- Un administrador puede gestionar categorías y productos, incluidas sus
  imágenes.
- Un usuario autorizado puede registrar ventas respetando el stock.
- Se pueden consultar ventas por periodo y ver el detalle de cada una.
- El dashboard muestra el resumen por día o mes.
- Se manejan roles, expiración de sesión, errores, estados vacíos y conflictos.
- Las acciones globales y las acciones del negocio muestran claramente su
  alcance y no se habilitan para el rol equivocado.
- Ninguna pantalla depende de endpoints que no existen en la API vigente.

## 12. Revisión de contrato antes de entregar

Antes de considerar completa una funcionalidad multi-negocio, el equipo debe
comprobar en el OpenAPI vigente:

- Que existen los endpoints de plataforma, membresías, sesión y contexto
  descritos en la sección 3.2.
- Que `PlatformAdmin`, `Admin` y `User` se representan con nombres y valores
  consistentes entre login, sesión y membresías.
- Que los estados `Active`, `Suspended` y `Revoked` tienen el mismo significado
  en backend y frontend.
- Que las respuestas de error conservan la propiedad `message` y los códigos
  `400`, `401`, `403`, `404`, `409` y `500`.
- Que seleccionar un negocio actualiza el contexto autenticado antes de
  consultar dashboard, categorías, productos o ventas.
- Que las operaciones de suspensión, revocación y cambio de rol requieren
  confirmación y no se presentan como exitosas antes de la respuesta de la API.
