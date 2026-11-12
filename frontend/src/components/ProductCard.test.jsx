import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from './ProductCard.jsx';
import { formatearPrecioCLP } from '../data/productos';

const item = {
  id: 'RX-78-2',
  nombre: 'RX-78-2 Gundam',
  descripcion: 'Kit clásico escala RG',
  precio: 42990,
  grade: 'RG',
  imagenes: ['img/a.png', 'img/b.png'],
};

describe('ProductCard', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Renderizado correcto + props
  it('renderiza nombre, descripción, grado y precio recibidos', () => {
    render(<ProductCard item={item} onAddToCart={() => {}} />);

    expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
    expect(screen.getByText('Kit clásico escala RG')).toBeInTheDocument();
    expect(screen.getByText('RG')).toBeInTheDocument();
    expect(screen.getByText(formatearPrecioCLP(42990))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Carro' })).toBeInTheDocument();
  });

  // Renderizado condicional
  it('usa la imagen de respaldo cuando el producto no trae imágenes', () => {
    render(<ProductCard item={{ ...item, imagenes: [] }} onAddToCart={() => {}} />);

    expect(screen.getByAltText('RX-78-2 Gundam')).toHaveAttribute('src', '/img/LOGO.png');
  });

  // Renderizado condicional
  it('no cambia la imagen al pasar el mouse si hay una sola', () => {
    vi.useFakeTimers();
    render(
      <ProductCard item={{ ...item, imagenes: ['img/a.png'] }} onAddToCart={() => {}} />,
    );
    const img = screen.getByAltText('RX-78-2 Gundam');

    fireEvent.mouseEnter(img.parentElement);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(img).toHaveAttribute('src', '/img/a.png');
  });

  // Estado
  it('cambia de imagen al pasar el mouse y vuelve a la primera al salir', () => {
    vi.useFakeTimers();
    render(<ProductCard item={item} onAddToCart={() => {}} />);
    const img = screen.getByAltText('RX-78-2 Gundam');
    const zona = img.parentElement;

    expect(img).toHaveAttribute('src', '/img/a.png');

    fireEvent.mouseEnter(zona);
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(img).toHaveAttribute('src', '/img/b.png');

    fireEvent.mouseLeave(zona);
    expect(img).toHaveAttribute('src', '/img/a.png');
  });

  // Eventos + props
  it('llama a onAddToCart con el producto al hacer clic en "+ Carro"', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    render(<ProductCard item={item} onAddToCart={onAddToCart} />);

    await user.click(screen.getByRole('button', { name: '+ Carro' }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(item);
  });
});