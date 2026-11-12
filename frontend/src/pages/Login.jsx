import { useState } from 'react';

export function Login({ onAuthenticate }) {
  // ESTADOS
  const [esRegistro, setEsRegistro] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: ''
  });

  const [errores, setErrores] = useState({
    correo: '',
    password: '',
    nombre: ''
  });

  const mensajeExito = '';
  const [procesando, setProcesando] = useState(false);

  // MANEJO DE ENTRADAS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: '' }));
  };

  // AUTENTICACIÓN Y REGISTRO
  const handleSubmit = async (e) => {
    e.preventDefault();
    let hayError = false;
    const nuevosErrores = { correo: '', password: '', nombre: '' };

    // VALIDACIONES
    if (esRegistro && formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
      hayError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.';
      hayError = true;
    }

    if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
      hayError = true;
    }

    if (hayError) {
      setErrores(nuevosErrores);
      return;
    }

    setProcesando(true);
    try {
      await onAuthenticate({ correo: formData.correo.trim().toLowerCase(), password: formData.password,
        ...(esRegistro ? { nombre: formData.nombre.trim() } : {}) }, esRegistro);
      setFormData({ nombre: '', correo: '', password: '' });
    } catch (error) {
      setErrores((prev) => ({ ...prev, correo: error.message }));
    } finally { setProcesando(false); }
  };

  // RENDER
  return (
    <main 
      className="d-flex justify-content-center align-items-center flex-grow-1"
      style={{ padding: '2rem 1rem', minHeight: '75vh' }}
    >
      <div 
        style={{
          backgroundColor: '#070c12',
          border: '1.5px solid #00d2ff',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(0, 210, 255, 0.2)',
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 2.2rem'
        }}
      >
        {/* ENCABEZADO */}
        <div className="text-center mb-4">
          <h2 
            className="fw-bold mb-2" 
            style={{ 
              color: '#00e5ff', 
              fontSize: '1.8rem',
              letterSpacing: '0.5px',
              textShadow: '0 0 10px rgba(0, 229, 255, 0.4)'
            }}
          >
            {esRegistro ? 'Registro de Piloto' : 'Acceso Piloto'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            {esRegistro 
              ? 'Únete a la flota de ModelToys para beneficios exclusivos'
              : 'Ingresa para revisar el estado de tus compras'}
          </p>
        </div>

        {/* NOTIFICACIÓN */}
        {mensajeExito && (
          <div 
            className="text-center py-2 px-3 mb-3 fw-bold small rounded"
            style={{
              backgroundColor: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid #00d2ff',
              color: '#00e5ff'
            }}
          >
            ⚡ {mensajeExito}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          {esRegistro && (
            <div className="mb-3">
              <label htmlFor="nombre" style={{ display: 'block', color: '#f0f4fc', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                Nombre Completo:
              </label>
              <input 
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ej: Amuro Ray"
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#05080e',
                  border: errores.nombre ? '1.5px solid #ff2a5f' : '1.5px solid #00d2ff',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              {errores.nombre && (
                <span className="text-danger small mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                  {errores.nombre}
                </span>
              )}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="correo" style={{ display: 'block', color: '#f0f4fc', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Correo Electrónico:
            </label>
            <input 
              type="email"
              id="correo"
              name="correo"
              placeholder="usuario@correo.com"
              value={formData.correo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#05080e',
                border: errores.correo ? '1.5px solid #ff2a5f' : '1.5px solid #00d2ff',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            {errores.correo && (
              <span className="text-danger small mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                {errores.correo}
              </span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{ display: 'block', color: '#f0f4fc', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.4rem' }}>
              Contraseña:
            </label>
            <input 
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#05080e',
                border: errores.password ? '1.5px solid #ff2a5f' : '1.5px solid #00d2ff',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            {errores.password && (
              <span className="text-danger small mt-1 d-block" style={{ fontSize: '0.75rem' }}>
                {errores.password}
              </span>
            )}
          </div>

          {/* ACCIÓN PRINCIPAL */}
          <button 
            type="submit"
            disabled={procesando}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: '1.5px solid #00d2ff',
              borderRadius: '6px',
              color: '#00e5ff',
              padding: '0.75rem 1rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00d2ff';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#00e5ff';
            }}
          >
            {esRegistro ? 'Completar Registro' : 'Ingresar al Sistema'}
          </button>
        </form>

        {/* CAMBIO DE MODO */}
        <div className="text-center mt-4">
          <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            {esRegistro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          </span>
          <button
            type="button"
            className="btn btn-link p-0 fw-bold"
            style={{ color: '#00e5ff', textDecoration: 'none', fontSize: '0.88rem', cursor: 'pointer' }}
            onClick={() => {
              setEsRegistro(!esRegistro);
              setErrores({ correo: '', password: '', nombre: '' });
            }}
          >
            {esRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </button>
        </div>

      </div>
    </main>
  );
}

export default Login;