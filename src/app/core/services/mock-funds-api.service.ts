import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Fund, SubscribedFund } from '../models/fund.model';
import { NotificationMethod, TransactionType } from '../models/transaction.model';

export interface MockTransactionResponse {
  id: string;
  fundId: string;
  fundName: string;
  type: TransactionType;
  amount: number;
  notificationMethod: NotificationMethod;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MockFundsApiService {
  private readonly http = inject(HttpClient);

  getFunds(): Observable<Fund[]> {
    // El JSON local mantiene el contrato explícito sin requerir infraestructura externa.
    return this.http.get<Fund[]>('/mock-api/funds.json').pipe(delay(400));
  }

  subscribe(
    fund: Fund,
    amount: number,
    notificationMethod: NotificationMethod
  ): Observable<MockTransactionResponse> {
    // Simula el payload de respuesta REST para el endpoint de suscripción.
    return of({
      id: this.generateId(),
      fundId: fund.id,
      fundName: fund.name,
      type: 'SUBSCRIPTION' as const,
      amount,
      notificationMethod,
      createdAt: new Date().toISOString(),
    }).pipe(delay(800));
  }

  cancel(
    fund: SubscribedFund,
    notificationMethod: NotificationMethod
  ): Observable<MockTransactionResponse> {
    // Replica la forma de respuesta de cancelación que luego el dominio mapea a Transaction.
    return of({
      id: this.generateId(),
      fundId: fund.id,
      fundName: fund.name,
      type: 'CANCELLATION' as const,
      amount: fund.subscribedAmount,
      notificationMethod,
      createdAt: new Date().toISOString(),
    }).pipe(delay(600));
  }

  private generateId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
}