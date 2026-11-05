# Guía para implementar los endpoints faltantes (referencia histórica)

> Nota: los endpoints descritos en esta guía ya están implementados en el backend
> actual. El contrato vigente está en `tasks/api-contract.md`. Este documento se
> conserva como referencia de diseño.

Esta guía propone el contrato backend necesario para desbloquear las funciones
pendientes del frontend. Está basada en el contrato actual de
`http://localhost:5082/openapi/v1.json`, que hoy expone productos, categorías,
ventas, autenticación, negocios, membresías y auditoría, pero no movimientos,
compras, stock mínimo, códigos de barras, paginación, exportación ni un formato
de errores uniforme.

La implementación debe hacerse en el repositorio de la API. El frontend debe
integrarse después de que los endpoints estén disponibles y probados.

## 1. Reglas generales del contrato

### Contexto del negocio

Todos los endpoints operativos deben resolver el `tenantId` desde el contexto
autenticado, igual que los endpoints actuales de productos y ventas.

- No aceptar `tenantId` libre desde el body para operaciones normales.
- Verificar que el usuario tenga una membresía activa en ese negocio.
- Rechazar el acceso cruzado entre negocios con `403 Forbidden` o responder
  `404 Not Found` si el proyecto adopta ocultamiento de recursos.
- Las consultas de plataforma son la excepción: solo deben estar disponibles
  para el rol de plataforma.

### Identificadores y fechas

- Usar UUID para recursos nuevos, de acuerdo con los endpoints existentes.
- Guardar fechas en UTC y devolverlas en ISO 8601.
- No aceptar fechas ambiguas; validar `date-time` en query params.
- Mantener nombres JSON en `camelCase`.

### Formato uniforme de error

Agregar respuestas documentadas para `400`, `401`, `403`, `404`, `409`, `422` y
`500` con un único formato:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "No hay existencias suficientes para completar la operación.",
    "details": {
      "productId": "uuid",
      "available": 2,
      "requested": 5
    },
    "traceId": "correlation-id"
  }
}
```

Recomendación de códigos:

| HTTP | Código | Uso |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | JSON mal formado o parámetros inválidos |
| 401 | `UNAUTHENTICATED` | Token ausente, inválido o expirado |
| 403 | `FORBIDDEN` | Usuario sin permiso |
| 404 | `RESOURCE_NOT_FOUND` | Recurso inexistente o no visible |
| 409 | `CONFLICT` | Conflicto de stock, duplicado o versión |
| 422 | `VALIDATION_ERROR` | Datos bien formados pero semánticamente inválidos |
| 500 | `INTERNAL_ERROR` | Error inesperado sin detalles internos |

Nunca devolver stack traces, SQL, tokens, contraseñas ni información de otros
negocios.

## 2. Movimientos de inventario

### Objetivo

Registrar entradas, salidas y ajustes con trazabilidad. Las ventas deben generar
movimientos de salida dentro de la misma transacción; no debe existir una venta
confirmada cuyo descuento de stock falle.

### Modelo

```text
InventoryMovement:
  id: uuid
  tenantId: uuid
  productId: uuid
  type: "IN" | "OUT" | "ADJUSTMENT"
  quantity: integer
  stockBefore: integer
  stockAfter: integer
  reason: string
  referenceType: string | null
  referenceId: uuid | null
  createdByUserId: uuid
  createdAtUtc: date-time
```

Reglas:

- `quantity` siempre debe ser mayor que cero.
- `IN` incrementa stock.
- `OUT` decrementa stock y no puede dejar stock negativo.
- `ADJUSTMENT` debe recibir el valor final o una diferencia claramente definida;
  no mezclar ambos significados.
- `stockBefore` y `stockAfter` los calcula el servidor.
- `reason` es obligatorio para ajustes manuales.
- No permitir editar ni eliminar movimientos confirmados; una corrección debe
  crear un nuevo ajuste.

### Endpoints

```text
GET  /api/InventoryMovements
POST /api/InventoryMovements
GET  /api/InventoryMovements/{id}
```

Query params recomendados:

```text
productId={uuid}
type=IN|OUT|ADJUSTMENT
from={date-time}
to={date-time}
page={number}
pageSize={number}
```

Request de creación:

```json
{
  "productId": "uuid",
  "type": "IN",
  "quantity": 10,
  "reason": "Compra a proveedor",
  "referenceType": "PURCHASE",
  "referenceId": "uuid"
}
```

La operación debe usar una transacción y bloqueo optimista o pesimista para
evitar que dos salidas consuman el mismo stock.

## 3. Compras y proveedores

### Objetivo

Registrar entradas de mercancía con proveedor, costo y detalle, en lugar de
tratar cada entrada como un ajuste anónimo.

### Modelos mínimos

```text
Supplier:
  id: uuid
  tenantId: uuid
  name: string
  email: string | null
  phone: string | null
  isActive: boolean
  createdAtUtc: date-time

Purchase:
  id: uuid
  tenantId: uuid
  supplierId: uuid | null
  status: "DRAFT" | "RECEIVED" | "CANCELLED"
  total: decimal
  receivedAtUtc: date-time | null
  createdByUserId: uuid
  createdAtUtc: date-time

PurchaseItem:
  id: uuid
  purchaseId: uuid
  productId: uuid
  quantity: integer
  unitCost: decimal
  total: decimal
```

### Endpoints

```text
GET    /api/Suppliers
POST   /api/Suppliers
PUT    /api/Suppliers/{id}
DELETE /api/Suppliers/{id}

GET    /api/Purchases
POST   /api/Purchases
GET    /api/Purchases/{id}
PATCH  /api/Purchases/{id}/status
```

Reglas:

- Una compra `DRAFT` no cambia stock.
- Cambiar a `RECEIVED` incrementa stock y crea movimientos `IN` en una única
  transacción.
- Una compra `RECEIVED` no puede volver a recibirse.
- Cancelar una compra recibida requiere un movimiento compensatorio o debe
  bloquearse según la política del negocio.
- Calcular totales en servidor; el cliente solo propone valores.

## 4. Stock mínimo y alertas

### Modelo

Agregar a `ProductResponse` un campo opcional y compatible:

```text
minimumStock: integer
```

Si el umbral debe variar por negocio, pertenece al producto dentro del tenant.
No usar un valor global si los negocios tienen necesidades distintas.

Validaciones:

- `minimumStock >= 0`.
- Definir si `null` significa “sin alerta” o si se sustituye por cero.
- Documentar la decisión y mantenerla igual en productos, dashboard y reportes.

### Endpoints

No es obligatorio crear un endpoint nuevo si `minimumStock` se incorpora en
`POST /api/Products` y `PUT /api/Products/{id}`. Para evitar cargar todos los
productos cuando crezca el catálogo, añadir:

```text
GET /api/Products/alerts?kind=LOW|OUT
```

Respuesta:

```json
{
  "items": [
    {
      "productId": "uuid",
      "name": "Producto",
      "stock": 2,
      "minimumStock": 5,
      "kind": "LOW"
    }
  ],
  "totalItems": 1
}
```

El servidor debe ser la fuente de verdad para clasificar `LOW` y `OUT`.

## 5. Código de barras

### Modelo

Agregar de forma opcional:

```text
barcode: string | null
```

Reglas:

- Normalizar espacios y formato antes de guardar.
- Crear índice único por `tenantId` y `barcode`.
- Permitir `null` para productos sin código.
- Rechazar duplicados con `409 BARCODE_ALREADY_EXISTS`.
- No asumir que todos los códigos son numéricos; guardar como string.

### Endpoints

No hace falta una ruta especializada para guardar el código:

```text
POST /api/Products
PUT  /api/Products/{id}
GET  /api/Products?barcode={value}
```

Si se necesita una lectura exacta más eficiente:

```text
GET /api/Products/by-barcode/{barcode}
```

La búsqueda por código debe ser exacta, limitada al negocio activo y devolver
`404 RESOURCE_NOT_FOUND` si no existe.

## 6. Paginación y ordenamiento

Los endpoints actuales devuelven arreglos sin metadatos. Para no romper clientes
existentes, introducir una respuesta paginada mediante una nueva forma
versionada o una transición compatible:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "totalItems": 142,
  "totalPages": 6
}
```

Parámetros:

```text
page=1
pageSize=25
sortBy=createdAtUtc
sortOrder=asc|desc
```

Reglas:

- `page >= 1`.
- `pageSize` entre 1 y 100.
- Lista blanca para `sortBy`; nunca concatenar directamente un campo recibido
  del usuario en SQL.
- Orden estable agregando `id` como segundo criterio.
- Definir si se conserva temporalmente la respuesta arreglo para clientes
  antiguos o si se publica `/api/v2/Products`.

Aplicar primero a productos, ventas, movimientos, compras y auditoría.

## 7. Exportación

### Opción recomendada: exportación asíncrona solo si el volumen crece

Para catálogos y ventas pequeños, el frontend puede generar CSV con datos
recibidos. Para reportes grandes, el backend debe generar el archivo:

```text
GET /api/Reports/sales.csv?from={date-time}&to={date-time}
GET /api/Reports/inventory.csv
```

Requisitos:

- `Content-Type: text/csv; charset=utf-8`.
- `Content-Disposition` con nombre seguro.
- Escapar comas, comillas, saltos de línea y fórmulas de hoja de cálculo.
- Filtrar siempre por tenant.
- No aceptar una lista arbitraria de columnas sin validar.

Si el archivo puede tardar, usar:

```text
POST /api/Reports/exports
GET  /api/Reports/exports/{id}
GET  /api/Reports/exports/{id}/download
```

## 8. Idempotencia y consistencia de ventas

El contrato actual tiene `POST /api/Sales` pero no define idempotencia. Esto es
importante porque un timeout puede dejar una venta creada aunque el frontend no
reciba la respuesta.

### Contrato recomendado

El cliente genera una clave una sola vez por intención y la reusa al reintentar:

```http
POST /api/Sales
Idempotency-Key: sale-intent-uuid
```

El servidor debe:

1. Guardar la clave junto con tenant, usuario y hash del payload.
2. Aplicar una restricción única por `tenantId` y `idempotencyKey`.
3. Rechazar la misma clave con otro payload mediante `422`.
4. Devolver la respuesta original si la operación ya terminó.
5. Responder `409` si la primera operación sigue en curso.
6. Ejecutar creación de venta, movimientos `OUT` y actualización de stock en
   una única transacción.

Nunca generar una clave nueva automáticamente en cada retry.

## 9. Auditoría ampliada

Extender `AuditEventResponse` sin eliminar campos:

```text
ipAddress: string | null
userAgent: string | null
metadata: object | null
```

No guardar contraseñas, tokens ni archivos completos en metadata.

Añadir filtros:

```text
GET /api/platform/audit?
  action={text}&
  resourceType={text}&
  actorUserId={uuid}&
  from={date-time}&
  to={date-time}&
  page=1&pageSize=25
```

El acceso debe seguir restringido a plataforma.

## 10. Migraciones y orden de implementación

Implementar en este orden:

1. Formato uniforme de errores y correlation/trace ID.
2. Transacciones y concurrencia de stock.
3. Movimientos de inventario.
4. `minimumStock` y endpoint de alertas.
5. `barcode` e índice único por tenant.
6. Idempotencia y consistencia de `POST /api/Sales`.
7. Proveedores y compras.
8. Paginación server-side.
9. Reportes y exportación.
10. Auditoría ampliada.

Cada paso debe incluir:

- migración reversible;
- modelo y validadores;
- endpoint y autorización;
- pruebas unitarias;
- pruebas de integración;
- actualización de OpenAPI;
- datos de ejemplo o seed si el proyecto los usa;
- nota de compatibilidad para el frontend.

## 11. Pruebas mínimas del backend

### Aislamiento multi-negocio

- Un usuario no puede leer productos de otro tenant.
- Un código de barras duplicado solo se rechaza dentro del mismo tenant.
- Una venta nunca afecta stock de otro tenant.

### Concurrencia

- Dos salidas simultáneas no pueden dejar stock negativo.
- Una compra recibida dos veces solo incrementa stock una vez.
- Dos requests con el mismo `Idempotency-Key` producen una sola venta.

### Autorización

- `Admin` y `User` tienen permisos definidos para cada operación.
- Las rutas de plataforma rechazan usuarios de negocio.
- Las acciones destructivas quedan auditadas.

### Validación

- Cantidades enteras y mayores que cero.
- Precios y costos no negativos.
- Fechas válidas y rangos coherentes.
- `pageSize` limitado.
- Campos de texto con longitud máxima.
- Código de barras normalizado y único.

## 12. Criterio de entrega para cada endpoint

Un endpoint se considera listo únicamente cuando:

- está documentado en OpenAPI;
- tiene request/response tipados;
- define errores y códigos HTTP;
- valida el tenant y el rol;
- tiene pruebas de éxito, validación, autorización y conflicto;
- tiene migración aplicada y rollback documentado;
- no expone secretos ni datos de otro negocio;
- el frontend puede consumirlo con un contrato estable.
