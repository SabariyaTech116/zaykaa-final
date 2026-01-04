'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId') || 'ZYK-XXXXXXX';
    const method = searchParams.get('method') || 'upi';

    const paymentMethodNames: Record<string, string> = {
        upi: 'UPI',
        phonepe: 'PhonePe',
        gpay: 'Google Pay',
        card: 'Card',
        netbanking: 'Net Banking',
        wallet: 'Zaykaa Wallet',
        cod: 'Cash on Delivery',
    };

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
            {/* Success Animation */}
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce">
                <span className="text-5xl">✓</span>
            </div>

            <h1 className="font-display text-3xl font-bold text-brown mb-2 text-center">
                Order Placed! 🎉
            </h1>
            <p className="text-gray-600 text-center mb-6">
                Your delicious homemade food is being prepared
            </p>

            {/* Order Details Card */}
            <div className="card p-6 w-full max-w-sm mb-6">
                <div className="text-center mb-4">
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="text-xl font-bold text-terracotta">{orderId}</p>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium">{paymentMethodNames[method]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Delivery Slot</span>
                        <span className="font-medium">Tomorrow Morning</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium text-green-600">Confirmed ✓</span>
                    </div>
                </div>
            </div>

            {/* What's Next */}
            <div className="card p-4 w-full max-w-sm mb-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                <p className="font-medium text-brown mb-3">What&apos;s Next?</p>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-xs">1</span>
                        <span>Our chef starts preparing your order</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-saffron text-white flex items-center justify-center text-xs">2</span>
                        <span>Get notified when it&apos;s ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sage text-white flex items-center justify-center text-xs">3</span>
                        <span>Delivery partner picks up your order</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-sm space-y-3">
                <Link href={`/orders/${orderId}`} className="btn-primary w-full block text-center">
                    Track Order 📍
                </Link>
                <Link href="/" className="btn-secondary w-full block text-center">
                    Continue Shopping
                </Link>
            </div>

            {/* Share */}
            <p className="text-sm text-gray-500 mt-6">
                Love Zaykaa? <span className="text-terracotta font-medium">Share with friends</span>
            </p>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}
