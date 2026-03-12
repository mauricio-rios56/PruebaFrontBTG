export type FundCategory = 'FPV' | 'FIC';

export interface Fund {
  id: string;
  name: string;
  minAmount: number;
  category: FundCategory;
  description: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  returnRate: number; // % E.A.
}

export interface SubscribedFund extends Fund {
  subscribedAmount: number;
  subscribedAt: Date;
}
