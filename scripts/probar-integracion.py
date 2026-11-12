#!/usr/bin/env python3
"""Prueba HTTP real a través del Gateway. No imprime credenciales ni tokens."""
import concurrent.futures
import json
from pathlib import Path
import secrets
import urllib.error
import urllib.request
import uuid

root = Path(__file__).resolve().parent.parent
base = 'http://localhost:8080'
def call(path, method='GET', body=None, token=None, guest=None, expected=200, origin=None):
    headers = {}
    if token: headers['Authorization'] = 'Bearer ' + token
    if guest: headers['X-Guest-Id'] = guest
    if origin: headers['Origin'] = origin
    if body is not None: headers['Content-Type'] = 'application/json'
    data = None if body is None else json.dumps(body).encode()
    request = urllib.request.Request(base + path, data=data, headers=headers, method=method)
    try:
        response = urllib.request.urlopen(request, timeout=20)
    except urllib.error.HTTPError as e:
        response = e
    assert response.status == expected, f'{method} {path}: esperado {expected}, recibido {response.status}'
    raw = response.read()
    return json.loads(raw) if raw else None

products = call('/api/productos')
assert len(products) == 16
assert len(call('/api/preventas')) == 4
correo = f'demo-{uuid.uuid4().hex}@example.cl'
password = secrets.token_hex(12)
auth = call('/api/auth/register', 'POST', {'nombre': 'Piloto Demo', 'correo': correo, 'password': password, 'rol': 'ADMIN'}, expected=201)
token = auth['accessToken']
assert auth['usuario']['rol'] == 'PILOTO'
call('/api/auth/login', 'POST', {'correo': correo.upper(), 'password': password})
assert call('/api/usuarios/me', token=token)['correo'] == correo
call('/api/usuarios/me', expected=401)
call('/api/admin/usuarios', token=token, expected=403)
post = call('/api/foro', 'POST', {'kit': 'RG Sazabi', 'pregunta': 'Consulta de demostración', 'autor': 'Admin'}, token=token, expected=201)
assert post['autor'] == 'Piloto Demo'
call('/api/carrito/items/RX-78-2', 'POST', {'cantidad': 1, 'precio': 1}, token=token)
price = next(p['precio'] for p in products if p['id'] == 'RX-78-2')
assert call('/api/carrito', token=token)['subtotal'] == price
assert not call('/api/carrito', guest=str(uuid.uuid4()))['items']
checkout = {'nombre': 'Piloto Demo', 'rut': '12.345.678-5', 'direccion': 'Calle Demo 123', 'ciudad': 'Viña del Mar', 'metodoPago': 'webpay', 'cuotas': 1}
order = call('/api/ordenes', 'POST', checkout, token=token, expected=201)
assert order['total'] == price + (0 if price >= 50000 else 4990)
assert order['estado'] == 'Pendiente de pago'
call('/api/ordenes', 'POST', checkout, token=token, expected=409)
assert len(call('/api/ordenes', token=token)) == 1
# Dos checkouts simultáneos: el lock permite una sola orden.
call('/api/carrito/items/Wing-Zero-EW', 'POST', {'cantidad': 1}, token=token)
def checkout_status(_):
    req = urllib.request.Request(base + '/api/ordenes', data=json.dumps(checkout).encode(),
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method='POST')
    try:
        return urllib.request.urlopen(req, timeout=20).status
    except urllib.error.HTTPError as e:
        return e.code
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
    assert sorted(executor.map(checkout_status, range(2))) == [201, 409]
# CORS: origen permitido y origen ajeno.
req = urllib.request.Request(base + '/api/productos', method='OPTIONS', headers={
    'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'GET'})
with urllib.request.urlopen(req, timeout=20) as response:
    assert response.headers.get('Access-Control-Allow-Origin') == 'http://localhost:5173'
req = urllib.request.Request(base + '/api/productos', method='OPTIONS', headers={
    'Origin': 'https://ajeno.example', 'Access-Control-Request-Method': 'GET'})
try:
    urllib.request.urlopen(req, timeout=20)
    raise AssertionError('Se aceptó un origen ajeno')
except urllib.error.HTTPError as e:
    assert e.code == 403
# Preventa como invitado y aislamiento por identificador opaco.
guest = str(uuid.uuid4())
preorder = call('/api/preventas')[0]
cart = call('/api/carrito/items/' + preorder['id'] + '-pie', 'POST', {'cantidad': 1}, guest=guest)
assert cart['subtotal'] == preorder['precioPie']
call('/api/carrito', 'DELETE', guest=guest, expected=204)
# Administrador provisionado por entorno: comunicación ms-admin -> servicios reales.
values = dict(line.split('=', 1) for line in (root / '.env').read_text().splitlines() if '=' in line and not line.startswith('#'))
if values.get('ADMIN_BOOTSTRAP_EMAIL') and values.get('ADMIN_BOOTSTRAP_PASSWORD'):
    admin = call('/api/auth/login', 'POST', {'correo': values['ADMIN_BOOTSTRAP_EMAIL'], 'password': values['ADMIN_BOOTSTRAP_PASSWORD']})['accessToken']
    assert call('/api/admin/usuarios', token=admin)
    assert call('/api/admin/ordenes', token=admin)
    assert len(call('/api/admin/productos', token=admin)) == 16
    original = next(p for p in products if p['id'] == 'RX-78-2')
    updated = call('/api/admin/productos/RX-78-2', 'PUT', {'precio': original['precio'], 'status': original['status']}, token=admin)
    assert updated['precio'] == original['precio']
    call('/api/admin/dashboard', token=admin)
    call('/api/admin/usuarios/' + str(auth['usuario']['id']), 'DELETE', token=admin, expected=204)
    call('/api/usuarios/me', token=token, expected=401)
# Frontend y proxy HTTP.
assert urllib.request.urlopen('http://localhost:8088', timeout=20).status == 200
assert len(json.load(urllib.request.urlopen('http://localhost:8088/api/productos', timeout=20))) == 16
print('Integración OK: catálogo, registro/login, perfil, permisos, foro, carrito, checkout, preventas, administración y proxy React.')
print('Se conservan el usuario, publicación y orden de demostración para inspección.')
