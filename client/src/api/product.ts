import API from "./axios";
import type { Product } from "@/types/app";

export const productApi = {
  list: (params?: { category_id?: string; available?: boolean }) =>
    API.get<{ success: boolean; data: Product[] }>("/products", { params }),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Product }>(`/products/${id}`),
  create: (data: FormData) =>
    API.post<{ success: boolean; data: Product }>("/products", data),
  update: (id: string, data: FormData) =>
    API.put<{ success: boolean; data: Product }>(`/products/${id}`, data),
};
