import { signal } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/toast.service';

describe('ToastComponent', () => {
  it('renders active toasts with their messages and icons', async () => {
    const toastService = {
      toasts: signal([
        { id: 1, message: 'Suscripción exitosa', type: 'success' as const },
        { id: 2, message: 'Saldo insuficiente', type: 'error' as const },
      ]),
      dismiss: jest.fn(),
    };

    await render(ToastComponent, {
      providers: [{ provide: ToastService, useValue: toastService }],
    });

    expect(screen.getByText('Suscripción exitosa')).toBeInTheDocument();
    expect(screen.getByText('Saldo insuficiente')).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('dismisses a toast when the close button is clicked', async () => {
    const toastService = {
      toasts: signal([
        { id: 7, message: 'Operación completada', type: 'info' as const },
      ]),
      dismiss: jest.fn(),
    };

    await render(ToastComponent, {
      providers: [{ provide: ToastService, useValue: toastService }],
    });

    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(toastService.dismiss).toHaveBeenCalledWith(7);
  });
});