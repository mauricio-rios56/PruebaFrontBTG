import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FundService } from '../../core/services/fund.service';
import { CopCurrencyPipe } from '../../core/pipes/cop-currency.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CopCurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-surface-muted text-sm mt-1">Resumen de tu portafolio BTG Pactual</p>
      </div>

      <!-- KPI cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Saldo disponible -->
        <div class="card card-glow">
          <p class="kpi-label">Saldo disponible</p>
          <p class="kpi-value text-btg-400">{{ fundSvc.balance() | copCurrency }}</p>
          <p class="kpi-sub">Listo para invertir</p>
        </div>

        <!-- Total invertido -->
        <div class="card">
          <p class="kpi-label">Total invertido</p>
          <p class="kpi-value text-emerald-400">{{ fundSvc.totalInvested() | copCurrency }}</p>
          <p class="kpi-sub">{{ fundSvc.subscribedFunds().length }} fondo(s) activos</p>
        </div>

        <!-- Patrimonio total -->
        <div class="card">
          <p class="kpi-label">Patrimonio total</p>
          <p class="kpi-value text-white">
            {{ (fundSvc.balance() + fundSvc.totalInvested()) | copCurrency }}
          </p>
          <p class="kpi-sub">Saldo + inversiones</p>
        </div>
      </div>

      <!-- Active funds summary -->
      @if (fundSvc.subscribedFunds().length > 0) {
        <div class="card">
          <h2 class="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
            Fondos activos
          </h2>
          <div class="space-y-3">
            @for (fund of fundSvc.subscribedFunds(); track fund.id) {
              <div class="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                <div class="flex items-center gap-3">
                  <span class="badge" [class.badge-fpv]="fund.category === 'FPV'" [class.badge-fic]="fund.category === 'FIC'">
                    {{ fund.category }}
                  </span>
                  <div>
                    <p class="text-sm font-medium text-white">{{ fund.name }}</p>
                    <p class="text-xs text-gray-500">
                      Suscrito {{ fund.subscribedAt | date:'dd/MM/yyyy HH:mm' }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-emerald-400">
                    {{ fund.subscribedAmount | copCurrency }}
                  </p>
                  <p class="text-xs text-gray-500">{{ fund.returnRate }}% E.A.</p>
                </div>
              </div>
            }
          </div>
          <div class="mt-4">
            <a routerLink="/funds" class="btn-secondary text-sm">Ver todos los fondos →</a>
          </div>
        </div>
      } @else {
        <div class="card flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 rounded-full bg-btg-950 flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-btg-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-white font-medium mb-1">Sin inversiones activas</p>
          <p class="text-gray-500 text-sm mb-4">Explora el catálogo de fondos disponibles</p>
          <a routerLink="/funds" class="btn-primary text-sm">Explorar fondos</a>
        </div>
      }
    </section>
  `,
})
export class DashboardComponent {
  readonly fundSvc = inject(FundService);
}
