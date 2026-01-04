'use client';

import { useState } from 'react';
import Link from 'next/link';

// Icons
const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const OrdersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
);

const ProductsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

// Mock data
const stats = {
    totalHomemakers: 523,
    pendingApprovals: 12,
    totalOrders: 8521,
    todayOrders: 156,
    totalRevenue: 2850000,
    todayRevenue: 48500,
};

const recentApplications = [
    { id: '1', name: "Meera's Kitchen", phone: '9876543210', city: 'Hyderabad', specialty: 'Sweets', appliedAt: '2 hours ago', status: 'pending' },
    { id: '2', name: "Ramu's Pickles", phone: '9876543211', city: 'Vijayawada', specialty: 'Pickles', appliedAt: '5 hours ago', status: 'pending' },
    { id: '3', name: "Gita Didi", phone: '9876543212', city: 'Ahmedabad', specialty: 'Gujarati Snacks', appliedAt: '1 day ago', status: 'under_review' },
];

const recentOrders = [
    { id: 'ZYK-001', customer: 'Priya M.', homemaker: "Sarala's Kitchen", total: 647, status: 'delivered' },
    { id: 'ZYK-002', customer: 'Rahul K.', homemaker: "Lakshmi's Bites", total: 1047, status: 'processing' },
    { id: 'ZYK-003', customer: 'Anjali S.', homemaker: "Sarala's Kitchen", total: 458, status: 'delivered' },
];

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-brown text-white transition-all duration-300 flex-shrink-0`}>
                <div className="p-4">
                    <h1 className={`font-display text-2xl font-bold text-gradient ${!sidebarOpen && 'text-center'}`}>
                        {sidebarOpen ? 'Zaykaa Admin' : 'Z'}
                    </h1>
                </div>
                <nav className="mt-8">
                    {[
                        { icon: DashboardIcon, label: 'Dashboard', href: '/admin', active: true },
                        { icon: UsersIcon, label: 'Homemakers', href: '/admin/homemakers' },
                        { icon: OrdersIcon, label: 'Orders', href: '/admin/orders' },
                        { icon: ProductsIcon, label: 'Products', href: '/admin/products' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 transition-colors ${item.active
                                    ? 'bg-white/10 border-r-4 border-saffron'
                                    : 'hover:bg-white/5'
                                }`}
                        >
                            <item.icon />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-brown">Dashboard</h1>
                        <p className="text-gray-500">Welcome back, Admin</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg bg-white shadow hover:bg-gray-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Homemakers</p>
                                <p className="text-3xl font-bold text-brown">{stats.totalHomemakers}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
                                <UsersIcon />
                            </div>
                        </div>
                        <p className="text-sm text-orange-500 mt-2">
                            +{stats.pendingApprovals} pending approvals
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Orders</p>
                                <p className="text-3xl font-bold text-brown">{stats.totalOrders.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <OrdersIcon />
                            </div>
                        </div>
                        <p className="text-sm text-green-500 mt-2">
                            +{stats.todayOrders} today
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Revenue</p>
                                <p className="text-3xl font-bold text-brown">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                💰
                            </div>
                        </div>
                        <p className="text-sm text-green-500 mt-2">
                            +₹{stats.todayRevenue.toLocaleString()} today
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-soft">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending Approvals</p>
                                <p className="text-3xl font-bold text-orange-500">{stats.pendingApprovals}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                ⏳
                            </div>
                        </div>
                        <Link href="/admin/homemakers" className="text-sm text-terracotta mt-2 block hover:underline">
                            Review now →
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Applications */}
                    <div className="bg-white rounded-xl shadow-soft">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg text-brown">Pending Applications</h2>
                                <Link href="/admin/homemakers" className="text-terracotta text-sm hover:underline">
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="divide-y">
                            {recentApplications.map((app) => (
                                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white">
                                            👩‍🍳
                                        </div>
                                        <div>
                                            <p className="font-medium text-brown">{app.name}</p>
                                            <p className="text-sm text-gray-500">{app.city} • {app.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{app.appliedAt}</span>
                                        <Link
                                            href={`/admin/homemakers/${app.id}`}
                                            className="px-3 py-1 rounded-lg bg-terracotta text-white text-sm hover:bg-terracotta/90"
                                        >
                                            Review
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl shadow-soft">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-lg text-brown">Recent Orders</h2>
                                <Link href="/admin/orders" className="text-terracotta text-sm hover:underline">
                                    View all
                                </Link>
                            </div>
                        </div>
                        <div className="divide-y">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-brown">{order.id}</p>
                                        <p className="text-sm text-gray-500">{order.customer} → {order.homemaker}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-terracotta">₹{order.total}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
