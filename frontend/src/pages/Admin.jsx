import { useState } from 'react';
import { formatearPrecioCLP } from '../data/productos';

export function Admin({
  usuarios = [],
  ordenes = [],
  productos = [],
  onEliminarUsuario,
  onActualizarProducto,
  onCerrarSesion,
  onNavigate
}) {
  // ESTADOS
  const [error, setError] = useState('');
  const [tabAdmin, setTabAdmin] = useState('inventario');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [preciosEditados, setPreciosEditados] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');

  // CALCULOS
  const totalRecaudado = ordenes.reduce((acc, o) => acc + (o.total || 0), 0);

  // GESTION DE PRECIOS
  const handlePrecioChange = (id, nuevoValor) => {
    setPreciosEditados((prev) => ({
      ...prev,
      [id]: nuevoValor
    }));
  };

  const guardarPrecio = async (producto) => {
    const valor = preciosEditados[producto.id] !== undefined 
      ? preciosEditados[producto.id] 
      : producto.precio;
      
    const nuevoPrecio = parseInt(valor, 10);
    if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
      alert('Ingresa un precio numérico válido mayor a 0.');
      return;
    }

    if (onActualizarProducto) {
      try { await onActualizarProducto(producto.id, { precio: nuevoPrecio }); }
      catch (e) { setError(e.message); return; }
    }

    setMensajeExito(`¡Precio de "${producto.nombre}" actualizado a ${formatearPrecioCLP(nuevoPrecio)}!`);
    setTimeout(() => setMensajeExito(''), 3500);
  };

  // GESTION DE STOCK
  const toggleStock = async (producto) => {
    const estadoActual = producto.status || 'in-stock';
    const nuevoStatus = estadoActual === 'in-stock' ? 'out-of-stock' : 'in-stock';

    if (onActualizarProducto) {
      try { await onActualizarProducto(producto.id, { status: nuevoStatus }); } catch (e) { setError(e.message); }
    }
  };

  // GESTION DE USUARIOS
  const handleBorrarUsuario = async (id, correo, nombre) => {
    if (window.confirm(`¿Seguro que deseas dar de baja al piloto ${nombre} (${correo})?`)) {
      if (onEliminarUsuario) { try { await onEliminarUsuario(id); } catch (e) { setError(e.message); } }
    }
  };

  // EXPORTACION CSV
  const exportarCSV = () => {
    const encabezados = ['ID', 'Nombre', 'Escala', 'Precio CLP', 'Estado'];
    const filas = productos.map((p, idx) => [
      p.id || `PROD-${idx + 1}`,
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.grade || p.scale || 'N/A',
      p.precio,
      (p.status || 'in-stock') === 'in-stock' ? 'En Stock' : 'Agotado'
    ]);

    const contenido = [encabezados.join(';'), ...filas.map((f) => f.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Inventario_ModelToys_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // FILTRO DE PRODUCTOS
  const productosFiltrados = productos.filter((p, idx) => {
    const idVal = String(p.id || `PROD-${idx + 1}`).toLowerCase();
    const nombreVal = String(p.nombre || '').toLowerCase();
    const gradeVal = String(p.grade || p.scale || '').toLowerCase();
    const q = busquedaProducto.toLowerCase();
    return idVal.includes(q) || nombreVal.includes(q) || gradeVal.includes(q);
  });

  // RENDER
  return (
    <main style={{ maxWidth: '1440px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
      
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      {/* ENCABEZADO */}
      <div 
        className="p-4 mb-4 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{
          backgroundColor: '#070c12',
          border: '1.5px solid #ff2a5f',
          boxShadow: '0 0 16px rgba(255, 42, 95, 0.2)'
        }}
      >
        <div>
          <span className="badge bg-danger mb-2 px-2 py-1 text-uppercase fw-bold" style={{ letterSpacing: '1px' }}>
            CONTROL CENTRAL • COMANDANTE
          </span>
          <h2 className="fw-bold m-0 text-white">
            Panel de Administración ModelToys
          </h2>
          <span className="small text-light" style={{ opacity: 0.85 }}>Modo Gestión & Inventario</span>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-info fw-bold"
            onClick={() => onNavigate && onNavigate('catalogo')}
          >
            Ver Catálogo
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger fw-bold"
            onClick={onCerrarSesion}
          >
            Cerrar Sesión Admin
          </button>
        </div>
      </div>

      {/* NOTIFICACION */}
      {mensajeExito && (
        <div 
          className="alert text-center fw-bold small mb-4 shadow"
          style={{ backgroundColor: '#00d2ff', color: '#000000', border: 'none', borderRadius: '6px' }}
        >
          ⚡ {mensajeExito}
        </div>
      )}

      {/* METRICAS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 rounded bg-black border border-secondary">
            <span className="text-light small d-block mb-1">Pilotos Registrados</span>
            <h3 className="fw-bold m-0 text-white">{usuarios.length}</h3>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 rounded bg-black border border-secondary">
            <span className="text-light small d-block mb-1">Total Compras Realizadas</span>
            <h3 className="fw-bold m-0" style={{ color: '#00e5ff' }}>{ordenes.length}</h3>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="p-3 rounded bg-black border border-secondary">
            <span className="text-light small d-block mb-1">Monto de órdenes pendientes</span>
            <h3 className="fw-bold m-0 text-success">{formatearPrecioCLP(totalRecaudado)}</h3>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tabAdmin === 'inventario' ? 'btn-info text-dark shadow' : 'btn-dark text-light'}`}
          onClick={() => setTabAdmin('inventario')}
        >
          📊 Planilla Excel de Productos ({productos.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tabAdmin === 'resumen' ? 'btn-info text-dark shadow' : 'btn-dark text-light'}`}
          onClick={() => setTabAdmin('resumen')}
        >
          👥 Gestión de Pilotos & Compras
        </button>
      </div>

      {/* PESTAÑA: INVENTARIO */}
      {tabAdmin === 'inventario' && (
        <div 
          className="p-3 p-md-4 rounded-3 bg-black"
          style={{ border: '1.5px solid #00d2ff', boxShadow: '0 0 15px rgba(0, 210, 255, 0.15)' }}
        >
          {/* BARRA DE HERRAMIENTAS */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <div>
              <h4 className="fw-bold m-0" style={{ color: '#00e5ff', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                Inventario General de Kits & Precios
              </h4>
              <p className="m-0 mt-1 fw-medium" style={{ color: '#cbd5e1', fontSize: '0.88rem' }}>
                Edita los precios directamente en la columna y presiona Guardar. Haz clic en el estado para alternar Stock.
              </p>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                placeholder="Buscar kit, ID o escala..."
                className="form-control form-control-sm bg-dark text-white border-secondary"
                style={{ width: '230px', fontSize: '0.85rem' }}
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm btn-outline-success fw-bold d-flex align-items-center gap-1"
                onClick={exportarCSV}
                title="Descargar archivo .CSV para abrir en Excel"
              >
                📥 Exportar Excel (.csv)
              </button>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS */}
          <div className="table-responsive">
            <table className="table table-dark table-hover table-bordered align-middle mb-0" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  <th style={{ width: '60px' }} className="text-center text-info">Vista</th>
                  <th style={{ width: '130px' }} className="text-info">ID</th>
                  <th className="text-info">Nombre del Producto</th>
                  <th style={{ width: '140px' }} className="text-info text-center">Escala / Grado</th>
                  <th style={{ width: '140px' }} className="text-info text-center">Estado</th>
                  <th style={{ width: '140px' }} className="text-info text-end">Precio Actual</th>
                  <th style={{ width: '170px' }} className="text-info">Nuevo Precio (CLP)</th>
                  <th style={{ width: '100px' }} className="text-info text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((item, idx) => {
                  const valorEditado = preciosEditados[item.id] !== undefined
                    ? preciosEditados[item.id]
                    : item.precio;

                  const enStock = (item.status || 'in-stock') === 'in-stock';
                  const codigoId = item.id || `PROD-${idx + 1}`;

                  return (
                    <tr key={codigoId}>
                      <td className="text-center p-1">
                        <img
                          src={item.imagenes ? item.imagenes[0] : item.imagen}
                          alt={item.nombre}
                          style={{ width: '42px', height: '42px', objectFit: 'contain', backgroundColor: '#0a0f16', borderRadius: '4px' }}
                          onError={(e) => { e.target.src = '/img/LOGO.png'; }}
                        />
                      </td>

                      <td className="font-monospace fw-bold" style={{ color: '#38bdf8', fontSize: '0.82rem' }}>
                        {codigoId}
                      </td>

                      <td className="fw-semibold text-white">
                        {item.nombre}
                      </td>

                      <td className="text-center">
                        <span 
                          className="badge text-white px-2 py-1"
                          style={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '0.75rem' }}
                        >
                          {item.grade || item.scale || 'Kit'}
                        </span>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm w-100 fw-bold py-1 px-2"
                          style={{
                            fontSize: '0.78rem',
                            letterSpacing: '0.5px',
                            backgroundColor: enStock ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 42, 95, 0.15)',
                            color: enStock ? '#00e676' : '#ff2a5f',
                            border: enStock ? '1.5px solid #00e676' : '1.5px solid #ff2a5f',
                            boxShadow: enStock ? '0 0 8px rgba(0, 230, 118, 0.3)' : '0 0 8px rgba(255, 42, 95, 0.35)',
                            borderRadius: '5px',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => toggleStock(item)}
                          title="Haz clic para alternar entre En Stock y Agotado"
                        >
                          {enStock ? '● En Stock' : '✕ Agotado'}
                        </button>
                      </td>

                      <td className="text-end fw-bold" style={{ color: '#00e5ff' }}>
                        {formatearPrecioCLP(item.precio)}
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm bg-dark text-white border-secondary fw-bold text-end"
                          style={{ fontSize: '0.9rem' }}
                          value={valorEditado}
                          onChange={(e) => handlePrecioChange(item.id, e.target.value)}
                          step="500"
                          min="1000"
                        />
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-info text-dark fw-bold px-3 py-1"
                          onClick={() => guardarPrecio(item)}
                        >
                          Guardar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA: RESUMEN Y GESTION */}
      {tabAdmin === 'resumen' && (
        <div className="row g-4">
          
          {/* USUARIOS REGISTRADOS */}
          <div className="col-12 col-lg-5">
            <div 
              className="p-3 rounded-3 bg-black h-100"
              style={{ border: '1.5px solid #00d2ff' }}
            >
              <h4 className="fw-bold mb-3" style={{ color: '#00e5ff', fontSize: '1.15rem' }}>
                👤 Pilotos Registrados ({usuarios.length})
              </h4>

              <div className="table-responsive">
                <table className="table table-dark table-sm align-middle">
                  <thead>
                    <tr style={{ color: '#94a3b8' }}>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u, i) => (
                      <tr key={i}>
                        <td className="fw-semibold text-white">{u.nombre}</td>
                        <td className="text-light small">{u.correo}</td>
                        <td>
                          <span className={`badge ${u.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '0.7rem' }}>
                            {u.rol || 'piloto'}
                          </span>
                        </td>
                        <td className="text-center">
                          {u.rol !== 'ADMIN' ? (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm py-0 px-2 fw-bold"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleBorrarUsuario(u.id, u.correo, u.nombre)}
                              title="Dar de baja usuario"
                            >
                              ✕ Borrar
                            </button>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* HISTORIAL GLOBAL DE COMPRAS */}
          <div className="col-12 col-lg-7">
            <div 
              className="p-3 rounded-3 bg-black h-100"
              style={{ border: '1.5px solid #00d2ff' }}
            >
              <h4 className="fw-bold mb-3" style={{ color: '#00e5ff', fontSize: '1.15rem' }}>
                📦 Registro Global de Compras ({ordenes.length})
              </h4>

              {ordenes.length === 0 ? (
                <p className="text-light small m-0" style={{ opacity: 0.8 }}>No hay órdenes registradas todavía.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-sm align-middle">
                    <thead>
                      <tr style={{ color: '#94a3b8' }}>
                        <th>Orden</th>
                        <th>Cliente</th>
                        <th>RUT</th>
                        <th>Medio</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenes.map((o) => (
                        <tr key={o.id}>
                          <td className="fw-bold" style={{ color: '#00e5ff' }}>#{o.id}</td>
                          <td className="text-white small">{o.nombre}</td>
                          <td className="text-light small">{o.rut}</td>
                          <td className="small text-capitalize text-light">{o.metodoPago}</td>
                          <td className="text-end fw-bold text-white">{formatearPrecioCLP(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </main>
  );
}

export default Admin;