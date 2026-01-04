'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { PAYMENT_OPTIONS, type PaymentMethod } from '@/lib/payments';

// Icons
const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// Payment method display config with brand colors
const paymentIcons: Record<PaymentMethod, { icon: string; color: string }> = {
    upi: { icon: '📱', color: 'bg-green-50' },
    phonepe: { icon: '💜', color: 'bg-purple-50' },
    gpay: { icon: '🔵', color: 'bg-blue-50' },
    card: { icon: '💳', color: 'bg-gray-50' },
    netbanking: { icon: '🏦', color: 'bg-indigo-50' },
    wallet: { icon: '👛', color: 'bg-orange-50' },
    cod: { icon: '💵', color: 'bg-yellow-50' },
};

import { AddressModal } from '@/components/ui/AddressModal';
import { useToast } from '@/components/ui/Toast';

// ... (icons remain same)

export default function CheckoutPage() {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
    const [address, setAddress] = useState({
        label: 'Home',
        street: '123, Rainbow Vistas, Hitech City',
        city: 'Hyderabad',
        pincode: '500081',
        phoneNumber: '9876543210'
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const { showToast } = useToast();

    // Use cart context (with fallback for mock data)
    const { subtotal: cartSubtotal, selectedSlot } = useCart?.() || { subtotal: 0, selectedSlot: 'MORNING' };

    // Calculate order summary
    const subtotal = cartSubtotal || 847; // Fallback to mock
    const deliveryFee = 25;
    const packagingFee = 10;
    const selectedPaymentOption = PAYMENT_OPTIONS.find(p => p.id === paymentMethod);
    const prepaidDiscount = selectedPaymentOption?.discount ? Math.round(subtotal * (selectedPaymentOption.discount / 100)) : 0;
    const codFee = paymentMethod === 'cod' ? 25 : 0;
    const total = subtotal + deliveryFee + packagingFee - prepaidDiscount + codFee;

    const slotDisplay = selectedSlot === 'MORNING'
        ? 'Tomorrow Morning (6 AM - 8 AM)'
        : 'Tomorrow Evening (5 PM - 7 PM)';

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        try {
            // TODO: Create order via API first to get razorpayOrderId
            // const orderResponse = await ordersApi.create({ ... });

            if (paymentMethod === 'cod') {
                // COD - directly redirect to success
                window.location.href = '/orders/success?orderId=ZYK-20260103001&method=cod';
                return;
            }

            if (paymentMethod === 'phonepe') {
                showToast('Redirecting to secure payment gateway...', 'info');
                // PhonePe - redirect to PhonePe payment page
                // window.location.href = redirectUrl;
                setTimeout(() => {
                    window.location.href = '/orders/success?orderId=ZYK-20260103001&method=phonepe';
                }, 1500);
                return;
            }

            if (paymentMethod === 'gpay' || paymentMethod === 'upi') {
                showToast('Opening UPI Payment App...', 'info');
                setTimeout(() => {
                    window.location.href = '/orders/success?orderId=ZYK-20260103001&method=upi';
                }, 1500);
                return;
            }

            if (paymentMethod === 'card' || paymentMethod === 'netbanking') {
                showToast('Opening Secure Payment Gateway...', 'info');
                setTimeout(() => {
                    window.location.href = '/orders/success?orderId=ZYK-20260103001&method=card';
                }, 1500);
                return;
            }

            if (paymentMethod === 'wallet') {
                showToast('Payment successful from Wallet!', 'success');
                window.location.href = '/orders/success?orderId=ZYK-20260103001&method=wallet';
                return;
            }

        } catch (error) {
            console.error('Payment failed:', error);
            showToast('Payment failed. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream pb-32">
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSave={(newAddress) => {
                    setAddress(newAddress);
                    showToast('Address updated successfully!', 'success');
                }}
                initialAddress={address}
            />

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/cart" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <BackIcon />
                    </Link>
                    <h1 className="font-display text-xl font-semibold">Checkout</h1>
                </div>
            </header>

            <div className="px-4 py-4">
                {/* Delivery Address */}
                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-lg text-brown">Delivery Address</h2>
                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="text-terracotta text-sm font-medium hover:underline"
                        >
                            Change
                        </button>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
                            🏠
                        </div>
                        <div>
                            <p className="font-medium text-brown">{address.label}</p>
                            <p className="text-gray-600 text-sm">{address.street}</p>
                            <p className="text-gray-600 text-sm">{address.city} - {address.pincode}</p>
                        </div>
                    </div>
                </div>

                {/* Delivery Slot */}
                <div className="card p-4 mb-4">
                    <h2 className="font-semibold text-lg text-brown mb-3">Delivery Slot</h2>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                        <span className="text-2xl">{selectedSlot === 'MORNING' ? '🌅' : '🌆'}</span>
                        <div>
                            <p className="font-medium text-green-800">{slotDisplay}</p>
                            <p className="text-sm text-green-600">Freshly prepared & delivered</p>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="card p-4 mb-4">
                    <h2 className="font-semibold text-lg text-brown mb-4">Payment Method</h2>
                    <div className="space-y-3">
                        {PAYMENT_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setPaymentMethod(option.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === option.id
                                    ? 'border-terracotta bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg ${paymentIcons[option.id].color} shadow-sm flex items-center justify-center text-2xl`}>
                                    {paymentIcons[option.id].icon}
                                </div>
                                <div className="text-left flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-brown">{option.name}</p>
                                        {option.discount && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                {option.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                                {paymentMethod === option.id && (
                                    <div className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center">
                                        <CheckIcon />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {prepaidDiscount > 0 && (
                        <p className="text-xs text-green-600 mt-4 font-medium">
                            💚 You&apos;re saving ₹{prepaidDiscount} with {selectedPaymentOption?.name}!
                        </p>
                    )}
                    {paymentMethod === 'cod' && (
                        <p className="text-xs text-orange-600 mt-4 font-medium">
                            ⚠️ ₹25 handling fee applies for Cash on Delivery
                        </p>
                    )}
                </div>

                {/* Order Summary */}
                <div className="card p-4 mb-4">
                    <h2 className="font-semibold text-lg text-brown mb-4">Order Summary</h2>
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
                        {prepaidDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Prepaid Discount ({selectedPaymentOption?.discount}%)</span>
                                <span className="font-medium">-₹{prepaidDiscount}</span>
                            </div>
                        )}
                        {codFee > 0 && (
                            <div className="flex justify-between text-orange-600">
                                <span>COD Handling Fee</span>
                                <span className="font-medium">+₹{codFee}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold text-brown">Total</span>
                                <span className="font-bold text-terracotta">₹{total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                    <span>🔒</span>
                    <span>Secured by {paymentMethod === 'phonepe' ? 'PhonePe' : 'Razorpay'}</span>
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className={`w-full btn-primary flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                >
                    {isProcessing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>Pay ₹{total}</span>
                            <span>→</span>
                        </>
                    )}
                </button>
                <p className="text-xs text-center text-gray-400 mt-2">
                    By placing this order, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}
