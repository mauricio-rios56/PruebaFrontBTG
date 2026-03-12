import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard — BTG Pactual',
  },
  {
    path: 'funds',
    loadComponent: () =>
      import('./features/fund-list/fund-list.component').then(m => m.FundListComponent),
    title: 'Fondos disponibles — BTG Pactual',
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transaction-history/transaction-history.component').then(
        m => m.TransactionHistoryComponent
      ),
    title: 'Historial — BTG Pactual',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
