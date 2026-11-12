import { useState } from 'react';
import { formatearPrecioCLP } from '../data/productos';

export function Perfil({ usuario, ordenes = [], foros = [], onAgregarPost, onCerrarSesion, onNavigate }) {
  // ESTADOS
  const [error, setError] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [tabActiva, setTabActiva] = useState('compras');
  const [nuevoPost, setNuevoPost] = useState({ kit: '', pregunta: '' });

  // FILTRADO DE COMPRAS
  const misCompras = ordenes.filter(
    (o) => o.usuarioEmail === usuario.correo
  );

  // GESTIÓN DE FORO
  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!nuevoPost.pregunta.trim()) return;

    setPublicando(true); setError('');
    try {
    if (onAgregarPost) {
      await onAgregarPost({
        id: `post-${Date.now()}`,
        autor: usuario.nombre,
        correo: usuario.correo,
        kit: nuevoPost.kit.trim() || 'General',
        pregunta: nuevoPost.pregunta.trim(),
        fecha: new Date().toLocaleDateString('es-CL')
      });
    }

    setNuevoPost({ kit: '', pregunta: '' });
    } catch (e) { setError(e.message); } finally { setPublicando(false); }
  };

  // RENDER
  return (
    <main style={{ maxWidth: '1200px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      {/* RESUMEN DE PILOTO */}
      <div 
        className="p-4 mb-4 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-3"
        style={{
          backgroundColor: '#070c12',
          border: '1.5px solid #00d2ff',
          boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)'
        }}
      >
        <div>
          <span className="badge mb-2 px-2 py-1" style={{ backgroundColor: '#0072ff' }}>
            RANGO: PILOTO ACTIVO
          </span>
          <h2 className="fw-bold m-0" style={{ color: '#00e5ff' }}>
            {usuario.nombre}
          </h2>
          <span className="small text-muted">{usuario.correo}</span>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            onClick={() => onNavigate && onNavigate('catalogo')}
          >
            Ir al Catálogo
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onCerrarSesion}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tabActiva === 'compras' ? 'btn-info text-dark shadow' : 'btn-dark text-muted'}`}
          onClick={() => setTabActiva('compras')}
          style={{ letterSpacing: '0.5px' }}
        >
          📦 Mis Compras ({misCompras.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm fw-bold ${tabActiva === 'foro' ? 'btn-info text-dark shadow' : 'btn-dark text-muted'}`}
          onClick={() => setTabActiva('foro')}
          style={{ letterSpacing: '0.5px' }}
        >
          💬 Foro de Consultas ({foros.length})
        </button>
      </div>

      {/* PESTAÑA: COMPRAS */}
      {tabActiva === 'compras' && (
        <div>
          {misCompras.length === 0 ? (
            <div className="p-4 text-center rounded bg-black border border-secondary">
              <p className="text-muted m-0">Aún no has registrado compras en el hangar.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {misCompras.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded bg-black border border-secondary"
                  style={{ borderLeft: '4px solid #00d2ff' }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                    <span className="fw-bold" style={{ color: '#00e5ff' }}>
                      Orden #{ord.id}
                    </span>
                    <span className="badge bg-success bg-opacity-25 text-success border border-success">
                      {ord.estado || 'En Preparación / Hangar'}
                    </span>
                  </div>

                  <div className="small text-muted mb-2">
                    Fecha: <span className="text-white">{new Date(ord.fecha).toLocaleDateString('es-CL')}</span> | Despacho a:{' '}
                    <span className="text-white">{ord.direccion}, {ord.ciudad}</span>
                  </div>

                  <ul className="list-unstyled small mb-2 text-light ps-2 border-start border-secondary">
                    {ord.productos && ord.productos.map((p, idx) => (
                      <li key={idx} className="mb-1">
                        • {p.nombre} × {p.cantidad} — <span style={{ color: '#00e5ff' }}>{formatearPrecioCLP(p.precio * p.cantidad)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-end fw-bold fs-6" style={{ color: '#00e5ff' }}>
                    Total: {formatearPrecioCLP(ord.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: FORO */}
      {tabActiva === 'foro' && (
        <div>
          {/* NUEVA CONSULTA */}
          <div 
            className="p-3 mb-4 rounded bg-black"
            style={{ border: '1.5px solid #00d2ff' }}
          >
            <h5 className="fw-bold mb-3" style={{ color: '#00e5ff' }}>
              Publicar Nueva Consulta en el Hangar
            </h5>
            <form onSubmit={handlePublicar}>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Kit o tema (Ej: Panel lining en RG Sazabi, Lijas, etc.)"
                  className="form-control form-control-sm bg-dark text-light border-secondary"
                  value={nuevoPost.kit}
                  onChange={(e) => setNuevoPost({ ...nuevoPost, kit: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <textarea
                  rows="2"
                  required
                  placeholder="Escribe tu duda para la comunidad de modelistas..."
                  className="form-control form-control-sm bg-dark text-light border-secondary"
                  value={nuevoPost.pregunta}
                  onChange={(e) => setNuevoPost({ ...nuevoPost, pregunta: e.target.value })}
                />
              </div>
              <button type="submit" disabled={publicando} className="btn btn-sm btn-info text-dark fw-bold">
                Publicar Consulta
              </button>
            </form>
          </div>

          {/* LISTADO DE CONSULTAS */}
          <div className="d-flex flex-column gap-3">
            {foros.map((post) => (
              <div 
                key={post.id}
                className="p-3 rounded bg-black border border-secondary"
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge" style={{ backgroundColor: '#005f87' }}>
                    {post.kit}
                  </span>
                  <span className="small text-muted">{new Date(post.fecha).toLocaleDateString('es-CL')}</span>
                </div>
                <h6 className="fw-bold text-white mb-2">{post.pregunta}</h6>
                <div className="small text-muted">
                  Por: <span style={{ color: '#00e5ff' }}>{post.autor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

export default Perfil;