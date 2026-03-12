import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FundService } from '../../core/services/fund.service';
import { CopCurrencyPipe } from '../../core/pipes/cop-currency.pipe';
import { Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CopCurrencyPipe, DatePipe],
  template: `
    <section class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-white">Historial de transacciones</h1>
        <p class="text-gray-500 text-sm mt-1">Registro de suscripciones y cancelaciones</p>
      </div>

      @if (fundSvc.transactions().length === 0) {
        <div class="card flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-surface-border flex items-center justify-center mb-4">
            <svg class="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-white font-medium">Sin transacciones aún</p>
          <p class="text-gray-500 text-sm mt-1">Las operaciones aparecerán aquí</p>
        </div>
      } @else {
        <!-- Stats row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="card text-center py-3">
            <p class="text-2xl font-bold text-white">{{ fundSvc.transactions().length }}</p>
            <p class="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Total</p>
          </div>
          <div class="card text-center py-3">
            <p class="text-2xl font-bold text-btg-400">{{ countByType('SUBSCRIPTION') }}</p>
            <p class="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Suscripciones</p>
          </div>
          <div class="card text-center py-3">
            <p class="text-2xl font-bold text-amber-400">{{ countByType('CANCELLATION') }}</p>
            <p class="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Cancelaciones</p>
          </div>
          <div class="card text-center py-3">
            <p class="text-sm font-bold text-emerald-400">{{ totalSubscribed() | copCurrency }}</p>
            <p class="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">Invertido</p>
          </div>
        </div>

        <!-- Transactions list -->
        <div class="card overflow-hidden p-0">
          <div class="divide-y divide-surface-border">
            @for (tx of fundSvc.transactions(); track tx.id) {
              <div class="flex flex-col gap-3 px-4 py-4 hover:bg-surface-border/30 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                <div class="flex items-start gap-3 sm:flex-1 sm:min-w-0 sm:items-center">
                  <!-- Type indicator -->
                  <div
                    class="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
                    [class.bg-btg-950]="tx.type === 'SUBSCRIPTION'"
                    [class.border-btg-800]="tx.type === 'SUBSCRIPTION'"
                    [class.bg-amber-950]="tx.type === 'CANCELLATION'"
                    [class.border-amber-800]="tx.type === 'CANCELLATION'"
                    [class.border]="true"
                  >
                    @if (tx.type === 'SUBSCRIPTION') {
                      <svg class="w-5 h-5 text-btg-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                      </svg>
                    }
                  </div>

                  <!-- Info -->
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-white break-words sm:truncate">{{ tx.fundName }}</p>
                    <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        class="text-xs font-medium"
                        [class.text-btg-400]="tx.type === 'SUBSCRIPTION'"
                        [class.text-amber-400]="tx.type === 'CANCELLATION'"
                      >
                        {{ tx.type === 'SUBSCRIPTION' ? 'Suscripción' : 'Cancelación' }}
                      </span>
                      <span class="hidden text-gray-600 sm:inline">·</span>
                      <span class="text-xs text-gray-500">
                        {{ tx.notificationMethod === 'EMAIL' ? '✉️ Email' : '📱 SMS' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Amount + date -->
                <div class="border-t border-surface-border pt-3 sm:shrink-0 sm:border-t-0 sm:pt-0 sm:text-right">
                  <p
                    class="text-sm font-semibold"
                    [class.text-emerald-400]="tx.type === 'SUBSCRIPTION'"
                    [class.text-red-400]="tx.type === 'CANCELLATION'"
                  >
                    {{ tx.type === 'CANCELLATION' ? '+' : '-' }}{{ tx.amount | copCurrency }}
                  </p>
                  <p class="text-xs text-gray-600 mt-0.5">{{ tx.createdAt | date:'dd/MM/yy HH:mm' }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ID ref note -->
        <p class="text-xs text-gray-600 text-center">
          Los IDs de transacción son generados localmente en esta sesión.
        </p>
      }
    </section>
  `,
})
export class TransactionHistoryComponent {
  readonly fundSvc = inject(FundService);

  countByType(type: Transaction['type']): number {
    return this.fundSvc.transactions().filter(t => t.type === type).length;
  }

  totalSubscribed(): number {
    return this.fundSvc.transactions()
      .filter(t => t.type === 'SUBSCRIPTION')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
