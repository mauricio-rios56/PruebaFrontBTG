import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private _counter = 0;

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = ++this._counter;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'error', 6000); }
  info(message: string)    { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning'); }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
