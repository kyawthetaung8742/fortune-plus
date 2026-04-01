import API from "./axios";
import type { Wallet } from "@/types/app";

export type WalletSummaryByPayment = {
  payment_id: string;
  paymentName: string;
  currency_type: string;
  logo_url?: string;
  totalAmount: number;
};

export type WalletSummaryShareholder = {
  shareholder_id: string;
  shareholderName: string;
  wallets: {
    payment_id: string;
    paymentName: string;
    currency_type: string;
    logo_url?: string;
    amount: number;
  }[];
  depositByCurrency?: Record<string, number>;
  withdrawByCurrency?: Record<string, number>;
};

export type WalletSummary = {
  byPayment: WalletSummaryByPayment[];
  byShareholder: WalletSummaryShareholder[];
};

export const walletApi = {
  summary: () =>
    API.get<{ success: boolean; data: WalletSummary }>("/wallets/summary"),
  listByShareholder: (shareholderId: string) =>
    API.get<{ success: boolean; data: Wallet[] }>(
      `/wallets/shareholder/${shareholderId}`
    ),
};
