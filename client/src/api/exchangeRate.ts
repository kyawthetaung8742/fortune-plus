import API from "./axios";
import type { ExchangeRate } from "@/types/app";

export const exchangeRateApi = {
  list: () =>
    API.get<{ success: boolean; data: ExchangeRate[] }>("/exchange-rates"),
  update: (id: string, data: { rate: number }) =>
    API.put<{ success: boolean; data: ExchangeRate }>(
      `/exchange-rates/${id}`,
      data
    ),
};
