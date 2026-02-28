import API from "./axios";
import type { Expense } from "@/types/app";

export const expenseApi = {
  list: (params?: { shareholder_id?: string; payment_id?: string }) =>
    API.get<{ success: boolean; data: Expense[] }>("/expenses", { params }),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Expense }>(`/expenses/${id}`),
  create: (data: {
    shareholder_id: string;
    payment_id: string;
    date: string;
    amount: number;
    note?: string;
  }) =>
    API.post<{ success: boolean; data: Expense; transaction_number?: string }>(
      "/expenses",
      data
    ),
  delete: (id: string) =>
    API.delete<{ success: boolean; message?: string }>(`/expenses/${id}`),
};
