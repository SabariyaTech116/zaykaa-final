'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header, BottomNav } from '@/components/ui/Navigation';

const mockOrders = [
    {
        id: 'ZYK-20260102001',
        date: '2 Jan 2026',
        status: 'delivered',
        total: 647,
        items: [
            { name: 'Bellam Gavvalu', quantity: 2, price: 199 },
            { name: 'Ariselu', quantity: 1, price: 249 },
        ],
        homemaker: "Sarala's Kitchen",
        slot: 'Morning (6 AM - 8 AM)',
        hasReviewed: true,
    },
    {
        id: 'ZYK-20260103001',
        date: '3 Jan 2026',
        status: 'processing',
        total: 447,
        items: [
            { name: 'Murukku', quantity: 3, price: 149 },
        ],
        homemaker: "Lakshmi's Traditional Bites",
        slot: 'Evening (5 PM - 7 PM)',
        hasReviewed: false,
    },
];

type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
    placed: { label: 'Order Placed', color: 'bg-blue-100 text-blue-700', icon: '📝' },
    confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: '✅' },
    processing: { label: 'Being Prepared', color: 'bg-orange-100 text-orange-700', icon: '🍳' },
    ready: { label: 'Ready', color: 'bg-yellow-100 text-yellow-700', icon: '📦' },
    out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-700', icon: '🚴' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '✓' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '✕' },
};

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
    const [orders] = useState(mockOrders);

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

    return (
        <div className="min-h-screen bg-cream pb-20">
            <Header location="Hyderabad" />

            <div className="px-4 py-4">
                <h1 className="font-display text-2xl font-bold text-brown mb-4">My Orders</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'active'
                                ? 'text-terracotta border-b-2 border-terracotta'
                                : 'text-gray-500'
                            }`}
                    >
                        Active ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'past'
                                ? 'text-terracotta border-b-2 border-terracotta'
                                : 'text-gray-500'
                            }`}
                    >
                        Past ({pastOrders.length})
                    </button>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {(activeTab === 'active' ? activeOrders : pastOrders).map((order) => {
                        const status = statusConfig[order.status as OrderStatus];
                        return (
                            <div key={order.id} className="card p-4">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-brown">{order.id}</p>
                                        <p className="text-sm text-gray-500">{order.date} • {order.slot}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                        {status.icon} {status.label}
                                    </span>
                                </div>

                                {/* Homemaker */}
                                <p className="text-sm text-gray-600 mb-3">
                                    From: <span className="font-medium text-terracotta">{order.homemaker}</span>
                                </p>

                                {/* Items */}
                                <div className="p-3 rounded-lg bg-gray-50 mb-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Total & Actions */}
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-lg text-brown">Total: ₹{order.total}</p>
                                    <div className="flex gap-2">
                                        {order.status === 'delivered' && !order.hasReviewed && (
                                            <button className="px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-medium">
                                                Rate Order ⭐
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <button className="px-4 py-2 rounded-lg border border-terracotta text-terracotta text-sm font-medium">
                                                Reorder
                                            </button>
                                        )}
                                        {activeTab === 'active' && (
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="px-4 py-2 rounded-lg bg-brown text-white text-sm font-medium"
                                            >
                                                Track Order
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {(activeTab === 'active' ? activeOrders : pastOrders).length === 0 && (
                        <div className="text-center py-12">
                            <span className="text-6xl mb-4 block">📦</span>
                            <p className="text-gray-500">No {activeTab} orders</p>
                            <Link href="/" className="text-terracotta font-medium mt-2 block">
                                Start ordering →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
