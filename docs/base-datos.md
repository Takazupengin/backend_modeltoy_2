# Base de datos

MySQL 8.4, volumen `mysql_data` conservado. Nunca se ejecutó `down -v` ni se borraron tablas/volúmenes. Scripts aditivos en `backend/sql` crean las bases y usuarios de aplicación con permisos limitados a su base. Los usuarios requieren DDL para Flyway; no son root. `ms-admin` opera por HTTP y no necesita una tercera base.

| Base | Tablas | Datos |
|---|---|---|
| modeltoys_usuarios | usuarios | Correo único, nombre, BCrypt, rol y activo |
| modeltoys_usuarios | foro_publicaciones | Autor FK, kit, pregunta y timestamp UTC |
| modeltoys_carrito | productos | 16 productos y 4 preventas, precios y disponibilidad originales |
| modeltoys_carrito | carritos | Propietario único y mapa JSON producto→cantidad |
| modeltoys_carrito | ordenes | UUID, correo, timestamp e instantánea JSON con líneas, despacho y totales |

Carritos y detalles de órdenes se guardan como documentos JSON en columnas TEXT; las entidades JPA son Carrito y Orden, con records de líneas en DTO. Es una decisión simple para carritos pequeños: el registro completo se bloquea y guarda transaccionalmente. No hay FK desde las líneas JSON a productos, por lo que el servicio valida los identificadores; no existe borrado de productos. Consultas de historial usan un índice de correo. No hay relaciones JPA entre bases.

Flyway ejecuta migraciones versionadas: usuarios V1, carrito V1 (esquema) y V2 (datos originales React). Hibernate usa `ddl-auto=validate`. No editar una migración ya aplicada. Si un volumen contiene una versión distinta, revisar el historial antes de cualquier repair, baseline o cambio destructivo.

## Volumen existente

`/docker-entrypoint-initdb.d` solo corre automáticamente en un volumen nuevo. Si ya tenías MySQL, configura `.env` con su credencial root real; cambiarla en Compose no cambia la contraseña del volumen. Tras verificar el acceso, puedes crear aditivamente las bases faltantes:

```sh
docker compose up -d --wait mysql
docker compose exec -T mysql bash < backend/sql/01-init-databases.sh
docker compose exec -T mysql bash < backend/sql/02-init-carrito.sh
```

CREATE USER IF NOT EXISTS no cambia contraseñas previas. Los scripts aceptan nombres alfanuméricos/guion bajo y contraseñas alfanuméricas/guion bajo/guion medio para interpolación SQL segura. El generador usa hexadecimales. `.env` se crea con permisos 600 e ignorado por Git; no contiene datos de usuarios reales.

## Pruebas aisladas

```sh
python scripts/probar-usuarios-mysql.py
python scripts/probar-usuarios-mysql.py --servicio ms-carrito
```

Cada ejecución crea una base y usuario exclusivos con sufijo aleatorio y conserva sus datos para inspección. No pasan por las tablas de desarrollo. El script requiere MySQL iniciado, socket Docker accesible, Maven y el puerto local 3306. No apuntes `TEST_MYSQL_*` a bases reales: las suites crean y desactivan usuarios y registran órdenes. No hay limpieza destructiva automática.
