import API from "./axios";
import type { SaleListItem } from "@/types/app";

export type SaleListCreateItem = {
  product_id: string;
  quantity: number;
  original_price: number;
  sale_price: number;
  discount?: number;
  note?: string;
};

export const saleListApi = {
  list: (params?: { customer_id?: string; from?: string; to?: string }) =>
    API.get<{ success: boolean; data: SaleListItem[] }>("/sale-list", { params }),
  getById: (id: string) =>
    API.get<{ success: boolean; data: SaleListItem }>(`/sale-list/${id}`),
  create: (data: {
    date?: string;
    customer_id: string;
    shareholder_id: string;
    payment_id: string;
    currency_type: "kyat" | "baht";
    transaction_amount: number;
    rate?: number;
    items: SaleListCreateItem[];
  }) =>
    API.post<{ success: boolean; data: SaleListItem[] }>("/sale-list", data),
};
