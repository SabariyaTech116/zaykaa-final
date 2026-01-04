'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    homemaker: {
        id: string;
        name: string;
    };
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    selectedSlot: 'MORNING' | 'EVENING';
    selectedDate: string;
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    setSlot: (slot: 'MORNING' | 'EVENING') => void;
    setDate: (date: string) => void;
    getGroupedByHomemaker: () => Record<string, { homemaker: CartItem['homemaker']; items: CartItem[] }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'zaykaa_cart';
const SLOT_STORAGE_KEY = 'zaykaa_slot';
const DATE_STORAGE_KEY = 'zaykaa_date';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<'MORNING' | 'EVENING'>('MORNING');
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isHydrated, setIsHydrated] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        const savedSlot = localStorage.getItem(SLOT_STORAGE_KEY);
        const savedDate = localStorage.getItem(DATE_STORAGE_KEY);

        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        if (savedSlot) {
            setSelectedSlot(savedSlot as 'MORNING' | 'EVENING');
        }
        if (savedDate) {
            setSelectedDate(savedDate);
        } else {
            // Default to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setSelectedDate(tomorrow.toISOString().split('T')[0]);
        }
        setIsHydrated(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isHydrated]);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(SLOT_STORAGE_KEY, selectedSlot);
        }
    }, [selectedSlot, isHydrated]);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(DATE_STORAGE_KEY, selectedDate);
        }
    }, [selectedDate, isHydrated]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
        setItems(currentItems => {
            const existingIndex = currentItems.findIndex(i => i.productId === item.productId);

            if (existingIndex >= 0) {
                // Update quantity of existing item
                const updated = [...currentItems];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                // Add new item
                return [...currentItems, { ...item, quantity }];
            }
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeItem = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    const setSlot = (slot: 'MORNING' | 'EVENING') => {
        setSelectedSlot(slot);
    };

    const setDate = (date: string) => {
        setSelectedDate(date);
    };

    const getGroupedByHomemaker = () => {
        return items.reduce((acc, item) => {
            const key = item.homemaker.id;
            if (!acc[key]) {
                acc[key] = {
                    homemaker: item.homemaker,
                    items: [],
                };
            }
            acc[key].items.push(item);
            return acc;
        }, {} as Record<string, { homemaker: CartItem['homemaker']; items: CartItem[] }>);
    };

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                selectedSlot,
                selectedDate,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                setSlot,
                setDate,
                getGroupedByHomemaker,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
