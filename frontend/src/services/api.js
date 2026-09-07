import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseResponse(res) {
  const text = await res.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Client HTTP centralisé pour toutes les requêtes vers le backend.
 * Utilise les cookies httpOnly (credentials: 'include').
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options

  const config = {
    method,
    credentials: 'include',
    headers: {
      ...headers,
    },
  }

  if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config)
  const data = await parseResponse(res)

  if (!res.ok) {
    // Session expirée / non authentifié
    if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/setup')) {
      localStorage.removeItem('arckium_user')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.assign('/login')
      }
    }

    let message =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' && data) ||
      `HTTP error ${res.status}`

    if (Array.isArray(message)) {
      message = message.join(', ')
    }

    throw new ApiError(message, res.status)
  }

  return data
}

export const authApi = {
  login: (email, password) =>
    apiRequest(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: { email, password },
    }),

  setupStatus: () => apiRequest(API_ENDPOINTS.auth.setupStatus),

  setup: (data) =>
    apiRequest(API_ENDPOINTS.auth.setup, {
      method: 'POST',
      body: data,
    }),

  me: () => apiRequest(API_ENDPOINTS.auth.me),

  logout: () =>
    apiRequest(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    }),

  register: (data) =>
    apiRequest(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: data,
    }),
}

export const ticketsApi = {
  getAll: () => apiRequest(API_ENDPOINTS.tickets.all),

  create: (ticket) =>
    apiRequest(API_ENDPOINTS.tickets.add, {
      method: 'POST',
      body: ticket,
    }),

  update: (id, ticket) =>
    apiRequest(API_ENDPOINTS.tickets.update(id), {
      method: 'PATCH',
      body: ticket,
    }),

  delete: (id) =>
    apiRequest(API_ENDPOINTS.tickets.delete(id), {
      method: 'DELETE',
    }),

  addComment: (id, comment) =>
    apiRequest(API_ENDPOINTS.tickets.comments(id), {
      method: 'POST',
      body: comment,
    }),
}

export const usersApi = {
  getAll: () => apiRequest(API_ENDPOINTS.users.all),

  create: (user) =>
    apiRequest(API_ENDPOINTS.users.add, {
      method: 'POST',
      body: user,
    }),

  enable: (id) =>
    apiRequest(API_ENDPOINTS.users.enable(id), {
      method: 'PATCH',
    }),

  disable: (id) =>
    apiRequest(API_ENDPOINTS.users.disable(id), {
      method: 'PATCH',
    }),

  delete: (id) =>
    apiRequest(API_ENDPOINTS.users.delete(id), {
      method: 'DELETE',
    }),
}

export const equipmentsApi = {
  getAll: () => apiRequest(API_ENDPOINTS.equipments.all),

  create: (equipment) =>
    apiRequest(API_ENDPOINTS.equipments.add, {
      method: 'POST',
      body: equipment,
    }),
}
