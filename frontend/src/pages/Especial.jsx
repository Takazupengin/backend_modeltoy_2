import { useState } from 'react';
import { formatearPrecioCLP } from '../data/productos';

export function Especial({ preventas = [], onAddToCart }) {
  // ESTADOS
  const [modalidades, setModalidades] = useState({
    'prev-wing-zero': 'pie',
    'prev-sazabi-coating': 'pie',
    'prev-exia-transam': 'pie',
    'prev-pgu-rx78': 'pie'
  });

  const [notificacion, setNotificacion] = useState('');

  // GESTIÓN DE MODALIDADES
  const handleCambioModalidad = (id, modalidad) => {
    setModalidades((prev) => ({
      ...prev,
      [id]: modalidad
    }));
  };

  // RESERVAS
  const handleReservar = async (item) => {
    const modalidad = modalidades[item.id] || 'pie';
    const esPie = modalidad === 'pie';
    const precioCobrado = esPie ? item.precioPie : item.precioTotal;

    const productoReserva = {
      id: `${item.id}-${modalidad}`,
      nombre: `${item.nombre} (${esPie ? 'Abono Pie 50%' : 'Pago Total Preventa'})`,
      precio: precioCobrado,
      imagenes: [item.imagen],
      imagen: item.imagen,
      grade: item.grade,
      descripcion: `Preventa asegurada. ${item.llegada}.`
    };

    if (onAddToCart) {
      const agregado = await onAddToCart(productoReserva);
      if (!agregado) return;
    }

    setNotificacion(`¡Añadido al carro: ${item.nombre} (${esPie ? 'Pie 50%' : 'Total'})!`);
    setTimeout(() => setNotificacion(''), 4000);
  };

  // RENDER
  return (
    <main style={{ maxWidth: '1440px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
      
      {/* NOTIFICACIÓN */}
      {notificacion && (
        <div 
          className="alert text-center fw-bold mb-4 shadow"
          style={{
            backgroundColor: '#ffb700',
            color: '#000000',
            border: 'none',
            borderRadius: '8px'
          }}
        >
          ⚡ {notificacion}
        </div>
      )}

      {/* ENCABEZADO P-BANDAI */}
      <section 
        className="p-4 p-md-5 mb-5 rounded-3 text-center"
        style={{
          backgroundColor: '#070c12',
          border: '2px solid #ffb700',
          boxShadow: '0 0 22px rgba(255, 183, 0, 0.25)'
        }}
      >
        <div className="d-inline-block mb-3">
          <span 
            className="badge px-3 py-2 fw-bold text-black text-uppercase"
            style={{ 
              backgroundColor: '#ffb700', 
              fontSize: '0.8rem', 
              letterSpacing: '1.5px',
              borderRadius: '4px' 
            }}
          >
            ★ Lanzamientos Exclusivos P-Bandai ★
          </span>
        </div>

        <h1 
          className="fw-bold display-6 mb-3 text-uppercase" 
          style={{ 
            color: '#ffc107', 
            letterSpacing: '1.5px',
            textShadow: '0 0 15px rgba(255, 193, 7, 0.5)'
          }}
        >
          Preventas & Ediciones Especiales
        </h1>

        <p 
          className="mx-auto mb-4" 
          style={{ 
            color: '#e2e8f0', 
            maxWidth: '820px', 
            fontSize: '1.05rem', 
            lineHeight: '1.6',
            fontWeight: '400'
          }}
        >
          Asegura los lanzamientos más esperados eligiendo pagar un <strong>pie (abono inicial del 50%)</strong> o el <strong>total de la preventa</strong>. Stock ultra limitado traído directo desde Japón sin recargos aduaneros sorpresas.
        </p>

        {/* DISTINTIVOS */}
        <div className="d-flex justify-content-center gap-2 gap-md-3 flex-wrap">
          <span 
            className="px-3 py-2 rounded-2 small fw-semibold text-light"
            style={{ backgroundColor: '#0f172a', border: '1px solid #ffb700', fontSize: '0.82rem' }}
          >
            📦 Despacho asegurado a todo Chile
          </span>
          <span 
            className="px-3 py-2 rounded-2 small fw-semibold text-light"
            style={{ backgroundColor: '#0f172a', border: '1px solid #ffb700', fontSize: '0.82rem' }}
          >
            🛡️ 100% Original Bandai Spirits
          </span>
          <span 
            className="px-3 py-2 rounded-2 small fw-semibold text-light"
            style={{ backgroundColor: '#0f172a', border: '1px solid #ffb700', fontSize: '0.82rem' }}
          >
            🔒 Reserva protegida con boleta
          </span>
        </div>
      </section>

      {/* TÍTULO DE SECCIÓN */}
      <h3 
        className="fw-bold mb-4" 
        style={{ 
          color: '#ffffff', 
          fontSize: '1.5rem',
          borderLeft: '4px solid #ffb700',
          paddingLeft: '12px'
        }}
      >
        Preventas Disponibles (Pre-Orders)
      </h3>

      {/* GRILLA DE PREVENTAS */}
      <div className="row g-4">
        {preventas.map((item) => {
          const modalidadActual = modalidades[item.id] || 'pie';
          const esPie = modalidadActual === 'pie';
          const precioAMostrar = esPie ? item.precioPie : item.precioTotal;

          return (
            <div key={item.id} className="col-12 col-sm-6 col-lg-3">
              <article 
                className="card h-100 p-3 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: '#070c12',
                  border: '1.5px solid #ffb700',
                  boxShadow: '0 0 14px rgba(255, 183, 0, 0.15)',
                  borderRadius: '10px'
                }}
              >
                {/* DISTINTIVOS DEL KIT */}
                <div className="d-flex justify-content-between align-items-center mb-2 gap-1">
                  <span 
                    className="badge text-black fw-bold px-2 py-1"
                    style={{ backgroundColor: '#ffb700', fontSize: '0.72rem' }}
                  >
                    {item.grade}
                  </span>
                  <span 
                    className="badge border px-2 py-1"
                    style={{ 
                      borderColor: '#ffc107', 
                      color: '#ffc107', 
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      fontSize: '0.7rem' 
                    }}
                  >
                    {item.llegada}
                  </span>
                </div>

                {/* IMAGEN DEL KIT */}
                <div 
                  className="rounded p-2 mb-3 d-flex align-items-center justify-content-center"
                  style={{ height: '210px', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' }}
                >
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = '/img/LOGO.png';
                    }}
                  />
                </div>

                {/* DETALLES Y MODALIDAD */}
                <div className="d-flex flex-column flex-grow-1">
                  <h4 
                    className="fw-bold mb-2" 
                    style={{ color: '#00e5ff', fontSize: '1.05rem', minHeight: '44px' }}
                  >
                    {item.nombre}
                  </h4>

                  <div className="mb-3">
                    <div className="fw-bold fs-5" style={{ color: '#ffb700' }}>
                      {formatearPrecioCLP(precioAMostrar)}
                    </div>
                    <div className="small" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                      {esPie ? `(Pie / Abono inicial 50% | Total: ${formatearPrecioCLP(item.precioTotal)})` : '(Pago Total de la Preventa)'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label 
                      htmlFor={`pago-${item.id}`} 
                      className="form-label small fw-semibold mb-1" 
                      style={{ color: '#94a3b8', fontSize: '0.8rem' }}
                    >
                      Modalidad de Pago:
                    </label>
                    <select
                      id={`pago-${item.id}`}
                      className="form-select form-select-sm"
                      value={modalidadActual}
                      onChange={(e) => handleCambioModalidad(item.id, e.target.value)}
                      style={{
                        backgroundColor: '#0b0e14',
                        borderColor: '#ffb700',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pie">Abonar Pie ({formatearPrecioCLP(item.precioPie)})</option>
                      <option value="total">Pagar Total ({formatearPrecioCLP(item.precioTotal)})</option>
                    </select>
                  </div>

                  <p 
                    className="small flex-grow-1 mb-3" 
                    style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: '1.45' }}
                  >
                    {item.descripcion}
                  </p>
                </div>

                {/* ACCIÓN DE RESERVA */}
                <div className="mt-auto pt-2 border-top border-secondary">
                  <button
                    type="button"
                    className="btn w-100 fw-bold py-2"
                    style={{
                      border: '1.5px solid #ffb700',
                      color: '#ffb700',
                      backgroundColor: 'rgba(255, 183, 0, 0.08)',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      letterSpacing: '0.5px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffb700';
                      e.currentTarget.style.color = '#000000';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 183, 0, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 183, 0, 0.08)';
                      e.currentTarget.style.color = '#ffb700';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleReservar(item)}
                  >
                    {esPie ? `Abonar ${formatearPrecioCLP(item.precioPie)}` : `Pagar ${formatearPrecioCLP(item.precioTotal)}`}
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default Especial;