import API from "./axios";

export type AdminUser = {
  _id: string;
  name: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
};

export const userApi = {
  list: () =>
    API.get<{ success: boolean; data: AdminUser[] }>("/users"),
  getById: (id: string) =>
    API.get<{ success: boolean; data: AdminUser }>(`/users/${id}`),
  create: (data: { name: string; username: string; password: string }) =>
    API.post<{ success: boolean; data: AdminUser }>("/users", data),
  update: (
    id: string,
    data: { name?: string; username?: string; password?: string }
  ) =>
    API.put<{ success: boolean; data: AdminUser }>(`/users/${id}`, data),
  delete: (id: string) =>
    API.delete<{ success: boolean; message: string }>(`/users/${id}`),
};
