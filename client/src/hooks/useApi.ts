'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi, homemakersApi, ordersApi, cartApi } from '@/lib/api';

// API Response type
interface ApiResponse<T> {
    data: T;
    message?: string;
}

// Generic fetch hook
interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

function useFetch<T>(
    fetchFn: () => Promise<ApiResponse<T>>,
    dependencies: unknown[] = []
): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchFn();
            setData(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refetch: fetch };
}

// Products hooks
export function useProducts(params?: { category?: string; region?: string; page?: number }) {
    return useFetch(
        () => productsApi.getAll(params as Record<string, string> | undefined) as Promise<ApiResponse<unknown>>,
        [params?.category, params?.region, params?.page]
    );
}

export function useProduct(idOrSlug: string) {
    return useFetch(
        () => productsApi.getById(idOrSlug) as Promise<ApiResponse<unknown>>,
        [idOrSlug]
    );
}

export function useFeaturedProducts() {
    return useFetch(() => productsApi.getFeatured() as Promise<ApiResponse<unknown>>, []);
}

export function useProductSearch(query: string) {
    const [data, setData] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query || query.length < 2) {
            setData(null);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await productsApi.search(query) as ApiResponse<unknown>;
                setData(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Search failed');
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    return { data, loading, error };
}

// Homemakers hooks
export function useHomemakers(params?: { page?: number; featured?: boolean }) {
    return useFetch(
        () => homemakersApi.getAll(params as Record<string, string> | undefined) as Promise<ApiResponse<unknown>>,
        [params?.page, params?.featured]
    );
}

export function useHomemaker(id: string) {
    return useFetch(
        () => homemakersApi.getById(id) as Promise<ApiResponse<unknown>>,
        [id]
    );
}

export function useFeaturedHomemakers() {
    return useFetch(() => homemakersApi.getFeatured() as Promise<ApiResponse<unknown>>, []);
}

export function useNearbyHomemakers(lat: number, lng: number) {
    return useFetch(
        () => homemakersApi.getNearby(lat, lng) as Promise<ApiResponse<unknown>>,
        [lat, lng]
    );
}

// Orders hooks
export function useMyOrders() {
    return useFetch(() => ordersApi.getMy() as Promise<ApiResponse<unknown>>, []);
}

export function useOrder(orderId: string) {
    return useFetch(
        () => ordersApi.getById(orderId) as Promise<ApiResponse<unknown>>,
        [orderId]
    );
}

export function useAvailableSlots() {
    return useFetch(
        () => ordersApi.getSlots() as Promise<ApiResponse<unknown>>,
        []
    );
}

// Cart hook with mutations
export function useCartApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateCart = async (items: unknown[], slot: string, date: string) => {
        try {
            setLoading(true);
            const response = await cartApi.validate(items, slot, date) as ApiResponse<unknown>;
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Validation failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const applyDiscount = async (code: string, subtotal: number) => {
        try {
            setLoading(true);
            const response = await cartApi.applyDiscount(code, subtotal) as ApiResponse<unknown>;
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid code');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { validateCart, applyDiscount, loading, error };
}

// Order mutations
export function useOrderMutations() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrder = async (orderData: {
        items: Array<{ productId: string; quantity: number }>;
        addressId: string;
        slot: string;
        date: string;
        paymentMethod: string;
    }) => {
        try {
            setLoading(true);
            const response = await ordersApi.create(orderData) as ApiResponse<unknown>;
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Order creation failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string, reason: string) => {
        try {
            setLoading(true);
            const response = await ordersApi.cancel(orderId, reason) as ApiResponse<unknown>;
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Cancellation failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const trackOrder = async (orderId: string) => {
        try {
            setLoading(true);
            const response = await ordersApi.track(orderId) as ApiResponse<unknown>;
            return response.data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Tracking failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createOrder, cancelOrder, trackOrder, loading, error };
}

// Location hook
export function useLocation() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [city, setCity] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(coords);

                // Reverse geocode to get city name
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
                    );
                    const data = await response.json();
                    setCity(data.address?.city || data.address?.town || data.address?.village || 'Unknown');
                } catch {
                    setCity('Location detected');
                }

                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    }, []);

    return { location, city, loading, error, detectLocation };
}
