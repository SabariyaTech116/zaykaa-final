'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data
const mockOrders = [
    {
        id: 'ZYK-20260103001',
        customer: { name: 'Priya M.', phone: '9876543210' },
        homemaker: { name: "Sarala's Kitchen", id: 'hm001' },
        items: [
            { name: 'Bellam Gavvalu', quantity: 2, price: 199 },
            { name: 'Ariselu', quantity: 1, price: 249 },
        ],
        subtotal: 647,
        deliveryFee: 25,
        total: 672,
        status: 'delivered' as const,
        slot: 'Morning',
        date: '2026-01-03',
        paymentMethod: 'UPI',
        paymentStatus: 'success',
        address: '123 Rainbow Vistas, Hitech City',
    },
    {
        id: 'ZYK-20260103002',
        customer: { name: 'Rahul K.', phone: '9876543211' },
        homemaker: { name: "Lakshmi's Bites", id: 'hm002' },
        items: [
            { name: 'Murukku', quantity: 5, price: 149 },
        ],
        subtotal: 745,
        deliveryFee: 25,
        total: 770,
        status: 'processing' as const,
        slot: 'Evening',
        date: '2026-01-03',
        paymentMethod: 'Card',
        paymentStatus: 'success',
        address: '456 Cyber Towers, Madhapur',
    },
    {
        id: 'ZYK-20260103003',
        customer: { name: 'Anjali S.', phone: '9876543212' },
        homemaker: { name: "Sarala's Kitchen", id: 'hm001' },
        items: [
            { name: 'Kajjikayalu', quantity: 2, price: 229 },
        ],
        subtotal: 458,
        deliveryFee: 25,
        total: 483,
        status: 'pending' as const,
        slot: 'Morning',
        date: '2026-01-04',
        paymentMethod: 'Wallet',
        paymentStatus: 'success',
        address: '789 My Home Hub, Gachibowli',
    },
];

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
    processing: { label: 'Processing', color: 'bg-orange-100 text-orange-700' },
    ready: { label: 'Ready', color: 'bg-purple-100 text-purple-700' },
    out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-700' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function AdminOrdersPage() {
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);

    const filteredOrders = filter === 'all'
        ? mockOrders
        : mockOrders.filter(o => o.status === filter);

    const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
    const todayOrders = mockOrders.length;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-soft">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-brown">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-brown">Order Management</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
                            <p className="text-lg font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Orders Today</p>
                            <p className="text-lg font-bold text-brown">{todayOrders}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'pending', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-terracotta text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'all' ? 'All Orders' : statusConfig[status as OrderStatus].label}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order ID</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Homemaker</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Slot</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-brown">{order.id}</p>
                                        <p className="text-xs text-gray-400">{order.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{order.customer.name}</p>
                                        <p className="text-sm text-gray-500">{order.customer.phone}</p>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.homemaker.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                                            {order.slot}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-terracotta">₹{order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                                            {statusConfig[order.status].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-terracotta hover:underline text-sm"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No orders found with the selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-brown">Order Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Order Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="font-bold text-lg">{selectedOrder.id}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.date} • {selectedOrder.slot} Slot</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedOrder.status].color}`}>
                                    {statusConfig[selectedOrder.status].label}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="p-4 rounded-lg bg-gray-50 mb-4">
                                <p className="text-sm text-gray-500 mb-1">Customer</p>
                                <p className="font-medium">{selectedOrder.customer.name}</p>
                                <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                                <p className="text-sm text-gray-600 mt-2">{selectedOrder.address}</p>
                            </div>

                            {/* Homemaker Info */}
                            <div className="p-4 rounded-lg bg-orange-50 mb-4">
                                <p className="text-sm text-gray-500 mb-1">Homemaker</p>
                                <p className="font-medium text-terracotta">{selectedOrder.homemaker.name}</p>
                            </div>

                            {/* Items */}
                            <div className="mb-4">
                                <p className="text-sm font-medium text-gray-500 mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between">
                                            <span>{item.name} x{item.quantity}</span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="p-4 rounded-lg bg-green-50 mb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">Payment</p>
                                        <p className="font-medium">{selectedOrder.paymentMethod}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-green-600">₹{selectedOrder.total}</p>
                                        <p className="text-xs text-green-600">✓ {selectedOrder.paymentStatus}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
                                    Contact Customer
                                </button>
                                <button className="flex-1 py-2 rounded-lg bg-terracotta text-white hover:bg-terracotta/90">
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
