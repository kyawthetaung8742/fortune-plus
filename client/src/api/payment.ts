import API from "./axios";
import type { Payment } from "@/types/app";

export const paymentApi = {
  list: () => API.get<{ success: boolean; data: Payment[] }>("/payments"),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Payment }>(`/payments/${id}`),
  create: (data: Partial<Payment>) =>
    API.post<{ success: boolean; data: Payment }>("/payments", data),
  update: (id: string, data: Partial<Payment>) =>
    API.put<{ success: boolean; data: Payment }>(`/payments/${id}`, data),
};
