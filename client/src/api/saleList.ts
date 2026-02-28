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

export type SaleListListParams = {
  customer_id?: string;
  from?: string;
  to?: string;
  category_id?: string;
  product_id?: string;
  currency_type?: "kyat" | "baht";
  page?: number;
  limit?: number;
};

export type SaleListListResponse = {
  success: boolean;
  data: SaleListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const saleListApi = {
  list: (params?: SaleListListParams) =>
    API.get<SaleListListResponse>("/sale-list", { params }),
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
