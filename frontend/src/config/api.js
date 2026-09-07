/** URL de base du backend NestJS */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/** Endpoints de l'API */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
    logout: '/auth/logout',
    setupStatus: '/auth/setup/status',
    setup: '/auth/setup',
  },
  tickets: {
    all: '/tickets/all',
    add: '/tickets/add',
    update: (id) => `/tickets/update/${id}`,
    delete: (id) => `/tickets/delete/${id}`,
    comments: (id) => `/tickets/${id}/comments`,
  },
  equipments: {
    all: '/equipments/all',
    add: '/equipments/add',
  },
  users: {
    all: '/users/all',
    add: '/users/add',
    enable: (id) => `/users/enable/${id}`,
    disable: (id) => `/users/disable/${id}`,
    delete: (id) => `/users/delete/${id}`,
  },
}
