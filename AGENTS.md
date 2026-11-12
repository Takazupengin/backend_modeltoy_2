# ModelToys — instrucciones y contexto para Codex

## Objetivo
Completar el backend de la tienda ModelToys existente, preservando el diseño, rutas y experiencia del frontend React. El trabajo debe corresponder a las funcionalidades REALES encontradas en el frontend local; no inventar endpoints ni entidades sin verificar primero su uso.

## Contexto del trabajo realizado en ChatGPT
- Repositorio: https://github.com/Takazupengin/Modeltoys_Reac.git
- Sistema del desarrollador: CachyOS (Linux), terminal Fish; Java 21, Maven instalado, VS Code con Codex.
- Frontend: React + Vite; separado dentro de `frontend/`.
- Backend: proyecto Maven multimódulo en `backend/`, con módulos `ms-usuarios`, `ms-carrito`, `ms-admin`, `gateway`. Existe `backend/pom.xml` agregador. `mvn validate` y `mvn clean package -DskipTests` dieron BUILD SUCCESS antes de añadir la lógica de negocio.
- Puertos: gateway 8080, usuarios 8081, carrito 8082, admin 8083.
- Se usa `application.properties`, NO `application.yml`, salvo que el repositorio real muestre lo contrario.
- Se creó un `compose.yaml` en la raíz para MySQL 8.4 con volumen `mysql_data` y scripts en `./backend/sql`; revisar su estado real antes de modificarlo.
- Bases propuestas: `modeltoys_usuarios`, `modeltoys_carrito`, `modeltoys_admin`. Nunca subir credenciales ni `.env`.
- Gateway utiliza la variante reactiva Spring Cloud Gateway WebFlux. Antes de cambiar versiones o propiedades, inspeccionar POM y compatibilidad reales.

## Estructura objetivo (sin renombrar módulos existentes)
Cada servicio Java mantiene paquetes bien organizados:
- `config/`: configuración y beans
- `controller/`: endpoints HTTP
- `dto/`: solicitudes y respuestas/validaciones
- `exception/`: excepciones y handler HTTP
- `model/`: entidades JPA cuando corresponda
- `repository/`: persistencia Spring Data JPA cuando corresponda
- `service/`: reglas de negocio
- `security/`: seguridad y JWT cuando corresponda
- `client/`: clientes HTTP a otros servicios, especialmente en `ms-admin`
No crear clases vacías solo por replicar carpetas. Respetar los nombres de paquete originales de cada Application.java y ajustar los nuevos paquetes a ellos.

## Responsabilidades propuestas (validar contra el frontend)
### ms-usuarios
- Registro, login, perfil, roles y autenticación JWT.
- Publicaciones de foro si el frontend efectivamente las contiene.
- Guardar contraseñas como hash BCrypt (nunca texto plano).
- Prohibir asignar ADMIN desde un registro público; retirar credenciales de administrador embebidas en React si existen.
- API pública propuesta: `/api/auth/register`, `/api/auth/login`; API privada `/api/usuarios/me`, `/api/foro` según funcionalidades.

### ms-carrito
- Catálogo, filtros, stock, carrito persistido por usuario, órdenes e historial, preventas si aparecen en React.
- Modelos posibles: Producto, Carrito, ItemCarrito, Orden, DetalleOrden, Preventa, sujeto a análisis del frontend.
- APIs propuestas: `/api/productos/**`, `/api/carrito/**`, `/api/ordenes/**`, `/api/preventas/**`.
- El backend recalcula precios y totales. Manejo transaccional de stock; evitar duplicar operaciones y acceder a carritos ajenos. No afirmar pagos realizados sin integración real con pasarela.

### ms-admin
- Dashboard, informes, inventario, operaciones administrativas sobre usuarios, productos y órdenes.
- Usar clientes HTTP autenticados hacia usuarios/carrito; no escribir en las bases de datos ajenas ni duplicar entidades JPA sin necesidad.
- API propuesta: `/api/admin/**`; exigir rol ADMIN.

### gateway
- Único punto de entrada pública para React; rutas `/api/auth/**`, `/api/usuarios/**`, `/api/foro/**` hacia usuarios; `/api/productos/**`, `/api/carrito/**`, `/api/ordenes/**`, `/api/preventas/**` hacia carrito; `/api/admin/**` hacia admin.
- Configurar CORS para React de desarrollo y seguridad JWT.
- Si los servicios se ejecutan en host: `localhost:8081/8082/8083`. En Docker Compose: usar nombres de servicio, NO localhost.

## Seguridad
- Spring Security y OAuth2 Resource Server para VALIDAR JWT. La emisión de JWT se implementa explícitamente en ms-usuarios.
- Preferir firmas asimétricas RS256 con clave privada solo en emisor y clave pública/JWKS en verificadores; no incluir claves en el repo.
- Verificar token y permisos también en servicios de negocio, no solo en gateway.
- Autorización por recurso: el usuario solo puede leer/modificar lo suyo.
- Configurar validación de entrada, errores controlados y CORS limitado.
- No persistir contraseñas ni tokens de acceso en `localStorage`; escoger estrategia de sesión segura y explicarla.

## Base de datos y Docker
- MySQL 8.4 dentro de Docker con volumen persistente.
- Bases de datos separadas por servicio; usar usuarios MySQL con mínimos permisos cuando sea posible.
- Leer `compose.yaml` y scripts antes de editar; los scripts de `/docker-entrypoint-initdb.d` solo corren sobre volumen recién inicializado. No ejecutar `docker compose down -v` ni destruir datos sin aprobación explícita.
- Se desean Dockerfiles para React y cada aplicación Java, con configuración por variables de entorno, healthchecks, redes y configuración compatible con Maven multimódulo.
- Usar migraciones versionadas (Flyway o equivalente) en vez de `ddl-auto=update` para la entrega final.

## Integración frontend
- Inspeccionar `frontend/src` completamente antes de generar contratos; localizar páginas, componentes, servicios, datos de productos, localStorage y flujos de usuarios.
- Conservar estilos, diseño, imágenes, navegación y funcionalidad visible.
- Sustituir almacenamiento de negocio en navegador por llamadas HTTP al gateway.
- Documentar contratos reales y diferencias necesarias con el frontend; mapear campos de DTO a los nombres usados en formularios.
- Sembrar productos y contenido inicial desde datos reales del frontend si corresponde, evitando inventar cantidades/precios.

## Flujo de implementación requerido
1. Inspeccionar árbol del repositorio, `frontend/src`, POM y archivos application.properties; informar estado real y brechas frente a requisitos. No asumir que los controladores ya existen porque Maven compiló.
2. Hacer un plan corto con endpoints y modelos confirmados por el frontend.
3. Implementar `ms-usuarios` completamente y probar registro/login/seguridad con MySQL.
4. Implementar `ms-carrito`, catálogo, carrito, órdenes y casos especiales reales.
5. Implementar `ms-admin` con comunicación HTTP autenticada.
6. Completar Gateway JWT/CORS/rutas.
7. Integrar React con las APIs, sin perder sus pantallas.
8. Completar Dockerfiles y Compose de toda la app.
9. Ejecutar `mvn clean verify` donde sea posible, tests unitarios/integración y `npm run build`; informar cualquier fallo y corregirlo.
10. Añadir `docs/arquitectura.md`, `docs/endpoints.md`, `docs/base-datos.md` y README con comandos de arranque; permitir demostrar el proyecto en DUOC.

## Reglas de trabajo
- Trabajar sobre archivos existentes, sin eliminar ni reorganizar masivamente el frontend sin necesidad.
- Antes de cambios grandes, comprobar `git status` y sugerir un commit de seguridad.
- No declarar 'terminado' sin pruebas ejecutadas. No inventar salidas de comandos ni respuestas de API.
- Comunicar en español de Chile, con explicaciones simples por etapas para que el estudiante comprenda y pueda defender el código.
- Pedir aprobación antes de migraciones destructivas, borrar volúmenes o reemplazar datos.
