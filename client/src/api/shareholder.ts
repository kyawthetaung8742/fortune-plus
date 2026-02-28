import API from "./axios";
import type { Shareholder } from "@/types/app";

export const shareholderApi = {
  list: () => API.get<{ success: boolean; data: Shareholder[] }>("/shareholders"),
  getById: (id: string) =>
    API.get<{ success: boolean; data: Shareholder }>(`/shareholders/${id}`),
  create: (data: Partial<Shareholder>) =>
    API.post<{ success: boolean; data: Shareholder }>("/shareholders", data),
  update: (id: string, data: Partial<Shareholder>) =>
    API.put<{ success: boolean; data: Shareholder }>(`/shareholders/${id}`, data),
  deposit: (id: string, data: { payment_id: string; amount: number; note?: string }) =>
    API.post<{ success: boolean; data: { wallet: unknown; transaction_number: string } }>(
      `/shareholders/${id}/deposit`,
      data
    ),
  withdraw: (id: string, data: { payment_id: string; amount: number; note?: string }) =>
    API.post<{ success: boolean; data: { wallet: unknown; transaction_number: string } }>(
      `/shareholders/${id}/withdraw`,
      data
    ),
  transfer: (
    id: string,
    data: {
      payment_id: string;
      to_shareholder_id: string;
      to_payment_id?: string;
      amount: number;
      note?: string;
    }
  ) =>
    API.post<{ success: boolean; data: { transaction_number: string } }>(
      `/shareholders/${id}/transfer`,
      data
    ),
  exchange: (
    id: string,
    data: {
      from_payment_id: string;
      to_payment_id: string;
      to_shareholder_id?: string;
      from_amount: number;
      rate: number;
      note?: string;
    }
  ) =>
    API.post<{ success: boolean; data: { transaction_number: string; to_amount: number } }>(
      `/shareholders/${id}/exchange`,
      data
    ),
};
