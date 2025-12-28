// API centralisée pour l'administration

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

export const adminApi = {
  // Stats
  stats: {
    get: () => apiFetch<{ users: number; classes: number; subjects: number; courses: number }>('/api/admin/stats'),
  },

  // Users
  users: {
    list: () => apiFetch('/api/admin/users'),
    get: (id: string) => apiFetch(`/api/admin/users/${id}`),
    create: (data: { name: string; email: string; password: string; role: string }) =>
      apiFetch('/api/admin/users', { method: 'POST', body: data }),
    update: (id: string, data: { name?: string; email?: string; password?: string; role?: string }) =>
      apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' }),
  },

  // Classes
  classes: {
    list: () => apiFetch('/api/admin/classes'),
    get: (id: string) => apiFetch(`/api/admin/classes/${id}`),
    create: (data: { name: string; level: string; year: number }) =>
      apiFetch('/api/admin/classes', { method: 'POST', body: data }),
    update: (id: string, data: { name?: string; level?: string; year?: number }) =>
      apiFetch(`/api/admin/classes/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/api/admin/classes/${id}`, { method: 'DELETE' }),
  },

  // Subjects
  subjects: {
    list: () => apiFetch('/api/admin/subjects'),
    get: (id: string) => apiFetch(`/api/admin/subjects/${id}`),
    create: (data: { name: string; color: string }) =>
      apiFetch('/api/admin/subjects', { method: 'POST', body: data }),
    update: (id: string, data: { name?: string; color?: string }) =>
      apiFetch(`/api/admin/subjects/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => apiFetch(`/api/admin/subjects/${id}`, { method: 'DELETE' }),
  },
};
