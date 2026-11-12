export function Header({ cartCount = 0, onNavigate, vistaActual = 'inicio', usuarioLogueado }) {
  // NAVEGACIÓN
  const handleNav = (e, vista) => {
    e.preventDefault();
    if (onNavigate) onNavigate(vista);
  };

  // RENDER
  return (
    <>
      {/* BARRA SUPERIOR */}
      <div className="top-announcement-bar">
        <a href="#" onClick={(e) => handleNav(e, 'catalogo')}>
          ⚡ ¡ENVÍO GRATIS POR COMPRAS SOBRE $50.000 A TODO CHILE! REVISA NUESTROS NUEVOS INGRESOS ⚡
        </a>
      </div>

      {/* HEADER PRINCIPAL */}
      <header className="gp-header">
        <div className="gp-header-container">
          
          {/* NAVEGACIÓN PRINCIPAL */}
          <nav className="gp-nav-left">
            <a 
              href="#" 
              className={`gp-nav-link ${vistaActual === 'inicio' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'inicio')}
            >
              INICIO
            </a>
            <a 
              href="#" 
              className={`gp-nav-link ${vistaActual === 'catalogo' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'catalogo')}
            >
              CATÁLOGO
            </a>
            <a 
              href="#" 
              className={`gp-nav-link ${vistaActual === 'nosotros' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'nosotros')}
            >
              NOSOTROS
            </a>
          </nav>

          {/* LOGOTIPO */}
          <div className="gp-logo-center">
            <a href="#" onClick={(e) => handleNav(e, 'inicio')}>
              <h1 className="gp-brand-title">MODEL TOYS</h1>
              <span className="gp-brand-sub">FOR HOBBY, COLLECTIBLES AND SUPPLIES</span>
            </a>
          </div>

          {/* ACCIONES Y SESIÓN */}
          <div className="gp-nav-right">
            <a 
              href="#" 
              className={`gp-special-link ${vistaActual === 'especial' ? 'active' : ''}`}
              onClick={(e) => handleNav(e, 'especial')}
            >
              ESPECIAL
            </a>

            <div className="gp-action-icons">
              {/* CARRITO */}
              <a 
                href="#" 
                title="Carrito de Compras" 
                className={`gp-icon-btn gp-cart-btn ${vistaActual === 'carrito' ? 'active' : ''}`}
                onClick={(e) => handleNav(e, 'carrito')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span className="gp-cart-count">{cartCount}</span>
              </a>

              {/* PERFIL / USUARIO */}
              <a 
                href="#" 
                title={usuarioLogueado ? `Perfil de ${usuarioLogueado.nombre}` : "Ingresar"} 
                className={`gp-icon-btn ${vistaActual === 'login' || vistaActual === 'perfil' || vistaActual === 'ADMIN' ? 'active' : ''}`}
                onClick={(e) => {
                  if (!usuarioLogueado) {
                    handleNav(e, 'login');
                  } else if (usuarioLogueado.rol === 'ADMIN') {
                    handleNav(e, 'ADMIN');
                  } else {
                    handleNav(e, 'perfil');
                  }
                }}
                style={{ width: 'auto', gap: '6px', padding: '0 4px' }}
              >
                <svg className="gp-user-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                {usuarioLogueado && (
                  <span className="small fw-bold d-none d-md-inline" style={{ color: usuarioLogueado.rol === 'ADMIN' ? '#ff2a5f' : '#00e5ff' }}>
                    {usuarioLogueado.nombre.split(' ')[0]}
                  </span>
                )}
              </a>
            </div>
          </div>

        </div>
      </header>
    </>
  );
}

export default Header;