import client from './client';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const login = (data: LoginPayload) => client.post<AuthResponse>('/auth/login', data);
export const register = (data: RegisterPayload) => client.post<AuthResponse>('/auth/register', data);
export const getProfile = () => client.get<User>('/auth/profile');
