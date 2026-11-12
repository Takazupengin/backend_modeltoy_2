# Contratos HTTP

React llama `/api` del mismo origen. Nginx o el proxy Vite envía al Gateway en 8080. Salvo rutas públicas, enviar `Authorization: Bearer <accessToken>`. UsuarioResponse: `{id,nombre,correo,rol,activo}`. Errores de negocio: ProblemDetail con `detail`; validación añade `errores`. Estados habituales: 400 datos inválidos, 401 sin credencial válida, 403 permiso insuficiente, 404 recurso inexistente, 409 conflicto; admin responde 502 si el servicio remoto no está disponible.

## Usuarios, puerto interno 8081

| Método | Ruta | Acceso | Contrato |
|---|---|---|---|
| POST | `/api/auth/register` | Público | `{nombre,correo,password}` → 201 `{accessToken,tokenType,expiresIn,usuario}` |
| POST | `/api/auth/login` | Público | `{correo,password}` → 200 misma respuesta |
| GET | `/api/usuarios/me` | Cuenta activa | UsuarioResponse propio |
| GET | `/api/usuarios` | ADMIN | Lista de usuarios activos e inactivos |
| DELETE | `/api/usuarios/{id}` | ADMIN | 204 baja lógica; 409 si es administrador |
| GET | `/api/foro` | Cuenta activa | Publicaciones comunitarias |
| POST | `/api/foro` | Cuenta activa | `{kit,pregunta}` → 201 `{id,autor,kit,pregunta,fecha}` |

Nombre entre 3 y 120, correo válido hasta 254; contraseña de registro mínimo 6 caracteres, máximo 72 bytes UTF-8. Kit hasta 160 (omitido/vacío → General), pregunta no vacía hasta 2000. Correo normalizado a minúsculas; duplicado → 409. Rol/autor del cliente no se usan para asignar privilegios/identidad. Fechas ISO UTC, formateadas en React como es-CL.

## Tienda, puerto interno 8082

| Método | Ruta | Acceso | Contrato |
|---|---|---|---|
| GET | `/api/productos?scale=RG&status=in-stock` | Público | Lista `{id,nombre,grade,scale,precio,status,imagenes,descripcion}` |
| GET | `/api/preventas` | Público | Lista `{id,nombre,grade,llegada,precioTotal,precioPie,imagen,descripcion}` |
| PUT | `/api/productos/{id}` | ADMIN | `{precio,status}` → producto actualizado |
| GET | `/api/carrito` | Usuario o invitado | `{items,subtotal,envio,total}` |
| POST | `/api/carrito/items/{id}` | Usuario o invitado | `{cantidad}` agrega a cantidad actual |
| PUT | `/api/carrito/items/{id}` | Usuario o invitado | `{cantidad}` fija cantidad |
| DELETE | `/api/carrito/items/{id}` | Usuario o invitado | Resumen actualizado |
| DELETE | `/api/carrito` | Usuario o invitado | 204 |
| POST | `/api/ordenes` | Usuario o invitado | Checkout → 201 OrdenResponse |
| GET | `/api/ordenes` | Autenticado | Solo órdenes del usuario |
| GET | `/api/ordenes/admin` | ADMIN | Todas las órdenes |

Invitados envían UUID válido en `X-Guest-Id`. JWT válido prevalece sobre ese header. IDs de preventa en carrito: `<id>-pie` o `<id>-total`. Cantidades de 1 a 99; precio positivo; status `in-stock` o `out-of-stock`. Un producto marcado agotado puede eliminarse del carrito; no puede comprarse. No se guarda stock numérico sin datos reales.

Checkout: `{nombre,rut,direccion,ciudad,metodoPago,cuotas}`. RUT valida dígito verificador; dirección hasta 240, ciudad hasta 120. Medios: webpay, credito, debito, transferencia. Crédito admite 1/3/6/12 cuotas; otros se guardan con 1. No se aceptan precios ni un dueño distinto en el contrato. OrdenResponse: `{id,usuarioEmail,nombre,rut,direccion,ciudad,metodoPago,cuotas,subtotal,envio,total,estado,fecha,productos}`; cada línea `{id,nombre,precio,cantidad,imagen,grade}`. Estado inicial `Pendiente de pago`. Invitado no obtiene un historial público por RUT o correo.

## Administración, puerto interno 8083

Todas requieren ADMIN. El servicio propaga el mismo bearer token hacia el servicio de negocio, que vuelve a verificar permisos.

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/api/admin/usuarios` | Lista de usuarios |
| DELETE | `/api/admin/usuarios/{id}` | 204, baja lógica |
| GET | `/api/admin/productos` | Catálogo |
| PUT | `/api/admin/productos/{id}` | `{precio,status}` → producto |
| GET | `/api/admin/ordenes` | Historial global |
| GET | `/api/admin/dashboard` | `{pilotos,ordenes,montoOrdenado,productos}` |

Exportación CSV se realiza en React con el catálogo remoto; no se añadió un endpoint artificial de planillas. `GET /actuator/health` público en los cuatro servicios permite healthchecks.

## Probar desde Bash

```bash
curl -i http://localhost:8080/api/productos
curl -i -H 'Content-Type: application/json' \
  -d '{"nombre":"Piloto Demo","correo":"piloto@example.cl","password":"clave-demo-123"}' \
  http://localhost:8080/api/auth/register
# Copia accessToken en una variable de esta terminal, sin persistirlo.
read -r -s TOKEN
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/usuarios/me
curl -i -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"cantidad":1}' http://localhost:8080/api/carrito/items/RX-78-2
curl -i -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"nombre":"Piloto Demo","rut":"12.345.678-5","direccion":"Calle 123","ciudad":"Viña del Mar","metodoPago":"webpay","cuotas":1}' \
  http://localhost:8080/api/ordenes
unset TOKEN
```

En Fish usa el script Python de integración o la interfaz para evitar diferencias de sintaxis de variables.
