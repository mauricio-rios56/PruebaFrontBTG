import { Component, inject, signal, OnInit } from '@angular/core';
import { FundService } from '../../core/services/fund.service';
import { ToastService } from '../../shared/services/toast.service';
import { CopCurrencyPipe } from '../../core/pipes/cop-currency.pipe';
import { Fund } from '../../core/models/fund.model';
import { SubscriptionModalComponent } from '../subscription-modal/subscription-modal.component';

@Component({
  selector: 'app-fund-list',
  standalone: true,
  imports: [CopCurrencyPipe, SubscriptionModalComponent],
  template: `
    <section class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Fondos disponibles</h1>
        <p class="text-gray-500 text-sm mt-1">Selecciona un fondo para suscribirte</p>
      </div>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-surface-border"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-surface-border rounded w-48"></div>
                  <div class="h-3 bg-surface-border rounded w-72"></div>
                </div>
                <div class="h-8 w-28 bg-surface-border rounded-lg"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Available funds grid -->
      @if (!loading()) {
        @if (funds().length > 0) {
          <div class="grid gap-4">
            @for (fund of funds(); track fund.id) {
              <div class="card group hover:border-btg-700 hover:shadow-glow transition-all duration-200">
                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                  <!-- Icon + badge -->
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-12 h-12 shrink-0 rounded-xl bg-btg-950 flex items-center justify-center border border-btg-800">
                      <svg class="w-6 h-6 text-btg-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h3 class="text-sm font-semibold text-white">{{ fund.name }}</h3>
                        <span class="badge bg-surface border border-surface-border text-gray-300">
                          ID {{ fund.id }}
                        </span>
                        <span class="badge" [class.badge-fpv]="fund.category === 'FPV'" [class.badge-fic]="fund.category === 'FIC'">
                          {{ fund.category }}
                        </span>
                        <span class="badge" [class]="riskClass(fund.riskLevel)">
                          {{ fund.riskLevel }}
                        </span>
                        @if (isSubscribed(fund.id)) {
                          <span class="badge bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Activo
                          </span>
                        }
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5 truncate">{{ fund.description }}</p>
                    </div>
                  </div>

                  <!-- Metrics -->
                  <div class="flex items-center gap-6">
                    <div class="text-center">
                      <p class="text-xs text-gray-500 uppercase tracking-wider">Mínimo</p>
                      <p class="text-sm font-semibold text-white mt-0.5">
                        {{ fund.minAmount | copCurrency }}
                      </p>
                    </div>
                    <div class="text-center">
                      <p class="text-xs text-gray-500 uppercase tracking-wider">Retorno</p>
                      <p class="text-sm font-semibold text-emerald-400 mt-0.5">{{ fund.returnRate }}% E.A.</p>
                    </div>
                    @if (isSubscribed(fund.id)) {
                      <button
                        type="button"
                        disabled
                        class="btn-secondary text-sm shrink-0 opacity-70 cursor-not-allowed"
                        title="Ya tienes una suscripción activa en este fondo"
                      >
                        Ya suscrito
                      </button>
                    } @else {
                      <button
                        (click)="openModal(fund)"
                        [disabled]="fundSvc.balance() < fund.minAmount"
                        class="btn-primary text-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        [title]="fundSvc.balance() < fund.minAmount ? 'Saldo insuficiente para este fondo' : 'Suscribirse'"
                      >
                        Suscribirse
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="card text-center py-10">
            <p class="text-white font-medium">No se encontraron fondos para mostrar</p>
            <p class="text-gray-500 text-sm mt-1">Verifica la carga del catálogo simulado</p>
          </div>
        }
      }

      <!-- Subscribed funds section -->
      @if (fundSvc.subscribedFunds().length > 0) {
        <div>
          <h2 class="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Mis suscripciones activas
          </h2>
          <div class="grid gap-3">
            @for (fund of fundSvc.subscribedFunds(); track fund.id) {
              <div class="card border-emerald-900/60">
                <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-10 h-10 shrink-0 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                      <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-sm font-semibold text-white truncate">{{ fund.name }}</h3>
                      <p class="text-xs text-gray-500">
                        {{ fund.subscribedAmount | copCurrency }} · {{ fund.returnRate }}% E.A.
                      </p>
                    </div>
                  </div>
                  <button
                    (click)="cancelFund(fund.id)"
                    [disabled]="cancellingId() === fund.id"
                    class="btn-danger text-sm shrink-0"
                  >
                    @if (cancellingId() === fund.id) {
                      <span class="flex items-center gap-2">
                        <span class="spinner-sm"></span> Cancelando…
                      </span>
                    } @else {
                      Cancelar suscripción
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </section>

    <!-- Subscription modal -->
    @if (selectedFund()) {
      <app-subscription-modal
        [fund]="selectedFund()!"
        (confirmed)="onSubscriptionConfirmed()"
        (cancelled)="closeModal()"
      />
    }
  `,
})
export class FundListComponent implements OnInit {
  readonly fundSvc   = inject(FundService);
  readonly toastSvc  = inject(ToastService);

  // La pantalla mantiene una copia local del catálogo para que la lista completa
  // siga visible, incluso cuando el usuario ya tiene fondos activos.
  readonly funds        = signal<Fund[]>([]);
  readonly loading      = signal(true);
  readonly selectedFund = signal<Fund | null>(null);
  readonly cancellingId = signal<string | null>(null);

  ngOnInit(): void {
    this.fundSvc.getFunds().subscribe(funds => {
      this.funds.set(funds);
      this.loading.set(false);
    });
  }

  openModal(fund: Fund): void {
    this.selectedFund.set(fund);
  }

  closeModal(): void {
    this.selectedFund.set(null);
  }

  onSubscriptionConfirmed(): void {
    this.selectedFund.set(null);
  }

  isSubscribed(fundId: string): boolean {
    // Permite cambiar el CTA y el estado visual sin quitar la tarjeta del catálogo.
    return this.fundSvc.subscribedFunds().some(fund => fund.id === fundId);
  }

  cancelFund(fundId: string): void {
    this.cancellingId.set(fundId);
    this.fundSvc.cancel(fundId, 'EMAIL').subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.toastSvc.success('Suscripción cancelada. El monto ha sido reintegrado a tu saldo.');
      },
      error: (err: Error) => {
        this.cancellingId.set(null);
        this.toastSvc.error(err.message);
      },
    });
  }

  riskClass(level: string): string {
    const map: Record<string, string> = {
      Bajo:  'badge-risk-low',
      Medio: 'badge-risk-mid',
      Alto:  'badge-risk-high',
    };
    return map[level] ?? '';
  }
}
