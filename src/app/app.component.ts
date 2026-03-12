import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { CopCurrencyPipe } from './core/pipes/cop-currency.pipe';
import { FundService } from './core/services/fund.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, CopCurrencyPipe],
  template: `
    <div class="min-h-screen bg-surface text-white font-sans flex flex-col">

      <!-- Top nav -->
      <header class="sticky top-0 z-30 border-b border-surface-border bg-surface-card/80 backdrop-blur-md">
        <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <!-- Brand -->
          <div class="flex items-center gap-2.5 shrink-0">
            <div class="w-7 h-7 rounded-lg bg-btg-500 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="font-bold text-sm tracking-tight">BTG <span class="text-btg-400">Pactual</span></span>
          </div>

          <!-- Nav links -->
          <nav class="flex items-center gap-1">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="nav-link-active"
                class="nav-link"
              >
                <span class="text-base leading-none">{{ item.icon }}</span>
                <span class="hidden sm:inline text-xs font-medium">{{ item.label }}</span>
              </a>
            }
          </nav>

          <!-- Balance chip -->
          <div class="shrink-0 flex items-center gap-2 bg-surface-border rounded-full px-3 py-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-semibold text-white">
              {{ fundSvc.balance() | copCurrency }}
            </span>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="border-t border-surface-border py-4 text-center text-xs text-gray-600">
        BTG Pactual &copy; {{ currentYear }} — Plataforma de gestión de fondos FPV/FIC
      </footer>
    </div>

    <!-- Global toast outlet -->
    <app-toast />
  `,
})
export class AppComponent {
  readonly fundSvc = inject(FundService);
  readonly currentYear = new Date().getFullYear();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',    path: '/dashboard',    icon: '◈' },
    { label: 'Fondos',       path: '/funds',        icon: '⬡' },
    { label: 'Historial',    path: '/transactions', icon: '≡' },
  ];
}
