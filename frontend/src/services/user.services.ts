import mainApi from "@/apis/main.api";

export interface CreateUserPayload {
  fullname: string;
  age: number;
  address: string;
  username: string;
  password: string;
  status_role: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  responseObject: any;
  statusCode: number;
}

export const createUser = async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
  const { data } = await mainApi.post("/v1/users/create", payload);
  return data;
};

export interface User {
  users_id: string;
  fullname: string;
  age: number;
  address: string;
  username: string;
  status_role: string;
  create_date?: string;
  create_by?: string;
  update_by?: string;
  update_date?: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  responseObject: User[];
  statusCode: number;
}

export const getUsers = async (): Promise<GetUsersResponse> => {
  const { data } = await mainApi.get("/v1/users/get");
  return data;
};

export interface UpdateUserPayload {
  users_id: string;
  fullname: string;
  age: number;
  address: string;
  username: string;
  password: string;
  status_role: string;
}

export const deleteUser = async (users_id: string): Promise<CreateUserResponse> => {
  const { data } = await mainApi.delete(`/v1/users/delete/${users_id}`);
  return data;
};

export const updateUser = async (payload: UpdateUserPayload): Promise<CreateUserResponse> => {
  const { data } = await mainApi.put(`/v1/users/update`, payload);
  return data;
}; 