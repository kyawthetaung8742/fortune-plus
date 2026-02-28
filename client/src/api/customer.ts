import API from "./axios";
import type { Customer } from "@/types/app";

export const customerApi = {
  list: () => API.get<{ success: boolean; data: Customer[] }>("/customers"),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Customer }>(`/customers/${id}`),
  create: (data: Partial<Customer>) =>
    API.post<{ success: boolean; data: Customer }>("/customers", data),
  update: (id: string, data: Partial<Customer>) =>
    API.put<{ success: boolean; data: Customer }>(`/customers/${id}`, data),
};
