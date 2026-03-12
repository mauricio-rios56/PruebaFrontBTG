import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { Fund, SubscribedFund } from '../models/fund.model';
import { MockFundsApiService, MockTransactionResponse } from './mock-funds-api.service';
import { FundService } from './fund.service';

describe('FundService', () => {
  const catalog: Fund[] = [
    {
      id: 'FPV_BTG_PACTUAL_RECAUDADORA',
      name: 'FPV BTG Pactual Recaudadora',
      minAmount: 75_000,
      category: 'FPV',
      description: 'Fondo de prueba 1',
      riskLevel: 'Bajo',
      returnRate: 11.5,
    },
    {
      id: 'FDO-ACCIONES',
      name: 'FIC BTG Pactual Renta Variable',
      minAmount: 250_000,
      category: 'FIC',
      description: 'Fondo de prueba 2',
      riskLevel: 'Alto',
      returnRate: 18.5,
    },
  ];

  const subscriptionResponse: MockTransactionResponse = {
    id: 'TX-100',
    fundId: catalog[0].id,
    fundName: catalog[0].name,
    type: 'SUBSCRIPTION',
    amount: 125_000,
    notificationMethod: 'SMS',
    createdAt: '2026-03-12T10:00:00.000Z',
  };

  let service: FundService;
  let mockApi: {
    getFunds: jest.Mock;
    subscribe: jest.Mock;
    cancel: jest.Mock;
  };

  function setupService(): void {
    mockApi = {
      getFunds: jest.fn(),
      subscribe: jest.fn(),
      cancel: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FundService,
        { provide: MockFundsApiService, useValue: mockApi },
      ],
    });

    service = TestBed.inject(FundService);
  }

  beforeEach(() => {
    setupService();
  });

  it('loads the catalog from the mock API and caches it in state', async () => {
    mockApi.getFunds.mockReturnValueOnce(of(catalog));

    const funds = await firstValueFrom(service.getFunds());

    expect(funds).toEqual(catalog);
    expect(service.catalog()).toEqual(catalog);
    expect(mockApi.getFunds).toHaveBeenCalledTimes(1);
  });

  it('subscribes successfully and updates balance, active funds and transactions', async () => {
    service.catalog.set(catalog);
    mockApi.subscribe.mockReturnValueOnce(of(subscriptionResponse));

    const transaction = await firstValueFrom(
      service.subscribe(catalog[0], subscriptionResponse.amount, 'SMS')
    );

    expect(transaction).toMatchObject({
      id: subscriptionResponse.id,
      fundId: catalog[0].id,
      type: 'SUBSCRIPTION',
      amount: 125_000,
      notificationMethod: 'SMS',
    });
    expect(transaction.createdAt).toBeInstanceOf(Date);
    expect(service.balance()).toBe(375_000);
    expect(service.subscribedFunds()).toHaveLength(1);
    expect(service.subscribedFunds()[0]).toMatchObject({
      id: catalog[0].id,
      subscribedAmount: 125_000,
    });
    expect(service.transactions()).toHaveLength(1);
    expect(service.totalInvested()).toBe(125_000);
    expect(service.availableFunds()).toEqual([catalog[1]]);
    expect(mockApi.subscribe).toHaveBeenCalledWith(catalog[0], 125_000, 'SMS');
  });

  it('rejects subscriptions below the minimum amount', async () => {
    await expect(firstValueFrom(service.subscribe(catalog[0], 50_000, 'EMAIL'))).rejects.toThrow(
      /monto m[ií]nimo/i
    );

    expect(mockApi.subscribe).not.toHaveBeenCalled();
    expect(service.balance()).toBe(500_000);
    expect(service.subscribedFunds()).toHaveLength(0);
  });

  it('rejects subscriptions when the user does not have enough balance', async () => {
    await expect(firstValueFrom(service.subscribe(catalog[1], 600_000, 'EMAIL'))).rejects.toThrow(
      /saldo insuficiente/i
    );

    expect(mockApi.subscribe).not.toHaveBeenCalled();
    expect(service.balance()).toBe(500_000);
  });

  it('cancels an active subscription and restores the balance', async () => {
    const activeFund: SubscribedFund = {
      ...catalog[0],
      subscribedAmount: 125_000,
      subscribedAt: new Date('2026-03-12T09:00:00.000Z'),
    };

    service.balance.set(375_000);
    service.subscribedFunds.set([activeFund]);
    service.transactions.set([
      {
        id: subscriptionResponse.id,
        fundId: activeFund.id,
        fundName: activeFund.name,
        type: 'SUBSCRIPTION',
        amount: activeFund.subscribedAmount,
        notificationMethod: 'EMAIL',
        createdAt: new Date(subscriptionResponse.createdAt),
      },
    ]);

    const cancelResponse: MockTransactionResponse = {
      id: 'TX-101',
      fundId: activeFund.id,
      fundName: activeFund.name,
      type: 'CANCELLATION',
      amount: activeFund.subscribedAmount,
      notificationMethod: 'EMAIL',
      createdAt: '2026-03-12T11:00:00.000Z',
    };
    mockApi.cancel.mockReturnValueOnce(of(cancelResponse));

    const transaction = await firstValueFrom(service.cancel(activeFund.id, 'EMAIL'));

    expect(transaction).toMatchObject({
      id: 'TX-101',
      type: 'CANCELLATION',
      amount: 125_000,
    });
    expect(service.balance()).toBe(500_000);
    expect(service.subscribedFunds()).toHaveLength(0);
    expect(service.transactions()[0]).toMatchObject({ id: 'TX-101', type: 'CANCELLATION' });
    expect(mockApi.cancel).toHaveBeenCalledWith(activeFund, 'EMAIL');
  });

  it('rejects cancellation when the fund is not subscribed', async () => {
    await expect(firstValueFrom(service.cancel('UNKNOWN', 'EMAIL'))).rejects.toThrow(
      /no se encontr[oó] la suscripci[oó]n activa/i
    );

    expect(mockApi.cancel).not.toHaveBeenCalled();
  });
});