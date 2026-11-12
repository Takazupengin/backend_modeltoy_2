# Arquitectura ModelToys

## Funcionalidades verificadas en React

`App.jsx` navega por estado entre inicio, catálogo, carrito, login, perfil, administración, especiales y nosotros. `Inicio`, `Nosotros`, `Header` y `ProductCard` conservan su diseño e imágenes. El catálogo tiene filtro por escala y disponibilidad, imágenes rotativas y precios CLP. `data/productos.js` contiene diez productos base y seis adicionales; se migraron los 16, sin alterar sus precios ni descripciones.

`Login` pide nombre, correo y contraseña para registro, y correo/contraseña para ingresar. `Perfil` muestra compras propias y un foro comunitario con kit/tema y pregunta. `Carrito` maneja cantidades, recomendaciones, despacho, nombre, RUT, dirección, ciudad, medio y cuotas. El envío es gratis desde $50.000, o $4.990. `Especial` contiene cuatro preventas con pie y total. Los pies originales no equivalen exactamente al 50% matemático; se conservan sus valores. `Admin` permite editar precio/disponibilidad, dar de baja usuarios, revisar órdenes y exportar inventario CSV.

## Componentes

| Componente | Puerto interno | Responsabilidad |
|---|---|---|
| frontend | 80, publicado 8088 | React/Vite servido por Nginx; proxy `/api` al Gateway |
| gateway | 8080 | WebFlux, rutas, JWT y CORS |
| ms-usuarios | 8081 | Registro/login, emisión JWT, perfil, roles, foro y baja lógica |
| ms-carrito | 8082 | Catálogo/preventas, carrito por propietario y órdenes |
| ms-admin | 8083 | Control ADMIN y clientes HTTP autenticados hacia usuarios/carrito |
| mysql | 3306 | MySQL 8.4, bases separadas y volumen persistente |

Los servicios de negocio no publican puertos en Compose. El Gateway es la entrada HTTP de APIs para React; el puerto MySQL publicado solo en loopback permite las pruebas desde el host. La red bridge de Compose comunica contenedores por sus nombres. En ejecución host las propiedades usan localhost. `ms-admin` no tiene JPA ni accede a bases ajenas. El módulo `common` existente se conserva y no es utilizado. No se renombraron módulos ni paquetes Application. Se mantienen Spring Boot 4.1.2 y Spring Cloud 2025.1.4, con arranque del Gateway probado.

## Seguridad

JWT RS256: privada solo en usuarios, pública en verificadores. Gateway y cada microservicio validan firma, emisor y vencimiento. Registro crea siempre `PILOTO`, aunque se envíe ADMIN. BCrypt costo 12, máximo real 72 bytes UTF-8. DTO públicos sin hash ni contraseña. Administrador inicial opcional por entorno: no promueve usuarios públicos existentes ni reemplaza contraseñas guardadas.

React mantiene el JWT solo en memoria; recargar requiere iniciar sesión nuevamente. No hay refresh token ni cookies autenticadas. CSRF se desactiva al usar Authorization explícito y sesiones HTTP desactivadas. CORS admite solo los orígenes configurados. El carrito invitado usa un UUID opaco en sessionStorage, independiente del JWT; al entrar a una cuenta se usa su carrito y al salir se vuelve al carrito invitado. No hay mezcla automática de carritos.

La baja de usuario conserva sus publicaciones y bloquea login/perfil/foro. Un JWT previo puede seguir autorizando el servicio carrito hasta vencer (30 minutos por defecto): no hay revocación distribuida ni introspección en esta entrega. HTTPS debe configurarse al desplegar fuera del equipo local. Los datos antiguos de localStorage no se importan al backend: si usabas la versión anterior, elimina conscientemente `usuarios_db` y `usuario_sesion` en las herramientas de tu navegador para retirar contraseñas heredadas. La aplicación nueva no los lee ni escribe.

## Reglas de negocio y límites

- El servidor determina precios, envío y total; ignora precios o identidades enviados por cliente.
- Carrito autenticado por subject del JWT; no se acepta un correo/usuario destino del cliente. Historial filtrado por correo autenticado.
- Checkout bloquea carrito y productos en una transacción. Dos envíos sobre un mismo carrito generan una sola orden; el segundo recibe 409. Las mutaciones usan bloqueo pesimista del carrito. La creación inicial concurrente de un carrito puede devolver 409 por unicidad; se puede reintentar.
- Stock significa disponibilidad `in-stock/out-of-stock`, tal como el formulario original. No se inventaron cantidades iniciales ni se descuenta un inventario físico inexistente. La disponibilidad se revalida bajo bloqueo al crear órdenes. Para operar con unidades físicas hace falta definir cantidades reales y ampliar el formulario administrativo.
- Orden creada como `Pendiente de pago`. Los medios y cuotas son preferencias registradas; no hay pasarela, cobro ni facturación. El dashboard muestra monto ordenado, no ingresos cobrados.
- Identificador de orden UUID; detalles y precios quedan como una instantánea JSON para conservar el historial si cambia el catálogo.
- Foro comunitario para cuentas activas; autor derivado del usuario autenticado, no del formulario. No se inventaron endpoints de edición de perfil, cancelación, cobro o actualización de estados sin controles existentes en React.

## Verificación

Comandos y demostración en el README. Suites HTTP de usuarios/carrito pueden ejecutarse tanto sobre H2 como sobre bases MySQL aisladas. El script `probar-integracion.py` recorre Gateway, servicios reales y proxy Nginx, incluyendo concurrencia y CORS. La revisión visual mediante Browser no estuvo disponible por un error de conexión de su herramienta; las pruebas React usan jsdom.

Resultados ejecutados el 11 de noviembre de 2026:

- `mvn clean verify`: BUILD SUCCESS en los cuatro módulos, 12 pruebas sin fallos.
- Usuarios con MySQL real: 7 pruebas sin fallos; carrito con MySQL real: 2 sin fallos.
- React: lint, 19 pruebas y build de producción correctos.
- Construcción Docker de las cinco aplicaciones correcta; MySQL y aplicaciones llegaron a healthcheck saludable.
- Prueba integrada HTTP correcta: registro/login, perfil, roles, foro, 16 productos/4 preventas, carrito por propietario, precios, checkout concurrente (201/409), CORS permitido/rechazado, preventa por invitado, clientes administrativos y proxy Nginx.
- `npm ci` en la imagen informó 8 vulnerabilidades de dependencias (5 moderadas, 3 altas). No se aplicaron actualizaciones automáticas ni `audit fix --force`; corresponde revisar el árbol heredado antes de publicar fuera del entorno local.
