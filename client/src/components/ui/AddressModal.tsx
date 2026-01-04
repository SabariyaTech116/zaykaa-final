'use client';

import { useState } from 'react';

interface Address {
    id?: string;
    label: string; // e.g., "Home", "Work"
    street: string;
    city: string;
    pincode: string;
    phoneNumber: string;
}

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: Address) => void;
    initialAddress?: Address;
}

export function AddressModal({ isOpen, onClose, onSave, initialAddress }: AddressModalProps) {
    const [formData, setFormData] = useState<Address>(
        initialAddress || {
            label: 'Home',
            street: '',
            city: 'Hyderabad',
            pincode: '',
            phoneNumber: ''
        }
    );

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-scale-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brown">
                        {initialAddress ? 'Edit Address' : 'Add New Address'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Label Selection */}
                    <div className="flex gap-3 mb-2">
                        {['Home', 'Work', 'Other'].map((label) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setFormData({ ...formData, label })}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${formData.label === label
                                        ? 'border-terracotta bg-orange-50 text-terracotta'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <textarea
                            required
                            rows={2}
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            placeholder="Flat No, Building, Street"
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                required
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                            <input
                                required
                                type="text"
                                pattern="[0-9]{6}"
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                placeholder="500081"
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                        <input
                            required
                            type="tel"
                            pattern="[0-9]{10}"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="9876543210"
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-terracotta/20 outline-none transition-all"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full btn-primary py-3 rounded-xl font-medium shadow-lg shadow-terracotta/20"
                        >
                            Save Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
