import API from "./axios";

export const signin = async (payload: {
  username: string;
  password: string;
}) => {
  const { data } = await API.post("/auth/signin", payload);
  return data;
};
