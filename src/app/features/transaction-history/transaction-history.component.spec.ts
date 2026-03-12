import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { Transaction } from '../../core/models/transaction.model';
import { FundService } from '../../core/services/fund.service';
import { TransactionHistoryComponent } from './transaction-history.component';

describe('TransactionHistoryComponent', () => {
  function createFundService(transactions: Transaction[]): FundService {
    return {
      transactions: signal(transactions),
    } as unknown as FundService;
  }

  it('renders the empty state when there are no transactions', async () => {
    await render(TransactionHistoryComponent, {
      providers: [{ provide: FundService, useValue: createFundService([]) }],
    });

    expect(screen.getByText(/sin transacciones a[uú]n/i)).toBeInTheDocument();
  });

  it('renders transaction details including notification method', async () => {
    const transactions: Transaction[] = [
      {
        id: 'TX-3',
        fundId: 'FPV_BTG_PACTUAL_ECOPETROL',
        fundName: 'FPV BTG Pactual Ecopetrol',
        type: 'SUBSCRIPTION',
        amount: 125_000,
        notificationMethod: 'EMAIL',
        createdAt: new Date('2026-03-12T08:00:00'),
      },
      {
        id: 'TX-4',
        fundId: 'FDO-ACCIONES',
        fundName: 'FIC BTG Pactual Renta Variable',
        type: 'CANCELLATION',
        amount: 250_000,
        notificationMethod: 'SMS',
        createdAt: new Date('2026-03-12T09:30:00'),
      },
    ];

    await render(TransactionHistoryComponent, {
      providers: [{ provide: FundService, useValue: createFundService(transactions) }],
    });

    expect(screen.getByText('FPV BTG Pactual Ecopetrol')).toBeInTheDocument();
    expect(screen.getByText('FIC BTG Pactual Renta Variable')).toBeInTheDocument();
    expect(screen.getByText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/sms/i)).toBeInTheDocument();
    expect(screen.getAllByText(/125\.000/)).toHaveLength(2);
    expect(screen.getByText(/250\.000/)).toBeInTheDocument();
  });
});