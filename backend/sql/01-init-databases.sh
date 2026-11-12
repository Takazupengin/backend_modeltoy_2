#!/bin/bash
set -eu
# Las credenciales generadas por preparar-entorno.py son hexadecimales.
# Se valida antes de interpolarlas en SQL.
[[ "$USUARIOS_DB_USER" =~ ^[a-zA-Z0-9_]+$ ]] || exit 1
[[ "$USUARIOS_DB_PASSWORD" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 1
mysql -uroot --password="$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS modeltoys_usuarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$USUARIOS_DB_USER'@'%' IDENTIFIED BY '$USUARIOS_DB_PASSWORD';
GRANT ALL PRIVILEGES ON modeltoys_usuarios.* TO '$USUARIOS_DB_USER'@'%';
SQL
