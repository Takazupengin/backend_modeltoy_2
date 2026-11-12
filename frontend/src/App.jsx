import { useState, useEffect } from 'react';
import Header from './components/Header';
import Carrito from './pages/Carrito';
import Login from './pages/Login';
import Especial from './pages/Especial';
import Nosotros from './pages/Nosotros';
import Inicio from './pages/Inicio';
import Perfil from './pages/Perfil';
import Admin from './pages/Admin';
import ProductCard from './components/ProductCard';
import { api, setAccessToken } from './services/api';

function App() {
  // 1. Estado para navegación entre pantallas
  const [vistaActual, setVistaActual] = useState('inicio');
  const [escalasSeleccionadas, setEscalasSeleccionadas] = useState([]);
  const [soloEnStock, setSoloEnStock] = useState(true);

  const [productos, setProductos] = useState([]);
  const [preventas, setPreventas] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [foros, setForos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products().then(setProductos).catch((e) => setError(e.message));
    api.preorders().then(setPreventas).catch((e) => setError(e.message));
    api.cart().then((c) => setCarrito(c.items)).catch((e) => setError(e.message));
  }, []);

  const handleLoginSuccess = async (result) => {
    setAccessToken(result.accessToken);
    setUsuarioActual(result.usuario);
    setOrdenes([]); setForos([]); setUsuarios([]);
    setVistaActual(result.usuario.rol === 'ADMIN' ? 'admin' : 'perfil');
    try {
      const [cart, posts, orders] = await Promise.all([
        api.cart(), api.forum(), result.usuario.rol === 'ADMIN' ? api.adminOrders() : api.orders(),
      ]);
      setCarrito(cart.items); setForos(posts); setOrdenes(orders);
      if (result.usuario.rol === 'ADMIN') setUsuarios((await api.users()).filter((u) => u.activo && u.rol === 'PILOTO'));
    } catch (e) { setError(e.message); }
  };
  const cerrarSesion = () => {
    setAccessToken(null); setUsuarioActual(null); setUsuarios([]); setOrdenes([]); setForos([]);
    setVistaActual('inicio');
    api.cart().then((c) => setCarrito(c.items)).catch((e) => setError(e.message));
  };
  const handleEliminarUsuario = async (id) => {
    await api.deleteUser(id); setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };
  const handleActualizarProducto = async (id, cambios) => {
    const p = productos.find((item) => item.id === id);
    const updated = await api.updateProduct(id, { precio: cambios.precio ?? p.precio, status: cambios.status ?? p.status });
    setProductos((prev) => prev.map((item) => item.id === id ? updated : item));
  };
  const agregarOrdenCompra = async (datos) => {
    const orden = await api.checkout(datos); setCarrito([]);
    setOrdenes((prev) => [orden, ...prev]); return orden;
  };
  const agregarPostForo = async (post) => {
    const saved = await api.post({ kit: post.kit, pregunta: post.pregunta });
    setForos((prev) => [saved, ...prev]);
  };
  const actualizarCarrito = async (nuevaLista) => {
    try {
      const actual = (await api.cart()).items;
      for (const item of actual) if (!nuevaLista.some((n) => n.id === item.id)) await api.remove(item.id);
      for (const item of nuevaLista) {
        const previo = actual.find((n) => n.id === item.id);
        if (!previo) await api.add(item.id, item.cantidad);
        else if (previo.cantidad !== item.cantidad) await api.quantity(item.id, item.cantidad);
      }
      setCarrito((await api.cart()).items);
    } catch (e) { setError(e.message); }
  };

  // Filtros de barra lateral
  const handleCheckboxChange = (escala) => {
    setEscalasSeleccionadas((prev) =>
      prev.includes(escala) ? prev.filter((item) => item !== escala) : [...prev, escala]
    );
  };

  const agregarAlCarrito = async (producto) => {
    try { const cart = await api.add(producto.id); setCarrito(cart.items); return true; }
    catch (e) { setError(e.message); return false; }
  };

  const totalItemsCarrito = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);

  // Filtrado reactivo de productos del catálogo editable
  const productosFiltrados = productos.filter((item) => {
    return (escalasSeleccionadas.length === 0 || escalasSeleccionadas.includes(item.scale)) && (!soloEnStock || item.status === 'in-stock');
  });

  return (
    <div 
      className="text-light min-vh-100 d-flex flex-column" 
      style={{ backgroundColor: '#05070c' }}
    >
      {/* Header con contador dinámico, sesión de piloto y navegación */}
      <Header 
        cartCount={totalItemsCarrito}
        onNavigate={setVistaActual}
        vistaActual={vistaActual}
        usuarioLogueado={usuarioActual}
      />

      {error && <div role="alert" className="alert alert-danger mx-3 my-2">
        {error} <button type="button" className="btn btn-sm" onClick={() => setError('')}>Cerrar</button>
      </div>}
      {/* VISTA 1: INICIO */}
      {vistaActual === 'inicio' && (
        <Inicio 
          onNavigate={setVistaActual} 
          onSelectCategory={(cat) => {
            if (cat === 'all') setEscalasSeleccionadas([]);
            else setEscalasSeleccionadas([cat]);
          }} 
        />
      )}

      {/* VISTA 2: CATÁLOGO RESPONSIVO (16 PRODUCTOS) */}
      {vistaActual === 'catalogo' && (
        <main className="container-fluid my-4 flex-grow-1" style={{ maxWidth: '1440px', padding: '0 20px' }}>
          <div className="mb-4 pb-2" style={{ borderBottom: '2px solid #00d2ff' }}>
            <h2 className="fw-bold m-0" style={{ color: '#ffffff', fontSize: '1.6rem' }}>
              Catálogo de Model Kits & Accesorios
            </h2>
          </div>

          <div className="catalog-container-responsive">
            {/* Columna Izquierda: Filtros estilo Mecha */}
            <aside className="sidebar-filters-wrapper">
              <div className="sidebar-filters">
                <h3>SHOPPING OPTIONS</h3>
                
                <div className="filter-group">
                  <h4>GRADE / SCALE</h4>
                  {[
                    { id: 'HG', label: 'HG (High Grade 1/144)' },
                    { id: 'RG', label: 'RG (Real Grade 1/144)' },
                    { id: '1/100', label: '1/100 (MG)' },
                    { id: '1/60', label: '1/60 (PG)' },
                    { id: 'tools', label: 'Herramientas' }
                  ].map((filtro) => (
                    <label key={filtro.id}>
                      <input 
                        type="checkbox"
                        checked={escalasSeleccionadas.includes(filtro.id)}
                        onChange={() => handleCheckboxChange(filtro.id)}
                      />
                      {filtro.label}
                    </label>
                  ))}
                </div>

                <div className="filter-group">
                  <h4>AVAILABILITY</h4>
                  <label>
                    <input 
                      type="checkbox"
                      checked={soloEnStock}
                      onChange={(e) => setSoloEnStock(e.target.checked)}
                    />
                    In Stock
                  </label>
                </div>

                <button 
                  type="button" 
                  className="btn-apply-filters"
                  onClick={() => setEscalasSeleccionadas([])}
                >
                  {escalasSeleccionadas.length > 0 ? 'LIMPIAR FILTROS' : 'APLICAR FILTROS'}
                </button>
              </div>
            </aside>

            {/* Columna Derecha: Grilla de Productos adaptable a resolución y zoom */}
            <section className="catalog-products-wrapper">
              <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
                {productosFiltrados.map((item) => (
                  <div key={item.id} className="col">
                    <ProductCard item={item} onAddToCart={agregarAlCarrito} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* VISTA 3: CARRITO */}
      {vistaActual === 'carrito' && (
        <Carrito 
          items={carrito} 
          onUpdateCart={actualizarCarrito} productos={productos} 
          onNavigate={setVistaActual}
          usuarioLogueado={usuarioActual}
          onGuardarOrden={agregarOrdenCompra}
        />
      )}

      {/* VISTA 4: LOGIN / REGISTRO */}
      {vistaActual === 'login' && (
        <Login 
          onAuthenticate={async (datos, registro) => {
            const result = await (registro ? api.register(datos) : api.login(datos));
            await handleLoginSuccess(result); return result;
          }}
        />
      )}

      {/* VISTA 5: PERFIL DE PILOTO (HISTORIAL Y FORO) */}
      {vistaActual === 'perfil' && usuarioActual && (
        <Perfil 
          usuario={usuarioActual}
          ordenes={ordenes}
          foros={foros}
          onAgregarPost={agregarPostForo}
          onCerrarSesion={cerrarSesion}
          onNavigate={setVistaActual}
        />
      )}

      {/* VISTA 6: ADMIN (CONTROL CENTRAL & PLANILLA EXCEL) */}
      {vistaActual === 'admin' && usuarioActual?.rol === 'ADMIN' && (
        <Admin 
          usuarios={usuarios}
          ordenes={ordenes}
          productos={productos}
          onEliminarUsuario={handleEliminarUsuario}
          onActualizarProducto={handleActualizarProducto}
          onCerrarSesion={cerrarSesion}
          onNavigate={setVistaActual}
        />
      )}

      {/* VISTA 7: ESPECIAL / PREVENTAS P-BANDAI */}
      {(vistaActual === 'especial' || vistaActual === 'special') && (
        <Especial preventas={preventas} onAddToCart={agregarAlCarrito} />
      )}
      
      {/* VISTA 8: NOSOTROS */}
      {vistaActual === 'nosotros' && (
        <Nosotros onNavigate={setVistaActual} />
      )}

      {/* Footer corporativo */}
      <footer className="border-top border-secondary py-3 text-center text-muted small mt-auto" style={{ backgroundColor: '#070c12' }}>
        <div className="container">
          <p className="m-0">© 2026 ModelToys - Tienda de Model Kits y Coleccionables. Viña del Mar, Chile.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
