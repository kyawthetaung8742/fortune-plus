import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api";

const API = axios.create({
  baseURL,
  timeout: 30000,
});

// Axios request interceptor to add Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Axios response interceptor for auto-logout on token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data.error === "TOKEN_INVALID"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
