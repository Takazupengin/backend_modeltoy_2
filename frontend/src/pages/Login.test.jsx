import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
describe('Autenticación remota', () => {
  it('envía credenciales al servidor en lugar de validar usuarios locales', async () => {
    const onAuthenticate = vi.fn().mockResolvedValue({});
    const user = userEvent.setup();
    render(<Login onAuthenticate={onAuthenticate} />);
    await user.type(screen.getByLabelText(/Correo Electrónico/), 'PILOTO@example.cl');
    await user.type(screen.getByLabelText(/Contraseña/), 'clave-segura');
    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));
    expect(onAuthenticate).toHaveBeenCalledWith({ correo: 'piloto@example.cl', password: 'clave-segura' }, false);
  });
  it('conserva el formulario y muestra un rechazo del servidor', async () => {
    const user = userEvent.setup();
    render(<Login onAuthenticate={vi.fn().mockRejectedValue(new Error('Correo o contraseña incorrectos'))} />);
    await user.type(screen.getByLabelText(/Correo Electrónico/), 'piloto@example.cl');
    await user.type(screen.getByLabelText(/Contraseña/), 'clave-segura');
    await user.click(screen.getByRole('button', { name: 'Ingresar al Sistema' }));
    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/)).toHaveValue('piloto@example.cl');
  });
});
