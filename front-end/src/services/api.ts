/**
 * API Service Layer — All UI → backend communication goes through here
 * Structured for edge deployment on Cloudflare Workers
 */
import { http } from './http'

/* ── Types ── */
export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface Post {
  id: number
  title: string
  body: string
  userId: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

/* ── User service ── */
export const userService = {
  getAll: () => http.get<User[]>('/users'),
  getById: (id: string) => http.get<User>(`/users/${id}`),
  create: (payload: Omit<User, 'id' | 'createdAt'>) => http.post<User>('/users', payload),
  update: (id: string, payload: Partial<User>) => http.patch<User>(`/users/${id}`, payload),
  delete: (id: string) => http.delete<void>(`/users/${id}`),
}

/* ── Post service — example with JSONPlaceholder ── */
export const postService = {
  getAll: (page = 1, limit = 10) =>
    http.get<Post[]>(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`, { cache: 'default' }),
  getById: (id: number) =>
    http.get<Post>(`https://jsonplaceholder.typicode.com/posts/${id}`),
  create: (payload: Omit<Post, 'id'>) =>
    http.post<Post>('https://jsonplaceholder.typicode.com/posts', payload),
}
