import API from "./axios";
import type { TransactionHistory } from "@/types/app";

type ListParams = {
  shareholder_id?: string;
  payment_id?: string;
  transaction_type?: string;
};

export const transactionHistoryApi = {
  list: (params?: ListParams) =>
    API.get<{ success: boolean; data: TransactionHistory[] }>(
      "/transaction-history",
      { params }
    ),
};
