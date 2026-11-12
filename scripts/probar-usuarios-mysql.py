#!/usr/bin/env python3
"""Ejecuta la suite HTTP con MySQL local. Crea una base aislada y no borra datos."""
import argparse
import os
from pathlib import Path
import secrets
import subprocess

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--servicio', choices=['ms-usuarios', 'ms-carrito'], default='ms-usuarios')
service = parser.parse_args().servicio
suffix = secrets.token_hex(4)
database = f'modeltoys_pruebas_{suffix}'
user = f'mt_test_{suffix}'
password = secrets.token_hex(24)
sql = f"""CREATE DATABASE {database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '{user}'@'%' IDENTIFIED BY '{password}';
GRANT ALL PRIVILEGES ON {database}.* TO '{user}'@'%';
"""
subprocess.run(['docker', 'compose', 'exec', '-T', 'mysql', 'sh', '-c',
                'mysql -uroot --password="$MYSQL_ROOT_PASSWORD"'],
               cwd=root, input=sql, text=True, check=True)
environment = os.environ.copy()
environment.update({
    'TEST_MYSQL_URL': f'jdbc:mysql://localhost:3306/{database}?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC',
    'TEST_MYSQL_USER': user,
    'TEST_MYSQL_PASSWORD': password,
})
print(f'Base aislada: {database}. Se conserva al terminar.', flush=True)
result = subprocess.run(['mvn', '-pl', service, 'clean', 'verify'], cwd=root / 'backend', env=environment)
raise SystemExit(result.returncode)
