'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header, BottomNav } from '@/components/ui/Navigation';

// Icons
const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// Mock cart data
const mockCartItems = [
    {
        id: '1',
        productId: 'prod001',
        name: 'Bellam Gavvalu',
        price: 199,
        quantity: 2,
        homemaker: { id: 'chef01', name: "Sarala's Kitchen" },
        image: null,
    },
    {
        id: '2',
        productId: 'prod002',
        name: 'Ariselu',
        price: 249,
        quantity: 1,
        homemaker: { id: 'chef01', name: "Sarala's Kitchen" },
        image: null,
    },
    {
        id: '3',
        productId: 'prod003',
        name: 'Murukku',
        price: 149,
        quantity: 3,
        homemaker: { id: 'chef02', name: "Lakshmi's Traditional Bites" },
        image: null,
    },
];

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    homemaker: { id: string; name: string };
    image: string | null;
}

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>(mockCartItems);
    const [selectedSlot, setSelectedSlot] = useState<'MORNING' | 'EVENING'>('MORNING');
    const [appreciationNote, setAppreciationNote] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

    // Group items by homemaker
    const groupedItems = items.reduce((acc, item) => {
        const key = item.homemaker.id;
        if (!acc[key]) {
            acc[key] = {
                homemaker: item.homemaker,
                items: [],
            };
        }
        acc[key].items.push(item);
        return acc;
    }, {} as Record<string, { homemaker: { id: string; name: string }; items: CartItem[] }>);

    const homemakerCount = Object.keys(groupedItems).length;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 25;
    const packagingFee = 10;
    const prepaidDiscount = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + packagingFee - prepaidDiscount - appliedDiscount;

    const updateQuantity = (id: string, delta: number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const applyDiscount = () => {
        if (discountCode.toUpperCase() === 'WELCOME10') {
            setAppliedDiscount(Math.round(subtotal * 0.10));
        } else if (discountCode.toUpperCase() === 'FLAT50') {
            setAppliedDiscount(50);
        } else {
            alert('Invalid discount code');
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-cream flex flex-col">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                            <BackIcon />
                        </Link>
                        <h1 className="font-display text-xl font-semibold">Your Cart</h1>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-6xl mb-4">🛒</span>
                    <h2 className="font-display text-2xl font-semibold text-brown mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-6">Add some delicious homemade goodies!</p>
                    <Link href="/" className="btn-primary">
                        Explore Food 🍪
                    </Link>
                </div>

                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream pb-48">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <BackIcon />
                    </Link>
                    <h1 className="font-display text-xl font-semibold">Your Cart</h1>
                    <span className="ml-auto text-sm text-gray-500">{items.length} items</span>
                </div>
            </header>

            <div className="px-4 py-4">
                {/* Multi-vendor Warning */}
                {homemakerCount > 1 && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-amber-800 text-sm">
                            ⚠️ Your cart has items from <strong>{homemakerCount} different kitchens</strong>.
                            This may require separate deliveries.
                        </p>
                    </div>
                )}

                {/* Cart Items Grouped by Homemaker */}
                {Object.values(groupedItems).map((group) => (
                    <div key={group.homemaker.id} className="mb-6">
                        {/* Homemaker Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white">
                                👩‍🍳
                            </div>
                            <div>
                                <Link href={`/chef/${group.homemaker.id}`} className="font-semibold text-brown hover:text-terracotta">
                                    {group.homemaker.name}
                                </Link>
                                <p className="text-xs text-gray-500">{group.items.length} items</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {group.items.map((item) => (
                                <div key={item.id} className="card p-4">
                                    <div className="flex gap-4">
                                        {/* Image */}
                                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-saffron/20 to-turmeric/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-3xl">🍪</span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-brown">{item.name}</h3>
                                                    <p className="text-terracotta font-bold">₹{item.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                                                >
                                                    +
                                                </button>
                                                <span className="ml-auto font-bold text-brown">
                                                    ₹{item.price * item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Delivery Slot Selection */}
                <div className="mb-6">
                    <h2 className="font-semibold text-lg text-brown mb-3">Delivery Slot</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setSelectedSlot('MORNING')}
                            className={`slot-card ${selectedSlot === 'MORNING' ? 'active' : ''}`}
                        >
                            <p className="text-2xl mb-1">🌅</p>
                            <p className="font-semibold">Morning</p>
                            <p className="text-sm text-gray-500">6 AM - 8 AM</p>
                            <p className="text-xs text-terracotta mt-1">Tomorrow</p>
                        </button>
                        <button
                            onClick={() => setSelectedSlot('EVENING')}
                            className={`slot-card ${selectedSlot === 'EVENING' ? 'active' : ''}`}
                        >
                            <p className="text-2xl mb-1">🌆</p>
                            <p className="font-semibold">Evening</p>
                            <p className="text-sm text-gray-500">5 PM - 7 PM</p>
                            <p className="text-xs text-terracotta mt-1">Tomorrow</p>
                        </button>
                    </div>
                </div>

                {/* Appreciation Note */}
                <div className="mb-6">
                    <h2 className="font-semibold text-lg text-brown mb-3">Note to Chef (Optional)</h2>
                    <textarea
                        value={appreciationNote}
                        onChange={(e) => setAppreciationNote(e.target.value)}
                        placeholder="E.g., Less spicy please, or Happy Birthday message..."
                        className="input-field resize-none h-20"
                        maxLength={250}
                    />
                    <p className="text-xs text-gray-400 mt-1">{appreciationNote.length}/250</p>
                </div>

                {/* Discount Code */}
                <div className="mb-6">
                    <h2 className="font-semibold text-lg text-brown mb-3">Discount Code</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Enter code"
                            className="input-field flex-1"
                        />
                        <button
                            onClick={applyDiscount}
                            className="px-6 py-3 rounded-xl bg-brown text-white font-medium hover:bg-brown/90"
                        >
                            Apply
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Try: WELCOME10, FLAT50</p>
                </div>

                {/* Price Breakdown */}
                <div className="card p-4 mb-6">
                    <h2 className="font-semibold text-lg text-brown mb-4">Bill Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-medium">₹{deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Packaging</span>
                            <span className="font-medium">₹{packagingFee}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Prepaid Discount (5%)</span>
                            <span className="font-medium">-₹{prepaidDiscount}</span>
                        </div>
                        {appliedDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Coupon Discount</span>
                                <span className="font-medium">-₹{appliedDiscount}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold text-brown">Total</span>
                                <span className="font-bold text-terracotta">₹{total}</span>
                            </div>
                        </div>
                    </div>
                    {(prepaidDiscount + appliedDiscount) > 0 && (
                        <p className="text-green-600 text-sm mt-3 font-medium">
                            🎉 You&apos;re saving ₹{prepaidDiscount + appliedDiscount} on this order!
                        </p>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-terracotta">₹{total}</p>
                    </div>
                    <Link
                        href="/checkout"
                        className="btn-primary px-8"
                    >
                        Proceed to Checkout →
                    </Link>
                </div>
                <p className="text-xs text-center text-gray-400">
                    🔒 Secure Payment • 5% off on prepaid orders
                </p>
            </div>

            <BottomNav />
        </div>
    );
}
