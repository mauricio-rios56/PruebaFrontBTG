import { signal } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { of } from 'rxjs';
import { Fund, SubscribedFund } from '../../core/models/fund.model';
import { Transaction } from '../../core/models/transaction.model';
import { FundService } from '../../core/services/fund.service';
import { ToastService } from '../../shared/services/toast.service';
import { FundListComponent } from './fund-list.component';

describe('FundListComponent', () => {
  const availableFund: Fund = {
    id: 'FPV_BTG_PACTUAL_DINAMICA',
    name: 'FPV BTG Pactual Dinámica',
    minAmount: 100_000,
    category: 'FPV',
    description: 'Fondo dinámico de prueba',
    riskLevel: 'Bajo',
    returnRate: 12.1,
  };

  const subscribedFund: SubscribedFund = {
    id: 'DEUDAPRIVADA',
    name: 'FPV BTG Pactual Deuda Privada',
    minAmount: 50_000,
    category: 'FIC',
    description: 'Fondo suscrito de prueba',
    riskLevel: 'Medio',
    returnRate: 14.8,
    subscribedAmount: 80_000,
    subscribedAt: new Date('2026-03-12T09:00:00'),
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
      availableFunds: signal([availableFund]),
      subscribedFunds: signal([subscribedFund]),
      getFunds: jest.fn().mockReturnValue(of([availableFund, subscribedFund])),
      cancel: jest.fn(),
      ...overrides,
    } as unknown as FundService;
  }

  it('renders the complete catalog with visible fund IDs and active subscriptions', async () => {
    const fundService = createFundService();
    const toastService = createToastService();

    await render(FundListComponent, {
      providers: [
        { provide: FundService, useValue: fundService },
        { provide: ToastService, useValue: toastService },
      ],
    });

    expect(screen.getByText(/fondos disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(availableFund.name)).toBeInTheDocument();
    expect(screen.getByText(`ID ${availableFund.id}`)).toBeInTheDocument();
    expect(screen.getByText(`ID ${subscribedFund.id}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ya suscrito/i })).toBeDisabled();
    expect(screen.getByText(/mis suscripciones activas/i)).toBeInTheDocument();
    expect(screen.getAllByText(subscribedFund.name)).toHaveLength(2);
  });

  it('cancels an active subscription and shows success feedback', async () => {
    const transaction: Transaction = {
      id: 'TX-2',
      fundId: subscribedFund.id,
      fundName: subscribedFund.name,
      type: 'CANCELLATION',
      amount: subscribedFund.subscribedAmount,
      notificationMethod: 'EMAIL',
      createdAt: new Date('2026-03-12T11:00:00'),
    };

    const fundService = createFundService({
      cancel: jest.fn().mockReturnValue(of(transaction)),
    });
    const toastService = createToastService();

    await render(FundListComponent, {
      providers: [
        { provide: FundService, useValue: fundService },
        { provide: ToastService, useValue: toastService },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /cancelar suscripci[oó]n/i }));

    expect((fundService.cancel as jest.Mock)).toHaveBeenCalledWith(subscribedFund.id, 'EMAIL');
    expect(toastService.success).toHaveBeenCalledWith(
      expect.stringMatching(/monto ha sido reintegrado/i)
    );
  });
});