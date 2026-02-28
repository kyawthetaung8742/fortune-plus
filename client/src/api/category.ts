import API from "./axios";
import type { Category } from "@/types/app";

export const categoryApi = {
  list: (params?: { is_sale?: boolean }) =>
    API.get<{ success: boolean; data: Category[] }>("/categories", { params }),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Category }>(`/categories/${id}`),
  create: (data: Partial<Category>) =>
    API.post<{ success: boolean; data: Category }>("/categories", data),
  update: (id: string, data: Partial<Category>) =>
    API.put<{ success: boolean; data: Category }>(`/categories/${id}`, data),
};
