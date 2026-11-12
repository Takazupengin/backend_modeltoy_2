import { useState, useRef, useEffect } from 'react';
import { formatearPrecioCLP } from '../data/productos';

export function ProductCard({ item, onAddToCart }) {
  // ESTADOS Y REFERENCIAS
  const [fotoIndex, setFotoIndex] = useState(0);
  const hoverTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  // NORMALIZACIÓN DE IMÁGENES
  const imagenes = (item.imagenes && item.imagenes.length > 0)
    ? item.imagenes.map(img => img.startsWith('/') ? img : `/${img}`)
    : ['/img/LOGO.png'];

  // EVENTOS HOVER
  const handleMouseEnter = () => {
    if (imagenes.length <= 1) return;

    hoverTimeoutRef.current = setTimeout(() => {
      setFotoIndex((prev) => (prev + 1) % imagenes.length);

      intervalRef.current = setInterval(() => {
        setFotoIndex((prev) => (prev + 1) % imagenes.length);
      }, 1000);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFotoIndex(0);
  };

  // LIMPIEZA
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // RENDER
  return (
    <div 
      className="card h-100 bg-black text-light p-2 d-flex flex-column"
      style={{
        border: '1.5px solid #00d2ff',
        boxShadow: '0 0 10px rgba(0, 210, 255, 0.15)',
        borderRadius: '8px'
      }}
    >
      {/* VISTA PREVIA Y ESCALA */}
      <div 
        className="position-relative d-flex align-items-center justify-content-center rounded overflow-hidden mb-2"
        style={{ 
          height: '210px', 
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          padding: '8px',
          cursor: imagenes.length > 1 ? 'pointer' : 'default'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={imagenes[fotoIndex]}
          alt={item.nombre}
          style={{ 
            maxHeight: '100%', 
            maxWidth: '100%', 
            objectFit: 'contain', 
            borderRadius: '4px',
            transition: 'opacity 0.25s ease-in-out'
          }}
          onError={(e) => {
            e.target.src = '/img/LOGO.png';
          }}
        />

        <span 
          className="position-absolute top-0 start-0 m-2 badge"
          style={{ backgroundColor: '#0072ff', fontSize: '0.75rem', zIndex: 2 }}
        >
          {item.grade}
        </span>
      </div>

      {/* DETALLES */}
      <div className="card-body d-flex flex-column p-2 pt-2">
        <h5 
          className="fw-bold fs-6 mb-2" 
          style={{ color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.3)' }}
        >
          {item.nombre}
        </h5>

        <p 
          className="small flex-grow-1 mb-3" 
          style={{ 
            color: '#cbd5e1', 
            fontSize: '0.84rem', 
            lineHeight: '1.45', 
            minHeight: '44px',
            fontWeight: '400'
          }}
        >
          {item.descripcion}
        </p>

        {/* ACCIONES Y PRECIO */}
        <div className="mt-auto pt-2 border-top border-secondary d-flex justify-content-between align-items-center">
          <span className="fs-5 fw-bold text-white">
            {formatearPrecioCLP(item.precio)}
          </span>
          <button
            type="button"
            className="btn btn-sm fw-semibold"
            style={{
              border: '1px solid #00d2ff',
              color: '#00e5ff',
              backgroundColor: 'rgba(0, 210, 255, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00d2ff';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 210, 255, 0.08)';
              e.currentTarget.style.color = '#00e5ff';
            }}
            onClick={() => onAddToCart(item)}
          >
            + Carro
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;