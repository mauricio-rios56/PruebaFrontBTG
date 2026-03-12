import {
  Component, inject, input, output, signal, OnInit
} from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl,
  ValidationErrors, ReactiveFormsModule
} from '@angular/forms';
import { FundService } from '../../core/services/fund.service';
import { ToastService } from '../../shared/services/toast.service';
import { CopCurrencyPipe } from '../../core/pipes/cop-currency.pipe';
import { Fund } from '../../core/models/fund.model';
import { NotificationMethod } from '../../core/models/transaction.model';

@Component({
  selector: 'app-subscription-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CopCurrencyPipe],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
      (keydown.escape)="cancelled.emit()"
    >
      <!-- Panel -->
      <div
        class="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl animate-fade-up"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-modal-title"
        aria-describedby="subscription-modal-description"
        tabindex="-1"
      >
        <!-- Close -->
        <button
          (click)="cancelled.emit()"
          class="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-border hover:bg-surface-muted flex items-center justify-center text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-btg-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card"
          aria-label="Cerrar"
        >✕</button>

        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-surface-border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-btg-950 border border-btg-800 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-btg-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h2 id="subscription-modal-title" class="text-base font-bold text-white">Suscribirse al fondo</h2>
              <p id="subscription-modal-description" class="text-xs text-gray-500 mt-0.5 max-w-xs truncate">
                Confirma el monto y el canal de notificación para {{ fund().name }}.
              </p>
            </div>
          </div>
        </div>

        <!-- Fund info pills -->
        <div class="px-6 py-3 flex gap-3 border-b border-surface-border">
          <div class="info-pill">
            <span class="info-label">Mínimo</span>
            <span class="info-value">{{ fund().minAmount | copCurrency }}</span>
          </div>
          <div class="info-pill">
            <span class="info-label">Retorno</span>
            <span class="info-value text-emerald-400">{{ fund().returnRate }}% E.A.</span>
          </div>
          <div class="info-pill">
            <span class="info-label">Tu saldo</span>
            <span class="info-value text-btg-300">{{ fundSvc.balance() | copCurrency }}</span>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-5 space-y-5">

          <!-- Amount field -->
          <div>
            <label class="field-label" for="amount">Monto a invertir (COP)</label>
            <div class="relative mt-1">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                id="amount"
                type="number"
                formControlName="amount"
                class="field-input pl-7"
                placeholder="0"
                [min]="fund().minAmount"
                [max]="fundSvc.balance()"
                [attr.aria-invalid]="amountCtrl.invalid && amountCtrl.touched"
                [attr.aria-describedby]="amountCtrl.invalid && amountCtrl.touched ? 'amount-errors' : 'amount-help'"
                autofocus
              />
            </div>

            <!-- Validation messages -->
            @if (amountCtrl.invalid && amountCtrl.touched) {
              <div id="amount-errors" class="mt-1.5 space-y-0.5" aria-live="polite">
                @if (amountCtrl.errors?.['required']) {
                  <p class="field-error">El monto es obligatorio.</p>
                }
                @if (amountCtrl.errors?.['min']) {
                  <p class="field-error">
                    Monto mínimo: {{ fund().minAmount | copCurrency }}.
                  </p>
                }
                @if (amountCtrl.errors?.['exceedsBalance']) {
                  <p class="field-error">
                    Supera tu saldo disponible de {{ fundSvc.balance() | copCurrency }}.
                  </p>
                }
              </div>
            }

            <!-- Helper hint -->
            @if (amountCtrl.valid && amountCtrl.value) {
              <p id="amount-help" class="mt-1 text-xs text-emerald-500">
                Saldo restante: {{ (fundSvc.balance() - amountCtrl.value) | copCurrency }}
              </p>
            }
          </div>

          <!-- Notification method -->
          <fieldset>
            <legend class="field-label">Método de notificación</legend>
            <div class="mt-2 grid grid-cols-2 gap-3">
              @for (method of notificationOptions; track method.value) {
                <label
                  class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all focus-within:ring-2 focus-within:ring-btg-300 focus-within:ring-offset-2 focus-within:ring-offset-surface-card"
                  [class.border-btg-600]="form.get('notificationMethod')?.value === method.value"
                  [class.bg-btg-950]="form.get('notificationMethod')?.value === method.value"
                  [class.border-surface-border]="form.get('notificationMethod')?.value !== method.value"
                  [class.hover:border-surface-muted]="form.get('notificationMethod')?.value !== method.value"
                >
                  <input
                    type="radio"
                    formControlName="notificationMethod"
                    [value]="method.value"
                    class="sr-only"
                  />
                  <span class="text-lg">{{ method.icon }}</span>
                  <div>
                    <p class="text-sm font-medium text-white">{{ method.label }}</p>
                    <p class="text-xs text-gray-500">{{ method.desc }}</p>
                  </div>
                </label>
              }
            </div>
          </fieldset>

          <!-- Actions -->
          <div class="flex gap-3 pt-1">
            <button
              type="button"
              (click)="cancelled.emit()"
              class="btn-secondary flex-1"
              [disabled]="submitting()"
            >Cancelar</button>
            <button
              type="submit"
              class="btn-primary flex-1"
              [disabled]="form.invalid || submitting()"
            >
              @if (submitting()) {
                <span class="flex items-center justify-center gap-2">
                  <span class="spinner-sm"></span> Procesando…
                </span>
              } @else {
                Confirmar suscripción
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up { animation: fade-up 200ms ease-out both; }
    .info-pill  { @apply flex flex-col flex-1 bg-surface rounded-lg px-3 py-2; }
    .info-label { @apply text-xs text-gray-500 uppercase tracking-wider; }
    .info-value { @apply text-sm font-semibold text-white mt-0.5; }
  `],
})
export class SubscriptionModalComponent implements OnInit {
  // Señales / inputs / outputs
  readonly fund      = input.required<Fund>();
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly fundSvc  = inject(FundService);
  readonly toastSvc = inject(ToastService);
  readonly fb       = inject(FormBuilder);

  readonly submitting = signal(false);

  form!: FormGroup;

  readonly notificationOptions: { value: NotificationMethod; label: string; icon: string; desc: string }[] = [
    { value: 'EMAIL', label: 'Email',    icon: '✉️', desc: 'Notificación por correo' },
    { value: 'SMS',   label: 'SMS',      icon: '📱', desc: 'Mensaje de texto' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      amount: [
        this.fund().minAmount,
        [
          Validators.required,
          Validators.min(this.fund().minAmount),
          this.exceedsBalanceValidator.bind(this),
        ],
      ],
      notificationMethod: ['EMAIL', Validators.required],
    });
  }

  get amountCtrl(): AbstractControl {
    return this.form.get('amount')!;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { amount, notificationMethod } = this.form.value as {
      amount: number;
      notificationMethod: NotificationMethod;
    };

    this.submitting.set(true);

    this.fundSvc.subscribe(this.fund(), amount, notificationMethod).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastSvc.success(
          `¡Suscripción exitosa! Invertiste ${new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', maximumFractionDigits: 0,
          }).format(amount)} en ${this.fund().name}.`
        );
        this.confirmed.emit();
      },
      error: (err: Error) => {
        this.submitting.set(false);
        this.toastSvc.error(err.message);
      },
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement) === event.currentTarget) {
      this.cancelled.emit();
    }
  }

  private exceedsBalanceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value as number;
    if (value > this.fundSvc.balance()) {
      return { exceedsBalance: true };
    }
    return null;
  }
}
