// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Client with interceptors
class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('zaykaa_token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('zaykaa_token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('zaykaa_token');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    }

    get<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    post<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    patch<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_URL);

// Auth API
export const authApi = {
    sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
    verifyOtp: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; email?: string }) => api.patch('/auth/profile', data),
};

// Products API
export const productsApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return api.get(`/products${query}`);
    },
    getFeatured: () => api.get('/products/featured'),
    getById: (id: string) => api.get(`/products/${id}`),
    getByHomemaker: (id: string) => api.get(`/products/homemaker/${id}`),
    search: (query: string) => api.get(`/products/search?q=${query}`),
};

// Homemakers API
export const homemakersApi = {
    getAll: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params)}` : '';
        return api.get(`/homemakers${query}`);
    },
    getFeatured: () => api.get('/homemakers/featured'),
    getById: (id: string) => api.get(`/homemakers/${id}`),
    getNearby: (lat: number, long: number) => api.get(`/homemakers/nearby?lat=${lat}&long=${long}`),
};

// Orders API
export const ordersApi = {
    create: (orderData: unknown) => api.post('/orders', orderData),
    getMy: () => api.get('/orders/my'),
    getById: (id: string) => api.get(`/orders/${id}`),
    cancel: (id: string, reason: string) => api.post(`/orders/${id}/cancel`, { reason }),
    track: (id: string) => api.get(`/orders/${id}/track`),
    getSlots: () => api.get('/orders/slots/available'),
};

// Cart API
export const cartApi = {
    validate: (items: unknown[], slot: string, date: string) =>
        api.post('/cart/validate', { items, deliverySlot: slot, deliveryDate: date }),
    getSummary: (subtotal: number, isNeighborPickup: boolean) =>
        api.get(`/cart/summary?subtotal=${subtotal}&isNeighborPickup=${isNeighborPickup}`),
    applyDiscount: (code: string, subtotal: number) =>
        api.post('/cart/discount', { code, subtotal }),
};
