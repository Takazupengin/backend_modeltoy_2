import { useState } from 'react';

export function Nosotros() {
  // ESTADOS
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  // MANEJO DE ENTRADAS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ENVÍO DE FORMULARIO
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.correo || !formData.mensaje) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    setEnviado(true);
    setFormData({ nombre: '', correo: '', mensaje: '' });
    setTimeout(() => setEnviado(false), 5000);
  };

  // RENDER
  return (
    <main style={{ maxWidth: '1400px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
      {/* ENCABEZADO */}
      <h2 className="section-heading" style={{ textAlign: 'left', marginBottom: '2rem' }}>
        Sobre ModelToys & Taller
      </h2>

      {/* INFORMACIÓN Y CONTACTO */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '1.8rem', 
          marginBottom: '3rem' 
        }}
      >
        {/* INFORMACIÓN DE TIENDA */}
        <article 
          className="category-card" 
          style={{ 
            padding: '2rem',
            backgroundColor: '#070c12',
            border: '1.5px solid #00d2ff',
            borderRadius: '12px',
            boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)'
          }}
        >
          <h3 
            style={{ 
              color: '#00e5ff', 
              marginBottom: '1.2rem', 
              fontSize: '1.4rem', 
              fontWeight: '700',
              textShadow: '0 0 8px rgba(0, 229, 255, 0.4)'
            }}
          >
            Nuestra Tienda
          </h3>
          
          <p 
            style={{ 
              color: '#cbd5e1', 
              fontSize: '0.96rem', 
              marginBottom: '1.5rem', 
              lineHeight: '1.65' 
            }}
          >
            ModelToys es una tienda especializada en la importación de maquetas Gunpla originales Bandai, pinturas, herramientas de corte y accesorios para coleccionistas y modelistas exigentes.
          </p>

          <p style={{ fontSize: '0.92rem', marginBottom: '0.9rem', color: '#f0f4fc' }}>
            <strong style={{ color: '#00e5ff' }}>Dirección:</strong>{' '}
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Av.+Libertad+1245,+Viña+del+Mar" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#00e5ff', 
                textDecoration: 'underline', 
                fontWeight: '600',
                marginLeft: '4px' 
              }}
            >
              Av. Libertad 1245, Galería MechaCenter, Local 204, Viña del Mar 📍
            </a>
          </p>

          <p style={{ fontSize: '0.92rem', marginBottom: '0.9rem', color: '#f0f4fc' }}>
            <strong style={{ color: '#00e5ff' }}>Horario de Atención:</strong>{' '}
            <span style={{ color: '#cbd5e1' }}>
              Lunes a Viernes de 10:30 a 19:30 hrs | Sábados de 11:00 a 16:00 hrs.
            </span>
          </p>

          <p style={{ fontSize: '0.92rem', color: '#f0f4fc', margin: 0 }}>
            <strong style={{ color: '#00e5ff' }}>Envíos:</strong>{' '}
            <span style={{ color: '#cbd5e1' }}>
              Despacho asegurado a todo Chile vía Starken / Blue Express.
            </span>
          </p>
        </article>

        {/* FORMULARIO DE CONTACTO */}
        <article 
          className="category-card" 
          style={{ 
            padding: '2rem',
            backgroundColor: '#070c12',
            border: '1.5px solid #00d2ff',
            borderRadius: '12px',
            boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)'
          }}
        >
          <h3 
            style={{ 
              color: '#00e5ff', 
              marginBottom: '1.2rem', 
              fontSize: '1.4rem', 
              fontWeight: '700',
              textShadow: '0 0 8px rgba(0, 229, 255, 0.4)'
            }}
          >
            Envíanos un Mensaje
          </h3>

          {enviado && (
            <div 
              style={{
                backgroundColor: 'rgba(0, 210, 255, 0.15)',
                border: '1px solid #00d2ff',
                color: '#00e5ff',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            >
              ⚡ ¡Mensaje enviado con éxito al hangar de ModelToys!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="nombre" 
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#f0f4fc', fontWeight: '500' }}
              >
                Nombre Completo:
              </label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                placeholder="Tu nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#0b0e14',
                  border: '1px solid #1c2b3a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '0.92rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00d2ff'}
                onBlur={(e) => e.target.style.borderColor = '#1c2b3a'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="correo" 
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#f0f4fc', fontWeight: '500' }}
              >
                Correo Electrónico:
              </label>
              <input 
                type="email" 
                id="correo" 
                name="correo" 
                placeholder="correo@ejemplo.com" 
                value={formData.correo} 
                onChange={handleChange} 
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#0b0e14',
                  border: '1px solid #1c2b3a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '0.92rem'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00d2ff'}
                onBlur={(e) => e.target.style.borderColor = '#1c2b3a'}
              />
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <label 
                htmlFor="mensaje" 
                style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#f0f4fc', fontWeight: '500' }}
              >
                Consulta o Encargo Especial:
              </label>
              <textarea 
                id="mensaje" 
                name="mensaje" 
                rows="3" 
                placeholder="¿Buscas algún modelo o escala en particular?..." 
                value={formData.mensaje} 
                onChange={handleChange} 
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#0b0e14',
                  border: '1px solid #1c2b3a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  outline: 'none',
                  fontSize: '0.92rem',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00d2ff'}
                onBlur={(e) => e.target.style.borderColor = '#1c2b3a'}
              />
            </div>

            <button 
              type="submit" 
              className="btn-apply-filters"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                margin: 0
              }}
            >
              Enviar Mensaje
            </button>
          </form>
        </article>
      </div>

      {/* TALLER Y VIDEO */}
      <h3 className="section-heading" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
        Taller de Ensamblaje y Personalización
      </h3>
      
      <div 
        style={{ 
          padding: '1.5rem', 
          marginBottom: '3rem',
          backgroundColor: '#070c12',
          border: '1.5px solid #00d2ff',
          borderRadius: '12px',
          boxShadow: '0 0 16px rgba(0, 210, 255, 0.15)'
        }}
      >
        <iframe 
          src="https://drive.google.com/file/d/1eipFpl8-pU6qvIt_Mm6PQjoB8Smua5VG/preview" 
          width="100%" 
          height="480" 
          allow="autoplay" 
          title="Video Taller ModelToys"
          style={{ 
            borderRadius: '8px', 
            border: 'none',
            display: 'block'
          }} 
        />
      </div>
    </main>
  );
}

export default Nosotros;