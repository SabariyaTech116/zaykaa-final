'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data
const mockHomemakers = [
    {
        id: '1',
        kitchenName: "Meera's Kitchen",
        ownerName: 'Meera Sharma',
        phone: '9876543210',
        city: 'Hyderabad',
        specialty: 'Sweets',
        famousFor: 'Gulab Jamun, Rasmalai',
        appliedAt: '2 hours ago',
        status: 'pending' as const,
        experience: '10+ years',
        hasFssai: true,
    },
    {
        id: '2',
        kitchenName: "Ramu's Pickles",
        ownerName: 'Ramu Reddy',
        phone: '9876543211',
        city: 'Vijayawada',
        specialty: 'Pickles',
        famousFor: 'Avakaya, Gongura',
        appliedAt: '5 hours ago',
        status: 'pending' as const,
        experience: '15+ years',
        hasFssai: false,
    },
    {
        id: '3',
        kitchenName: "Gita Didi's Kitchen",
        ownerName: 'Gita Patel',
        phone: '9876543212',
        city: 'Ahmedabad',
        specialty: 'Gujarati Snacks',
        famousFor: 'Dhokla, Thepla',
        appliedAt: '1 day ago',
        status: 'under_review' as const,
        experience: '20+ years',
        hasFssai: true,
    },
    {
        id: '4',
        kitchenName: "Sarala's Kitchen",
        ownerName: 'Sarala Rao',
        phone: '9876543213',
        city: 'Hyderabad',
        specialty: 'Andhra Sweets',
        famousFor: 'Bellam Gavvalu',
        appliedAt: '2 weeks ago',
        status: 'approved' as const,
        experience: '25+ years',
        hasFssai: true,
    },
];

type HomemakerStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface Homemaker {
    id: string;
    kitchenName: string;
    ownerName: string;
    phone: string;
    city: string;
    specialty: string;
    famousFor: string;
    appliedAt: string;
    status: HomemakerStatus;
    experience: string;
    hasFssai: boolean;
}

const statusConfig: Record<HomemakerStatus, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
};

export default function HomemakersAdminPage() {
    const [filter, setFilter] = useState<HomemakerStatus | 'all'>('all');
    // Using explicit interface to avoid type inference issues
    const [homemakers, setHomemakers] = useState<Homemaker[]>(mockHomemakers);
    const [selectedHomemaker, setSelectedHomemaker] = useState<Homemaker | null>(null);

    const filteredHomemakers = filter === 'all'
        ? homemakers
        : homemakers.filter(h => h.status === filter);

    const handleApprove = (id: string) => {
        setHomemakers(homemakers.map(h =>
            h.id === id ? { ...h, status: 'approved' as const } : h
        ));
        setSelectedHomemaker(null);
    };

    const handleReject = (id: string) => {
        setHomemakers(homemakers.map(h =>
            h.id === id ? { ...h, status: 'rejected' as const } : h
        ));
        setSelectedHomemaker(null);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-soft">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-gray-500 hover:text-brown">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-bold text-brown">Homemaker Management</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-terracotta text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'all' ? 'All' : statusConfig[status as HomemakerStatus].label}
                            {status === 'pending' && (
                                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {homemakers.filter(h => h.status === 'pending').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Kitchen</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Location</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Specialty</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">FSSAI</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredHomemakers.map((homemaker) => (
                                <tr key={homemaker.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white">
                                                👩‍🍳
                                            </div>
                                            <div>
                                                <p className="font-medium text-brown">{homemaker.kitchenName}</p>
                                                <p className="text-sm text-gray-500">{homemaker.ownerName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{homemaker.city}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                                            {homemaker.specialty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {homemaker.hasFssai ? (
                                            <span className="text-green-600">✓ Verified</span>
                                        ) : (
                                            <span className="text-gray-400">Not provided</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[homemaker.status].color}`}>
                                            {statusConfig[homemaker.status].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedHomemaker(homemaker)}
                                            className="text-terracotta hover:underline text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredHomemakers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No homemakers found with the selected filter.
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedHomemaker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-brown">Review Application</h2>
                            <button
                                onClick={() => setSelectedHomemaker(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Profile Header */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white text-3xl">
                                    👩‍🍳
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-brown">{selectedHomemaker.kitchenName}</h3>
                                    <p className="text-gray-500">{selectedHomemaker.ownerName}</p>
                                    <p className="text-sm text-gray-400">{selectedHomemaker.city}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium">{selectedHomemaker.phone}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Specialty</p>
                                    <p className="font-medium">{selectedHomemaker.specialty}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Famous For</p>
                                    <p className="font-medium">{selectedHomemaker.famousFor}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                    <p className="text-xs text-gray-500">Experience</p>
                                    <p className="font-medium">{selectedHomemaker.experience}</p>
                                </div>
                            </div>

                            {/* FSSAI Status */}
                            <div className={`p-4 rounded-lg mb-6 ${selectedHomemaker.hasFssai ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <p className={`font-medium ${selectedHomemaker.hasFssai ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {selectedHomemaker.hasFssai ? '✓ FSSAI License Verified' : '⚠️ FSSAI License Not Provided'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedHomemaker.hasFssai
                                        ? 'Kitchen has valid FSSAI certification.'
                                        : 'Applicant indicated they are willing to obtain license.'}
                                </p>
                            </div>

                            {/* Actions */}
                            {selectedHomemaker.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleReject(selectedHomemaker.id)}
                                        className="flex-1 py-3 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedHomemaker.id)}
                                        className="flex-1 py-3 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600"
                                    >
                                        Approve ✓
                                    </button>
                                </div>
                            )}

                            {selectedHomemaker.status !== 'pending' && (
                                <div className={`text-center py-3 rounded-lg ${statusConfig[selectedHomemaker.status].color}`}>
                                    {statusConfig[selectedHomemaker.status].label}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
