import API from "./axios";
import type { TransactionHistory } from "@/types/app";

export type TransactionHistoryListParams = {
  transaction_number?: string;
  from?: string;
  to?: string;
  shareholder_id?: string;
  payment_id?: string;
  transaction_type?: string;
  page?: number;
  limit?: number;
};

export type TransactionHistoryListResponse = {
  success: boolean;
  data: TransactionHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const transactionHistoryApi = {
  list: (params?: TransactionHistoryListParams) =>
    API.get<TransactionHistoryListResponse>("/transaction-history", { params }),
};
