export type TransactionType = 'SUBSCRIPTION' | 'CANCELLATION';
export type NotificationMethod = 'EMAIL' | 'SMS';

export interface Transaction {
  id: string;
  fundId: string;
  fundName: string;
  type: TransactionType;
  amount: number;
  notificationMethod: NotificationMethod;
  createdAt: Date;
}
