import { signal } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { of } from 'rxjs';
import { Fund } from '../../core/models/fund.model';
import { Transaction } from '../../core/models/transaction.model';
import { FundService } from '../../core/services/fund.service';
import { ToastService } from '../../shared/services/toast.service';
import { SubscriptionModalComponent } from './subscription-modal.component';

describe('SubscriptionModalComponent', () => {
  const fund: Fund = {
    id: 'FPV_BTG_PACTUAL_RECAUDADORA',
    name: 'FPV BTG Pactual Recaudadora',
    minAmount: 75_000,
    category: 'FPV',
    description: 'Fondo de prueba',
    riskLevel: 'Bajo',
    returnRate: 11.5,
  };

  function createToastService(): jest.Mocked<Pick<ToastService, 'success' | 'error'>> {
    return {
      success: jest.fn(),
      error: jest.fn(),
    };
  }

  function createFundService(overrides: Partial<FundService> = {}): FundService {
    return {
      balance: signal(500_000),
      subscribe: jest.fn(),
      ...overrides,
    } as unknown as FundService;
  }

  it('shows a validation message when the amount is below the fund minimum', async () => {
    const fundService = createFundService();
    const toastService = createToastService();

    await render(SubscriptionModalComponent, {
      componentInputs: { fund },
      providers: [
        { provide: FundService, useValue: fundService },
        { provide: ToastService, useValue: toastService },
      ],
    });

    const amountInput = screen.getByLabelText(/monto a invertir/i);

    fireEvent.input(amountInput, {
      target: { value: 50_000 },
    });
    fireEvent.blur(amountInput);

    expect(screen.getByText(/monto m[ií]nimo/i)).toBeInTheDocument();
    expect((fundService.subscribe as jest.Mock)).not.toHaveBeenCalled();
  });

  it('submits the selected notification method and shows success feedback', async () => {
    const transaction: Transaction = {
      id: 'TX-1',
      fundId: fund.id,
      fundName: fund.name,
      type: 'SUBSCRIPTION',
      amount: 120_000,
      notificationMethod: 'SMS',
      createdAt: new Date('2026-03-12T10:00:00'),
    };

    const fundService = createFundService({
      subscribe: jest.fn().mockReturnValue(of(transaction)),
    });
    const toastService = createToastService();

    await render(SubscriptionModalComponent, {
      componentInputs: { fund },
      providers: [
        { provide: FundService, useValue: fundService },
        { provide: ToastService, useValue: toastService },
      ],
    });

    fireEvent.click(screen.getByRole('radio', { name: /sms/i }));
    fireEvent.input(screen.getByLabelText(/monto a invertir/i), {
      target: { value: 120_000 },
    });
    fireEvent.click(screen.getByRole('button', { name: /confirmar suscripci[oó]n/i }));

    expect((fundService.subscribe as jest.Mock)).toHaveBeenCalledWith(fund, 120_000, 'SMS');
    expect(toastService.success).toHaveBeenCalledWith(expect.stringMatching(/suscripci[oó]n exitosa/i));
  });
});