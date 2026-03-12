import { computed, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { SubscribedFund } from '../../core/models/fund.model';
import { FundService } from '../../core/services/fund.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  function createFundService(subscribedFunds: SubscribedFund[] = []): FundService {
    const balance = signal(500_000);
    const subscribedFundsSignal = signal(subscribedFunds);

    return {
      balance,
      subscribedFunds: subscribedFundsSignal,
      totalInvested: computed(() =>
        subscribedFundsSignal().reduce((sum, fund) => sum + fund.subscribedAmount, 0)
      ),
    } as unknown as FundService;
  }

  it('renders the empty state when the user has no active funds', async () => {
    await render(DashboardComponent, {
      providers: [
        provideRouter([]),
        { provide: FundService, useValue: createFundService() },
      ],
    });

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/sin inversiones activas/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorar fondos/i })).toHaveAttribute('href', '/funds');
  });

  it('renders active fund summary and investment totals', async () => {
    const subscribedFunds: SubscribedFund[] = [
      {
        id: 'FPV_BTG_PACTUAL_RECAUDADORA',
        name: 'FPV BTG Pactual Recaudadora',
        minAmount: 75_000,
        category: 'FPV',
        description: 'Fondo de prueba',
        riskLevel: 'Bajo',
        returnRate: 11.5,
        subscribedAmount: 125_000,
        subscribedAt: new Date('2026-03-12T08:15:00'),
      },
    ];

    await render(DashboardComponent, {
      providers: [
        provideRouter([]),
        { provide: FundService, useValue: createFundService(subscribedFunds) },
      ],
    });

    expect(screen.getByText(/fondos activos/i)).toBeInTheDocument();
    expect(screen.getByText('FPV BTG Pactual Recaudadora')).toBeInTheDocument();
    expect(screen.getByText(/1 fondo\(s\) activos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/125\.000/)).toHaveLength(2);
    expect(screen.getByRole('link', { name: /ver todos los fondos/i })).toHaveAttribute('href', '/funds');
  });
});