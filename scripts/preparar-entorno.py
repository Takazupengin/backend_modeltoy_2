#!/usr/bin/env python3
"""Genera secretos locales. Nunca reemplaza un .env existente ni imprime claves."""
import base64
import os
from pathlib import Path
import secrets
import subprocess
import tempfile

root = Path(__file__).resolve().parent.parent
target = root / '.env'
if target.exists():
    raise SystemExit('.env ya existe; se conserva sin cambios.')
with tempfile.TemporaryDirectory() as directory:
    private = Path(directory) / 'private.der'
    public = Path(directory) / 'public.der'
    subprocess.run(['openssl', 'genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:3072',
                    '-outform', 'DER', '-out', str(private)], check=True, stderr=subprocess.DEVNULL)
    # pkcs8 garantiza el formato que espera Java.
    pkcs8 = subprocess.check_output(['openssl', 'pkcs8', '-topk8', '-nocrypt', '-inform', 'DER',
                                     '-in', str(private), '-outform', 'DER'])
    subprocess.run(['openssl', 'pkey', '-inform', 'DER', '-in', str(private), '-pubout',
                    '-outform', 'DER', '-out', str(public)], check=True)
    values = {
        'MYSQL_ROOT_PASSWORD': secrets.token_hex(24),
        'USUARIOS_DB_USER': 'modeltoys_usuarios',
        'USUARIOS_DB_PASSWORD': secrets.token_hex(24),
        'CARRITO_DB_USER': 'modeltoys_carrito',
        'CARRITO_DB_PASSWORD': secrets.token_hex(24),
        'JWT_ISSUER': 'modeltoys',
        'JWT_PRIVATE_KEY': base64.b64encode(pkcs8).decode(),
        'JWT_PUBLIC_KEY': base64.b64encode(public.read_bytes()).decode(),
        'ADMIN_BOOTSTRAP_NAME': 'Administrador',
        'ADMIN_BOOTSTRAP_EMAIL': '',
        'ADMIN_BOOTSTRAP_PASSWORD': '',
    }
    fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, 'w') as stream:
        stream.write(''.join(f'{key}={value}\n' for key, value in values.items()))
print('.env creado con permisos 600. No lo subas a Git.')
