import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Fund, SubscribedFund } from '../models/fund.model';
import { Transaction, NotificationMethod } from '../models/transaction.model';
import {
  MockFundsApiService,
  MockTransactionResponse,
} from './mock-funds-api.service';

const INITIAL_BALANCE = 500_000;

@Injectable({ providedIn: 'root' })
export class FundService {
  // Mantiene el transporte mock separado del estado de dominio que maneja la app.
  private readonly mockApi = inject(MockFundsApiService);

  // ── Señales ────────────────────────────────────────────────────────────────
  readonly balance = signal<number>(INITIAL_BALANCE);
  readonly catalog = signal<Fund[]>([]);
  readonly subscribedFunds = signal<SubscribedFund[]>([]);
  readonly transactions = signal<Transaction[]>([]);

  // ── Estado derivado / computado ────────────────────────────────────────────
  readonly totalInvested = computed(() =>
    this.subscribedFunds().reduce((sum, f) => sum + f.subscribedAmount, 0)
  );

  readonly availableFunds = computed(() => {
    // Vista derivada usada por componentes que solo necesitan fondos no suscritos.
    const subscribedIds = new Set(this.subscribedFunds().map(f => f.id));
    return this.catalog().filter(f => !subscribedIds.has(f.id));
  });

  // ── API pública ────────────────────────────────────────────────────────────

  /** Retorna el catálogo de fondos completo simulando un HTTP GET. */
  getFunds(): Observable<Fund[]> {
    return this.mockApi.getFunds().pipe(
      // Mantiene el catálogo en memoria para que todas las vistas lean la misma fuente de verdad.
      tap(funds => this.catalog.set(funds))
    );
  }

  /** Suscribe a un fondo y retorna la transacción creada o un error. */
  subscribe(
    fund: Fund,
    amount: number,
    notificationMethod: NotificationMethod
  ): Observable<Transaction> {
    const validationError = this.validateSubscription(fund, amount);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    return this.mockApi.subscribe(fund, amount, notificationMethod).pipe(
      map(response => this.mapTransaction(response)),
      tap(response => {
        // Aplica la transición de negocio solo cuando la API simulada responde con éxito.
        this.balance.update(b => b - amount);
        this.subscribedFunds.update(list => [
          ...list,
          { ...fund, subscribedAmount: amount, subscribedAt: new Date() },
        ]);
        this.transactions.update(list => [response, ...list]);
      })
    );
  }

  /** Cancela una suscripción y retorna la transacción creada o un error. */
  cancel(
    fundId: string,
    notificationMethod: NotificationMethod
  ): Observable<Transaction> {
    const subscribed = this.subscribedFunds().find(f => f.id === fundId);
    if (!subscribed) {
      return throwError(() => new Error('No se encontró la suscripción activa.'));
    }

    return this.mockApi.cancel(subscribed, notificationMethod).pipe(
      map(response => this.mapTransaction(response)),
      tap(response => {
        // La cancelación devuelve el valor invertido al saldo principal.
        this.balance.update(b => b + subscribed.subscribedAmount);
        this.subscribedFunds.update(list => list.filter(f => f.id !== fundId));
        this.transactions.update(list => [response, ...list]);
      })
    );
  }

  // ── Helpers privados ───────────────────────────────────────────────────────

  private validateSubscription(fund: Fund, amount: number): string | null {
    if (amount < fund.minAmount) {
      return `El monto mínimo para "${fund.name}" es ${new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0,
      }).format(fund.minAmount)}.`;
    }
    if (amount > this.balance()) {
      return `Saldo insuficiente. Tu saldo disponible es ${new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0,
      }).format(this.balance())}.`;
    }
    return null;
  }

  private mapTransaction(response: MockTransactionResponse): Transaction {
    return {
      id: response.id,
      fundId: response.fundId,
      fundName: response.fundName,
      type: response.type,
      amount: response.amount,
      notificationMethod: response.notificationMethod,
      createdAt: new Date(response.createdAt),
    };
  }
}
