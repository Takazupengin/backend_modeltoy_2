const base = import.meta.env.VITE_API_URL || '';
let token = null;
export const setAccessToken = (value) => { token = value || null; };
function guestId() {
  let id = sessionStorage.getItem('modeltoys_guest_id');
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('modeltoys_guest_id', id); }
  return id;
}
export async function request(path, { method = 'GET', body, guest = false } = {}) {
  const headers = { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (guest) headers['X-Guest-Id'] = guestId();
  const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || (response.status === 401 ? 'Inicia sesión nuevamente.' : `No se pudo completar la solicitud (${response.status}).`));
  }
  if (response.status === 204) return null;
  return response.json();
}
export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  products: () => request('/api/productos'), preorders: () => request('/api/preventas'),
  cart: () => request('/api/carrito', { guest: true }),
  add: (id, cantidad = 1) => request(`/api/carrito/items/${encodeURIComponent(id)}`, { method: 'POST', body: { cantidad }, guest: true }),
  quantity: (id, cantidad) => request(`/api/carrito/items/${encodeURIComponent(id)}`, { method: 'PUT', body: { cantidad }, guest: true }),
  remove: (id) => request(`/api/carrito/items/${encodeURIComponent(id)}`, { method: 'DELETE', guest: true }),
  clear: () => request('/api/carrito', { method: 'DELETE', guest: true }),
  checkout: (body) => request('/api/ordenes', { method: 'POST', body, guest: true }),
  orders: () => request('/api/ordenes'), forum: () => request('/api/foro'),
  post: (body) => request('/api/foro', { method: 'POST', body }),
  users: () => request('/api/admin/usuarios'), adminOrders: () => request('/api/admin/ordenes'),
  deleteUser: (id) => request(`/api/admin/usuarios/${id}`, { method: 'DELETE' }),
  updateProduct: (id, body) => request(`/api/admin/productos/${encodeURIComponent(id)}`, { method: 'PUT', body }),
};
