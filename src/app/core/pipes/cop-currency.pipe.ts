import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un número como peso colombiano (COP).
 * Uso: {{ 500000 | copCurrency }}  →  "$500.000"
 * Uso: {{ 500000 | copCurrency:true }}  →  "$500.000 COP"
 */
@Pipe({
  name: 'copCurrency',
  standalone: true,
})
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined, showCode = false): string {
    if (value === null || value === undefined || isNaN(value)) return '—';

    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

    return showCode ? `${formatted} COP` : formatted;
  }
}
