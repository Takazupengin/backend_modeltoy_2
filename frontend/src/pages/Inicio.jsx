import { useState, useEffect } from 'react';

export function Inicio({ onNavigate, onSelectCategory }) {
  // SLIDES HERO
  const slides = [
    {
      id: 1,
      fondo: '/img/LOGO.png',
      badge: 'DESTACADO DE LA SEMANA',
      titulo: 'BANDAI MODEL KITS',
      subtitulo: 'TU HANGAR DEFINITIVO DE GUNPLA',
      descripcion: 'Encuentra las mejores maquetas importadas directas desde Japón, accesorios de corte y pinturas de precisión.',
      botonTexto: 'EXPLORAR TODO EL CATÁLOGO',
      destino: 'catalogo',
      colorBadge: '#00d2ff',
      colorBoton: '#00d2ff',
      colorTextoBoton: '#05070c'
    },
    {
      id: 2,
      fondo: '/img/fondo 2 inicio.avif',
      badge: 'NUEVOS INGRESOS',
      titulo: 'TECNOLOGÍA REAL GRADE 2.0',
      subtitulo: 'INGENIERÍA Y ESQUELETO INTERNO AVANZADO',
      descripcion: 'Detalle supremo a escala 1/144 con articulación multicapa y paneles móviles de última generación.',
      botonTexto: 'VER COLECCIÓN RG',
      categoria: 'RG',
      colorBadge: '#00d2ff',
      colorBoton: '#00d2ff',
      colorTextoBoton: '#05070c'
    },
    {
      id: 3,
      fondo: '/img/fondo 3 inicio.avif',
      badge: 'EDICIONES MAESTRAS',
      titulo: 'LÍNEA MASTER & PERFECT GRADE',
      subtitulo: 'MÁXIMA PRESENCIA, LUCES LED & ESCALA 1/60',
      descripcion: 'Para modelistas exigentes que buscan el pináculo del armado, piezas metálicas y sistemas de iluminación.',
      botonTexto: 'VER KITS 1/60 Y 1/100',
      categoria: '1/60',
      colorBadge: '#00d2ff',
      colorBoton: '#00d2ff',
      colorTextoBoton: '#05070c'
    },
    {
      id: 4,
      fondo: '/img/fondo 4 inicio.jpg',
      badge: 'OFERTAS ESPECIALES',
      titulo: 'LÍNEA SPECIAL EDITION',
      subtitulo: 'EDICIONES LIMITADAS Y EXCLUSIVAS',
      descripcion: 'Colecciones especiales con detalles únicos y elementos de colección que no se encuentran en las versiones estándar.',
      botonTexto: 'VER OFERTAS ESPECIALES',
      destino: 'especial',
      categoria: 'SPECIAL',
      colorBadge: '#ff2a5f',
      colorBoton: '#ff2a5f',
      colorTextoBoton: '#ffffff'
    }
  ];

  // CATEGORÍAS
  const categorias = [
    {
      id: 'HG',
      titulo: 'HG (High Grade 1/144)',
      descripcion: 'La escala más popular y versátil. Modelos accesibles, fáciles de armar y con la mayor variedad de diseños del universo anime.',
      imagen: '/img/hg wing zero armado.webp',
      btn: 'Explorar HG'
    },
    {
      id: 'RG',
      titulo: 'RG (Real Grade 1/144)',
      descripcion: 'Ingeniería de precisión en tamaño compacto. Cuentan con un esqueleto interno avanzado y alto nivel de articulación y detalle.',
      imagen: '/img/God Gundam armado.jpg',
      btn: 'Explorar RG'
    },
    {
      id: '1/100',
      titulo: 'MG (Master Grade 1/100)',
      descripcion: 'Modelos de mayor tamaño y presencia. Armaduras desmontables, cabinas detalladas con piloto y pistones mecánicos móviles.',
      imagen: '/img/mg strike freedom armado.webp',
      btn: 'Explorar MG'
    },
    {
      id: '1/60',
      titulo: 'PG (Perfect Grade 1/60)',
      descripcion: 'La cúspide del modelismo Gunpla. Escala gigante, piezas metálicas, sistemas de iluminación LED y el máximo detalle posible.',
      imagen: '/img/unicorn rg pose.webp',
      btn: 'Explorar PG'
    }
  ];

  // ESTADOS
  const [slideActual, setSlideActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  // TEMPORIZADOR
  useEffect(() => {
    if (pausado) return;
    const intervalo = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(intervalo);
  }, [pausado, slides.length]);

  // CONTROLES DE NAVEGACIÓN
  const siguienteSlide = () => {
    setSlideActual((prev) => (prev + 1) % slides.length);
  };

  const anteriorSlide = () => {
    setSlideActual((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAction = (slide) => {
    if (slide.destino === 'especial' || slide.categoria === 'SPECIAL') {
      if (onNavigate) onNavigate('especial');
      return;
    }

    if (slide.categoria && onSelectCategory) {
      onSelectCategory(slide.categoria);
      if (onNavigate) onNavigate('catalogo');
      return;
    }

    if (onNavigate) {
      onNavigate(slide.destino || 'catalogo');
    }
  };

  // RENDER
  return (
    <main 
      style={{ 
        width: '100%', 
        margin: 0, 
        padding: 0, 
        flex: 1,
        backgroundColor: '#05070c' 
      }}
    >
      {/* CARRUSEL HERO */}
      <div 
        className="position-relative overflow-hidden w-100"
        style={{
          height: 'clamp(480px, 65vh, 680px)',
          backgroundColor: '#05070c'
        }}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        {slides.map((s, index) => {
          const esActivo = index === slideActual;
          return (
            <div
              key={s.id}
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center"
              style={{
                opacity: esActivo ? 1 : 0,
                transform: esActivo ? 'scale(1)' : 'scale(1.02)',
                transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                pointerEvents: esActivo ? 'auto' : 'none',
                zIndex: esActivo ? 1 : 0
              }}
            >
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  backgroundImage: `url("${s.fondo}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.7)'
                }}
              />
              
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'linear-gradient(90deg, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.65) 45%, rgba(5,7,12,0.15) 100%)'
                }}
              />

              <div 
                className="position-relative z-2"
                style={{ 
                  maxWidth: '1440px', 
                  width: '100%', 
                  margin: '0 auto', 
                  padding: '0 3rem' 
                }}
              >
                <div style={{ maxWidth: '620px' }}>
                  <span 
                    className="badge px-3 py-1 mb-2 fw-bold text-uppercase"
                    style={{
                      backgroundColor: s.colorBadge || '#00d2ff',
                      color: s.colorBadge === '#ff2a5f' ? '#ffffff' : '#05070c',
                      letterSpacing: '1px',
                      fontSize: '0.78rem',
                      boxShadow: `0 0 12px ${s.colorBadge || '#00d2ff'}`
                    }}
                  >
                    ⚡ {s.badge}
                  </span>

                  <h1 
                    className="fw-black text-white text-uppercase m-0 mb-2"
                    style={{ 
                      fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', 
                      lineHeight: '1.1',
                      letterSpacing: '1px',
                      textShadow: '0 0 25px rgba(0,0,0,0.9)'
                    }}
                  >
                    {s.titulo}
                  </h1>

                  <h3 
                    className="fw-bold mb-3"
                    style={{ 
                      color: s.destino === 'especial' ? '#ff2a5f' : '#00e5ff', 
                      fontSize: '1.2rem', 
                      letterSpacing: '0.5px' 
                    }}
                  >
                    {s.subtitulo}
                  </h3>

                  <p 
                    className="text-light mb-4" 
                    style={{ opacity: 0.9, lineHeight: '1.6', fontSize: '1rem' }}
                  >
                    {s.descripcion}
                  </p>

                  <button
                    type="button"
                    className="btn fw-bold px-4 py-3 text-uppercase"
                    style={{
                      backgroundColor: s.colorBoton || '#00d2ff',
                      color: s.colorTextoBoton || '#05070c',
                      boxShadow: `0 0 20px ${s.colorBoton || '#00d2ff'}88`,
                      borderRadius: '6px',
                      letterSpacing: '1px',
                      fontSize: '0.95rem',
                      border: 'none'
                    }}
                    onClick={() => handleAction(s)}
                  >
                    {s.botonTexto} →
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* CONTROLES FLECHAS */}
        <button
          type="button"
          onClick={anteriorSlide}
          aria-label="Anterior"
          className="position-absolute top-50 start-0 translate-middle-y btn p-0 m-3 border-0 z-3 text-white"
          style={{
            backgroundColor: 'rgba(5, 7, 12, 0.7)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            border: '1.5px solid #00d2ff',
            fontSize: '1.2rem'
          }}
        >
          ❮
        </button>

        <button
          type="button"
          onClick={siguienteSlide}
          aria-label="Siguiente"
          className="position-absolute top-50 end-0 translate-middle-y btn p-0 m-3 border-0 z-3 text-white"
          style={{
            backgroundColor: 'rgba(5, 7, 12, 0.7)',
            borderRadius: '50%',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)',
            border: '1.5px solid #00d2ff',
            fontSize: '1.2rem'
          }}
        >
          ❯
        </button>

        {/* INDICADORES */}
        <div 
          className="position-absolute bottom-0 start-50 translate-middle-x pb-4 d-flex gap-2 z-3"
        >
          {slides.map((s, idx) => {
            const activo = idx === slideActual;
            const esEspecial = s.destino === 'especial';
            const colorDot = esEspecial ? '#ff2a5f' : '#00d2ff';

            return (
              <button
                key={idx}
                type="button"
                aria-label={`Ir al slide ${idx + 1}`}
                onClick={() => setSlideActual(idx)}
                style={{
                  width: activo ? '32px' : '12px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: activo ? colorDot : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activo ? `0 0 12px ${colorDot}` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* SECCIÓN CATEGORÍAS */}
      <section 
        className="my-5"
        style={{ 
          maxWidth: '1440px', 
          width: '100%', 
          margin: '0 auto', 
          padding: '0 1.5rem' 
        }}
      >
        <div className="mb-4 pb-2" style={{ borderBottom: '2px solid #00d2ff' }}>
          <h3 className="fw-bold m-0 text-white" style={{ fontSize: '1.5rem', letterSpacing: '0.5px' }}>
            Categorías Disponibles
          </h3>
        </div>

        <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-4">
          {categorias.map((cat) => (
            <div key={cat.id} className="col">
              <div 
                className="h-100 rounded-3 p-3 d-flex flex-column justify-content-between"
                style={{
                  backgroundColor: '#070c12',
                  border: '1.5px solid #00d2ff',
                  boxShadow: '0 0 12px rgba(0, 210, 255, 0.12)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 210, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 210, 255, 0.12)';
                }}
              >
                <div 
                  className="rounded overflow-hidden mb-3 bg-black d-flex align-items-center justify-content-center"
                  style={{ height: '220px', border: '1px solid #1c2b3a' }}
                >
                  <img
                    src={cat.imagen}
                    alt={cat.titulo}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={(e) => { e.target.src = '/img/LOGO.png'; }}
                  />
                </div>

                <div className="mb-3">
                  <h5 className="fw-bold mb-2" style={{ color: '#00e5ff', fontSize: '1rem' }}>
                    {cat.titulo}
                  </h5>
                  <p className="text-light small m-0" style={{ opacity: 0.8, fontSize: '0.82rem', lineHeight: '1.4' }}>
                    {cat.descripcion}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-info w-100 btn-sm fw-bold mt-auto"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(cat.id);
                    if (onNavigate) onNavigate('catalogo');
                  }}
                >
                  {cat.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

export default Inicio;