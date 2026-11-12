import { useState } from 'react';
import { formatearPrecioCLP } from '../data/productos';

// VALIDACIONES Y FORMATEO
function validarRutChileno(rutCompleto) {
  if (!rutCompleto) return false;
  const limpio = rutCompleto.replace(/\./g, '').trim().toUpperCase();
  return /^[0-9]{7,8}-[0-9K]$/.test(limpio);
}

function formatearRutInput(valor) {
  let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length > 9) limpio = limpio.slice(0, 9);
  if (limpio.length <= 1) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let cuerpoFormateado = '';
  let contador = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo.charAt(i) + cuerpoFormateado;
    contador++;
    if (contador === 3 && i > 0) {
      cuerpoFormateado = '.' + cuerpoFormateado;
      contador = 0;
    }
  }

  return `${cuerpoFormateado}-${dv}`;
}

export function Carrito({ items = [], onUpdateCart, onNavigate, usuarioLogueado, onGuardarOrden, productos = [] }) {
  const itemsEnCarro = items;
  // ESTADOS DEL MODAL Y PAGO
  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoPago, setMetodoPago] = useState('webpay');
  const [cuotas, setCuotas] = useState('1');
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [codigoOrden, setCodigoOrden] = useState('');
  const [errorCheckout, setErrorCheckout] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [cambiando, setCambiando] = useState(false);

  // FORMULARIO DE ENVÍO
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: usuarioLogueado ? usuarioLogueado.nombre : '',
    rut: '',
    direccion: '',
    ciudad: 'Viña del Mar'
  });

  const [errores, setErrores] = useState({
    nombre: '',
    rut: ''
  });

  // OPERACIONES DEL CARRITO
  const actualizarCarrito = async (lista) => {
    if (cambiando) return;
    setCambiando(true);
    try { await onUpdateCart(lista); } finally { setCambiando(false); }
  };

  const incrementar = (id) => {
    const actualizados = itemsEnCarro.map((item) =>
      item.id === id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
    );
    actualizarCarrito(actualizados);
  };

  const decrementar = (id) => {
    const itemActual = itemsEnCarro.find((item) => item.id === id);
    if (!itemActual) return;

    if (itemActual.cantidad <= 1) {
      const filtrados = itemsEnCarro.filter((item) => item.id !== id);
      actualizarCarrito(filtrados);
    } else {
      const actualizados = itemsEnCarro.map((item) =>
        item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
      );
      actualizarCarrito(actualizados);
    }
  };

  const eliminar = (id) => {
    const filtrados = itemsEnCarro.filter((item) => item.id !== id);
    actualizarCarrito(filtrados);
  };

  const vaciar = () => {
    if (window.confirm('¿Seguro que deseas vaciar todo el carro de compras?')) {
      actualizarCarrito([]);
    }
  };

  const agregarRecomendado = (producto) => {
    const existe = itemsEnCarro.find((item) => item.id === producto.id);
    if (existe) {
      const actualizados = itemsEnCarro.map((item) =>
        item.id === producto.id ? { ...item, cantidad: (item.cantidad || 1) + 1 } : item
      );
      actualizarCarrito(actualizados);
    } else {
      actualizarCarrito([
        ...itemsEnCarro,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagenes ? producto.imagenes[0] : producto.imagen,
          cantidad: 1,
          grade: producto.grade
        }
      ]);
    }
  };

  // CÁLCULOS
  const total = itemsEnCarro.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
  const envioGratis = total >= 50000;

  // CONTROLADORES DE INPUTS
  const handleNombreChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(val)) {
      setDatosEnvio((prev) => ({ ...prev, nombre: val }));
      setErrores((prev) => ({ ...prev, nombre: '' }));
    }
  };

  const handleRutChange = (e) => {
    const formateado = formatearRutInput(e.target.value);
    setDatosEnvio((prev) => ({ ...prev, rut: formateado }));
    setErrores((prev) => ({ ...prev, rut: '' }));
  };

  // PROCESAMIENTO DE PAGO
  const handleProcesarPago = async (e) => {
    e.preventDefault();
    let hayError = false;
    const nuevosErrores = { nombre: '', rut: '' };

    if (datosEnvio.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'Ingresa un nombre válido (mínimo 3 letras).';
      hayError = true;
    }

    if (!validarRutChileno(datosEnvio.rut)) {
      nuevosErrores.rut = 'Ingresa un RUT con formato válido (ej: 12.345.678-9).';
      hayError = true;
    }

    if (hayError) {
      setErrores(nuevosErrores);
      return;
    }

    if (procesando) return;
    setProcesando(true); setErrorCheckout('');
    try {
      const orden = await onGuardarOrden({ ...datosEnvio, metodoPago, cuotas: metodoPago === 'credito' ? Number(cuotas) : 1 });
      setCodigoOrden(orden.id); setPagoExitoso(true);
    } catch (error) { setErrorCheckout(error.message); }
    finally { setProcesando(false); }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPagoExitoso(false);
    setErrores({ nombre: '', rut: '' });
    if (pagoExitoso && onNavigate) {
      onNavigate('catalogo');
    }
  };

  // RECOMENDACIONES
  const productosRecomendados = productos
    .filter((p) => !itemsEnCarro.some((item) => item.id === p.id))
    .slice(0, 4);

  const listaFinalRecomendados = productosRecomendados.length === 4
    ? productosRecomendados
    : productos.slice(0, 4);

  // RENDER
  return (
    <main style={{ maxWidth: '1360px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
      
      {errorCheckout && <div role="alert" className="alert alert-danger">{errorCheckout}</div>}
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary">
        <h2 className="fw-bold m-0 text-white" style={{ fontSize: '1.85rem' }}>
          Resumen de tu Carro de Compras
        </h2>
        {itemsEnCarro.length > 0 && (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm fw-semibold"
            style={{ borderRadius: '6px' }}
            onClick={vaciar}
          >
            Vaciar Carrito
          </button>
        )}
      </div>

      {/* ESTADO VACÍO O TABLA */}
      {itemsEnCarro.length === 0 && !pagoExitoso ? (
        <div 
          className="p-5 text-center rounded-3 bg-black mb-5"
          style={{ border: '1.5px solid #00d2ff', boxShadow: '0 0 15px rgba(0, 210, 255, 0.15)' }}
        >
          <div className="fs-1 mb-3">🛒</div>
          <h4 className="text-white fw-bold mb-2">Tu carro está vacío</h4>
          <p className="text-light mb-4" style={{ opacity: 0.8 }}>No tienes ningún Mobile Suit ni accesorio seleccionado.</p>
          <button
            type="button"
            className="btn px-4 py-2 fw-bold text-black"
            style={{ backgroundColor: '#00d2ff', borderRadius: '6px' }}
            onClick={() => onNavigate && onNavigate('catalogo')}
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div 
          className="bg-black rounded-3 p-3 p-md-4 mb-5"
          style={{ border: '1.5px solid #00d2ff', boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)' }}
        >
          {/* TABLA DE PRODUCTOS */}
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
              <thead>
                <tr className="border-bottom border-secondary" style={{ color: '#00e5ff', fontSize: '0.95rem' }}>
                  <th style={{ width: '45%' }}>Producto</th>
                  <th className="text-center" style={{ width: '15%' }}>Cantidad</th>
                  <th className="text-end" style={{ width: '15%' }}>Precio Unit.</th>
                  <th className="text-end" style={{ width: '15%' }}>Subtotal</th>
                  <th className="text-center" style={{ width: '10%' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {itemsEnCarro.map((item) => (
                  <tr key={item.id} className="border-bottom border-secondary border-opacity-50">
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="rounded p-1 bg-dark d-flex align-items-center justify-content-center"
                          style={{ width: '60px', height: '60px', border: '1px solid #1c2b3a', flexShrink: 0 }}
                        >
                          <img
                            src={item.imagen || '/img/LOGO.png'}
                            alt={item.nombre}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = '/img/LOGO.png'; }}
                          />
                        </div>
                        <span className="fw-semibold text-light" style={{ fontSize: '0.95rem' }}>
                          {item.nombre}
                        </span>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="d-inline-flex align-items-center border border-secondary rounded">
                        <button
                          type="button"
                          className="btn btn-sm btn-dark px-2 py-0"
                          style={{ color: '#00e5ff' }}
                          disabled={cambiando || procesando}
                          onClick={() => decrementar(item.id)}
                          title="Restar 1 (elimina si queda en 0)"
                        >
                          -
                        </button>
                        <span className="px-2 small fw-bold text-white">{item.cantidad}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-dark px-2 py-0"
                          style={{ color: '#00e5ff' }}
                          disabled={cambiando || procesando}
                          onClick={() => incrementar(item.id)}
                          title="Sumar 1"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="text-end text-light">
                      {formatearPrecioCLP(item.precio)}
                    </td>

                    <td className="text-end fw-bold" style={{ color: '#00e5ff' }}>
                      {formatearPrecioCLP(item.precio * item.cantidad)}
                    </td>

                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
                        onClick={() => eliminar(item.id)}
                      >
                        ✕ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL Y ACCIONES */}
          <div className="mt-4 pt-3 border-top border-secondary d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <span className="text-light me-3" style={{ fontSize: '0.95rem' }}>
                Despacho:{' '}
                <strong style={{ color: envioGratis ? '#00e5ff' : '#ffffff' }}>
                  {envioGratis ? 'Gratis (Sobre $50.000)' : '$4.990'}
                </strong>
              </span>
            </div>

            <div className="d-flex align-items-center gap-4">
              <div className="text-end">
                <span className="text-light small d-block" style={{ opacity: 0.85 }}>Total a pagar:</span>
                <span className="fs-3 fw-bold text-white">
                  {formatearPrecioCLP(total)}
                </span>
              </div>

              <button
                type="button"
                className="btn fw-bold px-4 py-2"
                style={{
                  backgroundColor: '#00d2ff',
                  color: '#000000',
                  boxShadow: '0 0 15px rgba(0, 210, 255, 0.4)',
                  borderRadius: '6px',
                  letterSpacing: '0.5px'
                }}
                onClick={() => setMostrarModal(true)}
              >
                Proceder al Pago →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN RECOMENDACIONES */}
      <section className="mt-5 pt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary">
          <div>
            <h3 className="fw-bold m-0 text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.5px' }}>
              ⚡ Completa tu Hangar: Recomendados para ti
            </h3>
            <p className="m-0 mt-1" style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              Agrega herramientas esenciales, bases de soporte o kits complementarios con un solo clic.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none fw-bold"
            style={{ color: '#00e5ff', fontSize: '1rem' }}
            onClick={() => onNavigate && onNavigate('catalogo')}
          >
            Ver Todo el Catálogo →
          </button>
        </div>

        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4">
          {listaFinalRecomendados.map((rec) => (
            <div key={rec.id} className="col">
              <div 
                className="h-100 rounded-3 p-3 p-md-4 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: '#070c12',
                  border: '1.5px solid #00d2ff',
                  boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 210, 255, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 210, 255, 0.15)';
                }}
              >
                <div 
                  className="rounded-2 p-3 mb-3 bg-black d-flex align-items-center justify-content-center position-relative overflow-hidden"
                  style={{ height: '220px', border: '1px solid #1c2b3a' }}
                >
                  <img
                    src={rec.imagenes ? rec.imagenes[0] : rec.imagen}
                    alt={rec.nombre}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = '/img/LOGO.png'; }}
                  />
                  <span 
                    className="position-absolute top-0 start-0 m-2 badge fw-bold"
                    style={{ 
                      backgroundColor: '#0072ff', 
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.6rem',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {rec.grade || rec.scale}
                  </span>
                </div>

                <div className="mb-3">
                  <h5 
                    className="fw-bold text-white mb-2" 
                    title={rec.nombre}
                    style={{ fontSize: '1.1rem', lineHeight: '1.3' }}
                  >
                    {rec.nombre}
                  </h5>
                  <div className="fw-black" style={{ color: '#00e5ff', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                    {formatearPrecioCLP(rec.precio)}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn w-100 fw-bold py-2"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1.5px solid #00d2ff',
                    color: '#00e5ff',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    boxShadow: '0 0 10px rgba(0, 210, 255, 0.15)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#00d2ff';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 210, 255, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#00e5ff';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 210, 255, 0.15)';
                  }}
                  onClick={() => agregarRecomendado(rec)}
                >
                  + Añadir al Carro
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DE PAGO */}
      {mostrarModal && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: 'rgba(5, 7, 12, 0.85)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div 
            className="rounded-3 p-4 bg-black text-light position-relative"
            style={{
              maxWidth: '520px',
              width: '100%',
              border: '2px solid #00d2ff',
              boxShadow: '0 0 25px rgba(0, 210, 255, 0.35)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <button
              type="button"
              className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
              onClick={cerrarModal}
              aria-label="Close"
            />

            {!pagoExitoso ? (
              <>
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-1" style={{ color: '#00e5ff' }}>
                    Pasarela de Pago Segura
                  </h3>
                  <span className="small text-light" style={{ opacity: 0.85 }}>ModelToys • Encriptación SSL 256-bit</span>
                </div>

                <form onSubmit={handleProcesarPago}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-light">Selecciona Medio de Pago:</label>
                    <div className="d-flex gap-2">
                      {[
                        { id: 'webpay', label: '💳 Webpay Plus' },
                        { id: 'transferencia', label: '🏦 Transferencia' },
                        { id: 'credito', label: '💎 Tarjeta Crédito' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`btn btn-sm flex-fill fw-semibold ${
                            metodoPago === m.id ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'
                          }`}
                          onClick={() => setMetodoPago(m.id)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {metodoPago === 'credito' && (
                    <div className="mb-3 p-2 rounded bg-dark border border-secondary">
                      <label className="form-label small fw-bold mb-1" style={{ color: '#00e5ff' }}>
                        Cantidad de Cuotas:
                      </label>
                      <select
                        className="form-select form-select-sm bg-black text-light border-secondary"
                        value={cuotas}
                        onChange={(e) => setCuotas(e.target.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="1">1 cuota sin interés ({formatearPrecioCLP(total)})</option>
                        <option value="3">3 cuotas sin interés ({formatearPrecioCLP(Math.round(total / 3))}/mes)</option>
                        <option value="6">6 cuotas sin interés ({formatearPrecioCLP(Math.round(total / 6))}/mes)</option>
                        <option value="12">12 cuotas fijas ({formatearPrecioCLP(Math.round(total / 12))}/mes)</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small mb-1 text-light">Nombre Completo:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Erik Carrasco"
                      className={`form-control form-control-sm bg-dark text-light ${
                        errores.nombre ? 'border-danger' : 'border-secondary'
                      }`}
                      value={datosEnvio.nombre}
                      onChange={handleNombreChange}
                    />
                    {errores.nombre && (
                      <span className="text-danger small" style={{ fontSize: '0.75rem' }}>
                        {errores.nombre}
                      </span>
                    )}
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small mb-1 text-light">RUT:</label>
                      <input
                        type="text"
                        required
                        placeholder="12.345.678-9"
                        className={`form-control form-control-sm bg-dark text-light ${
                          errores.rut ? 'border-danger' : 'border-secondary'
                        }`}
                        value={datosEnvio.rut}
                        onChange={handleRutChange}
                      />
                      {errores.rut && (
                        <span className="text-danger small" style={{ fontSize: '0.75rem' }}>
                          {errores.rut}
                        </span>
                      )}
                    </div>
                    <div className="col-6">
                      <label className="form-label small mb-1 text-light">Ciudad:</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                        value={datosEnvio.ciudad}
                        onChange={(e) => setDatosEnvio({ ...datosEnvio, ciudad: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small mb-1 text-light">Dirección de Despacho:</label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, número, depto o sucursal Starken"
                      className="form-control form-control-sm bg-dark text-light border-secondary"
                      value={datosEnvio.direccion}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                    />
                  </div>

                  <div className="p-3 rounded-2 bg-dark mb-4 border border-secondary">
                    <div className="d-flex justify-content-between small text-light mb-1" style={{ opacity: 0.85 }}>
                      <span>Total Productos:</span>
                      <span>{formatearPrecioCLP(total)}</span>
                    </div>
                    <div className="d-flex justify-content-between small text-light mb-2" style={{ opacity: 0.85 }}>
                      <span>Costo Envío:</span>
                      <span>{envioGratis ? 'GRATIS' : '$4.990'}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold text-white fs-5 border-top border-secondary pt-2">
                      <span>Total Final:</span>
                      <span style={{ color: '#00e5ff' }}>{formatearPrecioCLP(total)}</span>
                    </div>
                    {metodoPago === 'credito' && Number(cuotas) > 1 && (
                      <div className="text-end small text-info mt-1">
                        Pagando en {cuotas} cuotas de {formatearPrecioCLP(Math.round(total / Number(cuotas)))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit" disabled={procesando || cambiando}
                    className="btn w-100 fw-bold py-2 text-black"
                    style={{ backgroundColor: '#00d2ff', borderRadius: '6px' }}
                  >
                    Registrar orden con {metodoPago === 'webpay' ? 'Webpay' : metodoPago === 'transferencia' ? 'Transferencia' : `Crédito (${cuotas} cuota${cuotas > 1 ? 's' : ''})`}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-3">
                <div className="fs-1 mb-2">✅</div>
                <h3 className="fw-bold text-white mb-2">Orden registrada: pendiente de pago</h3>
                <p className="text-light small mb-3" style={{ opacity: 0.85 }}>
                  No se ha realizado un cobro. La orden quedó pendiente de pago.
                </p>

                <div className="p-3 bg-dark rounded border border-info mb-4 text-start small">
                  <p className="m-0 text-info fw-bold">Número de Orden: <span className="text-white">{codigoOrden}</span></p>
                  <p className="m-0 text-light" style={{ opacity: 0.9 }}>Destinatario: <span className="text-white">{datosEnvio.nombre}</span></p>
                  <p className="m-0 text-light" style={{ opacity: 0.9 }}>RUT: <span className="text-white">{datosEnvio.rut}</span></p>
                  <p className="m-0 text-light" style={{ opacity: 0.9 }}>Dirección: <span className="text-white">{datosEnvio.direccion}, {datosEnvio.ciudad}</span></p>
                  <p className="m-0 text-light" style={{ opacity: 0.9 }}>
                    Medio de Pago:{' '}
                    <span className="text-white text-capitalize">
                      {metodoPago === 'credito' ? `Tarjeta Crédito (${cuotas} cuotas)` : metodoPago}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-info w-100 fw-bold"
                  onClick={cerrarModal}
                >
                  Volver al Catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

export default Carrito;