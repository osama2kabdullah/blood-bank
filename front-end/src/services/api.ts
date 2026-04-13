import { http } from './http'

/* ── Shared types ── */
export interface Donor {
  id: number
  name: string
  blood_group: string
  location: string
  phone?: string
  last_donation?: string | null
}

export interface DonorSearchResult {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
  data: Donor[]
}

export interface AuthUser {
  id: string
  name: string
  phone: string
}

export interface AuthDonor {
  id: number
  name: string
  phone: string
  blood_group: string
  location: string
  last_donation: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  token: string
  user: AuthUser
  donor: AuthDonor | null
}

export interface ApiMessageResponse {
  success: boolean
  message: string
}

/* ── Auth service ── */
export const authService = {
  login: (payload: { phone: string; password: string }) =>
    http.post<AuthResponse>('/auth/donor/login', payload),

  registerFull: (payload: {
    name: string
    phone: string
    password: string
    blood_group: string
    location: string
    last_donation?: string
  }) => http.post<AuthResponse>('/auth/donor/register-full', payload),

  updateProfile: (payload: { name?: string; phone?: string }) =>
    http.put<ApiMessageResponse>('/me', payload),

  changePassword: (payload: { current_password: string; new_password: string }) =>
    http.post<ApiMessageResponse>('/auth/change-password', payload),

  deleteAccount: (payload: { password: string }) =>
    http.delete<ApiMessageResponse>('/auth/delete-account', { body: payload }),
}

/* ── Donor service ── */
export const donorService = {
  search: (params: {
    blood_group?: string
    location?: string | null
    page?: number
  }) => {
    const query = new URLSearchParams()
    if (params.blood_group && params.blood_group !== 'all') query.set('blood_group', params.blood_group)
    if (params.location) query.set('location', params.location)
    if (params.page && params.page > 1) query.set('page', String(params.page))
    const path = query.toString() ? `/donors?${query}` : '/donors'
    return http.get<DonorSearchResult>(path)
  },

  getById: (id: number) =>
    http.get<Donor>(`/donors/${id}`),

  update: (id: number, payload: Partial<Omit<Donor, 'id'>>) =>
    http.patch<Donor>(`/donors/${id}`, payload),
}