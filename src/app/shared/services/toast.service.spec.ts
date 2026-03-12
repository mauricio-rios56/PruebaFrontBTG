import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds an info toast by default and dismisses it after the configured duration', () => {
    service.show('Operación en proceso');

    expect(service.toasts()).toEqual([
      { id: 1, message: 'Operación en proceso', type: 'info' },
    ]);

    jest.advanceTimersByTime(4000);

    expect(service.toasts()).toEqual([]);
  });

  it('creates success, error and warning toasts with incrementing ids', () => {
    service.success('Éxito');
    service.error('Error');
    service.warning('Advertencia');

    expect(service.toasts()).toEqual([
      { id: 1, message: 'Éxito', type: 'success' },
      { id: 2, message: 'Error', type: 'error' },
      { id: 3, message: 'Advertencia', type: 'warning' },
    ]);
  });

  it('removes a toast manually with dismiss', () => {
    service.info('Toast 1');
    service.success('Toast 2');

    service.dismiss(1);

    expect(service.toasts()).toEqual([
      { id: 2, message: 'Toast 2', type: 'success' },
    ]);
  });

  it('uses the extended duration for error toasts', () => {
    service.error('Saldo insuficiente');

    jest.advanceTimersByTime(4000);
    expect(service.toasts()).toHaveLength(1);

    jest.advanceTimersByTime(2000);
    expect(service.toasts()).toHaveLength(0);
  });
});