export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  leave: {
    create: '/api/leaves',
    list: '/api/leaves',
    balance: '/api/leaves/balance',
    details: (id: string) => `/api/leaves/${id}`,
  },
  admin: {
    dashboard: '/api/admin/dashboard',
    leaves: '/api/admin/leaves',
    approveLeave: (id: string) => `/api/admin/leaves/${id}/approve`,
    rejectLeave: (id: string) => `/api/admin/leaves/${id}/reject`,
    employees: '/api/admin/employees',
  },
};

