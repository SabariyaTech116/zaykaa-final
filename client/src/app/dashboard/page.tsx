'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/Navigation';

// Icons
const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const OrderIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

type OrderStatus = 'pending' | 'cooking' | 'ready';

interface DashboardOrder {
    id: string;
    customer: string;
    items: string;
    total: number;
    slot: string;
    status: OrderStatus;
}

// Mock data
const mockDashboardData = {
    kitchenName: "Sarala's Kitchen",
    todayOrders: 8,
    pendingOrders: 3,
    todayEarnings: 2450,
    weeklyEarnings: 15680,
    rating: 4.8,
    capacity: {
        morning: { current: 12, max: 20 },
        evening: { current: 8, max: 20 },
    },
    orders: [
        { id: 'ORD001', customer: 'Priya M.', items: 'Bellam Gavvalu (2), Ariselu (1)', total: 647, slot: 'Morning', status: 'pending' as OrderStatus },
        { id: 'ORD002', customer: 'Rahul K.', items: 'Sunnundalu (3)', total: 1047, slot: 'Morning', status: 'cooking' as OrderStatus },
        { id: 'ORD003', customer: 'Anjali S.', items: 'Kajjikayalu (2)', total: 458, slot: 'Evening', status: 'pending' as OrderStatus },
    ],
};

export default function HomemakerDashboard() {
    const [orders, setOrders] = useState<DashboardOrder[]>(mockDashboardData.orders);
    const [activeTab, setActiveTab] = useState<'today' | 'kitchen' | 'earnings'>('today');

    const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    const getStatusButton = (order: typeof orders[0]) => {
        switch (order.status) {
            case 'pending':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'cooking')}
                        className="w-full py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
                    >
                        Accept Order ✓
                    </button>
                );
            case 'cooking':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600"
                    >
                        Mark Ready 📦
                    </button>
                );
            case 'ready':
                return (
                    <span className="status-ready w-full text-center block py-2">
                        ✓ Ready for Pickup
                    </span>
                );
        }
    };

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">New</span>;
            case 'cooking':
                return <span className="status-cooking text-xs">🍳 Cooking</span>;
            case 'ready':
                return <span className="status-ready text-xs">📦 Ready</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-gradient-to-r from-terracotta to-saffron text-white p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-white/80 text-sm">Welcome back,</p>
                        <h1 className="font-display text-2xl font-bold">{mockDashboardData.kitchenName}</h1>
                    </div>
                    <button className="p-2 rounded-full bg-white/20 hover:bg-white/30">
                        <MenuIcon />
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">{mockDashboardData.todayOrders}</p>
                        <p className="text-xs text-white/80">Today&apos;s Orders</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">{mockDashboardData.pendingOrders}</p>
                        <p className="text-xs text-white/80">Pending</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                        <p className="text-2xl font-bold">₹{mockDashboardData.todayEarnings}</p>
                        <p className="text-xs text-white/80">Today&apos;s Earnings</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="flex">
                    {[
                        { id: 'today', label: 'Orders' },
                        { id: 'kitchen', label: 'My Kitchen' },
                        { id: 'earnings', label: 'Earnings' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-terracotta border-b-2 border-terracotta'
                                : 'text-gray-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'today' && (
                    <div className="space-y-4">
                        {/* Capacity Status */}
                        <div className="card p-4">
                            <h2 className="font-semibold text-brown mb-3">Today&apos;s Capacity</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm">🌅 Morning</span>
                                        <span className="text-sm font-medium">
                                            {mockDashboardData.capacity.morning.current}/{mockDashboardData.capacity.morning.max}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-saffron rounded-full h-2"
                                            style={{ width: `${(mockDashboardData.capacity.morning.current / mockDashboardData.capacity.morning.max) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm">🌆 Evening</span>
                                        <span className="text-sm font-medium">
                                            {mockDashboardData.capacity.evening.current}/{mockDashboardData.capacity.evening.max}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-terracotta rounded-full h-2"
                                            style={{ width: `${(mockDashboardData.capacity.evening.current / mockDashboardData.capacity.evening.max) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders */}
                        <h2 className="font-semibold text-brown">Active Orders</h2>
                        {orders.map((order) => (
                            <div key={order.id} className="card p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-brown">{order.id}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">{order.customer}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-terracotta">₹{order.total}</p>
                                        <p className="text-xs text-gray-500">{order.slot} Slot</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 p-2 rounded-lg bg-gray-50">
                                    {order.items}
                                </p>
                                {getStatusButton(order)}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'kitchen' && (
                    <div className="space-y-4">
                        {/* Menu Items */}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-semibold text-brown">My Menu</h2>
                            <button className="text-terracotta text-sm font-medium">+ Add Item</button>
                        </div>
                        {[
                            { name: 'Bellam Gavvalu', price: 199, available: true, stock: 15 },
                            { name: 'Ariselu', price: 249, available: true, stock: 10 },
                            { name: 'Sunnundalu', price: 349, available: false, stock: 0 },
                            { name: 'Kajjikayalu', price: 229, available: true, stock: 20 },
                        ].map((item, idx) => (
                            <div key={idx} className="card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-saffron/20 flex items-center justify-center text-2xl">
                                        🍪
                                    </div>
                                    <div>
                                        <p className="font-medium text-brown">{item.name}</p>
                                        <p className="text-sm text-terracotta font-semibold">₹{item.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{item.stock} left</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            defaultChecked={item.available}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-terracotta/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta"></div>
                                    </label>
                                </div>
                            </div>
                        ))}

                        {/* Vacation Mode */}
                        <div className="card p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-brown">Vacation Mode</p>
                                    <p className="text-sm text-gray-500">Pause new orders temporarily</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-terracotta/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'earnings' && (
                    <div className="space-y-4">
                        {/* Earnings Card */}
                        <div className="card p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50">
                            <p className="text-gray-600 mb-2">This Week&apos;s Earnings</p>
                            <p className="text-4xl font-bold text-green-600 mb-1">₹{mockDashboardData.weeklyEarnings.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">15% commission deducted</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-terracotta">156</p>
                                <p className="text-sm text-gray-500">Orders This Week</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-2xl font-bold text-saffron">4.8★</p>
                                <p className="text-sm text-gray-500">Avg Rating</p>
                            </div>
                        </div>

                        {/* Payout */}
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-medium text-brown">Pending Payout</p>
                                    <p className="text-2xl font-bold text-green-600">₹13,328</p>
                                </div>
                                <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600">
                                    Withdraw
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Payouts processed every Monday</p>
                        </div>

                        {/* Best Sellers */}
                        <div>
                            <h2 className="font-semibold text-brown mb-3">Top Selling Items</h2>
                            <div className="space-y-2">
                                {[
                                    { name: 'Bellam Gavvalu', orders: 45, revenue: 8955 },
                                    { name: 'Ariselu', orders: 38, revenue: 9462 },
                                    { name: 'Kajjikayalu', orders: 28, revenue: 6412 },
                                ].map((item, idx) => (
                                    <div key={idx} className="card p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-brown">₹{item.revenue.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">{item.orders} orders</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
