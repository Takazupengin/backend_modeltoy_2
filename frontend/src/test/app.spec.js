import { describe, it, expect } from 'vitest';
import { 
  productosCatalog, 
  formatearPrecioCLP, 
  obtenerProductoPorId, 
  filtrarPorEscala, 
  calcularSubtotal 
} from '../data/productos.js';

describe('ModelToys - Suite de Pruebas Unitarias EP2 (Jasmine & Karma)', () => {

  // ==========================================
  // BLOQUE 1: PRUEBAS DEL CATÁLOGO Y PRODUCTOS
  // ==========================================

  // Test 1: Verificar que el catálogo cargue los 10 productos base
  it('Test 1: El catálogo debe contener exactamente 10 productos registrados', () => {
    expect(productosCatalog.length).toBe(10);
  });

  // Test 2: Buscar producto existente por ID
  it('Test 2: Debe encontrar correctamente el kit RX-78-2 por su ID', () => {
    const kit = obtenerProductoPorId('RX-78-2');
    expect(kit).not.toBeNull();
    expect(kit.nombre).toContain('RX-78-2 Gundam');
    expect(kit.precio).toBe(42990);
  });

  // Test 3: Manejo de producto inexistente
  it('Test 3: Debe retornar null al buscar un ID que no existe en el catálogo', () => {
    const inexistente = obtenerProductoPorId('GOKU-SSJ');
    expect(inexistente).toBeNull();
  });

  // Test 4: Filtrado por escala Real Grade (RG)
  it('Test 4: Debe filtrar correctamente los kits pertenecientes a la escala RG', () => {
    const kitsRG = filtrarPorEscala('RG');
    expect(kitsRG.length).toBeGreaterThan(0);
    const todosSonRG = kitsRG.every(k => k.scale === 'RG');
    expect(todosSonRG).toBe(true);
  });

  // Test 5: Filtro "all" debe retornar el catálogo completo
  it('Test 5: El filtro "all" debe devolver los 10 productos sin omitir ninguno', () => {
    const todos = filtrarPorEscala('all');
    expect(todos.length).toBe(10);
  });

  // ==========================================
  // BLOQUE 2: LÓGICA FINANCIERA Y CARRITO
  // ==========================================

  // Test 6: Formateo de precio a moneda CLP
  it('Test 6: Debe formatear un número al formato oficial de moneda chilena CLP', () => {
    const formateado = formatearPrecioCLP(42990);
    // Debe incluir el signo $ y el separador de miles con punto
    expect(formateado).toContain('42.990');
    expect(formateado).toContain('$');
  });

  // Test 7: Cálculo de subtotal unitario
  it('Test 7: Debe calcular el subtotal multiplicando precio por cantidad', () => {
    const subtotal = calcularSubtotal(28990, 3);
    expect(subtotal).toBe(86970);
  });

  // Test 8: Validación de subtotal con cantidades negativas o nulas
  it('Test 8: Debe retornar 0 si la cantidad o precio son inválidos o negativos', () => {
    expect(calcularSubtotal(42990, -1)).toBe(0);
    expect(calcularSubtotal(0, 5)).toBe(0);
  });

  // ==========================================
  // BLOQUE 3: VALIDACIÓN DE FORMULARIO DE ACCESO (LOGIN)
  // ==========================================

  // Test 9: Validación de formato de correo electrónico
  it('Test 9: Debe validar que el correo contenga estructura válida con @ y dominio', () => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(regexEmail.test('piloto@gundam.cl')).toBe(true);
    expect(regexEmail.test('correo-invalido-sin-arroba')).toBe(false);
    expect(regexEmail.test('')).toBe(false);
  });

  // Test 10: Validación de longitud mínima de contraseña
  it('Test 10: Debe rechazar contraseñas con longitud menor a 6 caracteres', () => {
    const esPasswordValido = (pass) => Boolean(pass && pass.length >= 6);
    expect(esPasswordValido('12345')).toBe(false);
    expect(esPasswordValido('')).toBe(false);
    expect(esPasswordValido('gunpla2026')).toBe(true);
  });

});