// Payment Gateway Integration
// Supports Razorpay and PhonePe

interface PaymentConfig {
    razorpayKey: string;
    phonePeMerchantId: string;
    phonePeSaltKey: string;
    phonePeSaltIndex: number;
}

interface OrderData {
    orderId: string;
    amount: number; // in paisa
    currency: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    description?: string;
}

interface PaymentResult {
    success: boolean;
    transactionId?: string;
    paymentMethod: string;
    error?: string;
}

// Razorpay Integration
export async function initRazorpay(
    orderData: OrderData,
    razorpayOrderId: string,
    config: Pick<PaymentConfig, 'razorpayKey'>
): Promise<PaymentResult> {
    return new Promise((resolve) => {
        // Dynamically load Razorpay script if not loaded
        if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
            script.onload = () => openRazorpay();
        } else {
            openRazorpay();
        }

        function openRazorpay() {
            const options = {
                key: config.razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'Zaykaa',
                description: orderData.description || 'Authentic Homemade Food',
                image: '/logo.png',
                order_id: razorpayOrderId,
                prefill: {
                    name: orderData.customerName,
                    email: orderData.customerEmail,
                    contact: orderData.customerPhone,
                },
                theme: {
                    color: '#C45C3A',
                },
                handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
                    resolve({
                        success: true,
                        transactionId: response.razorpay_payment_id,
                        paymentMethod: 'razorpay',
                    });
                },
                modal: {
                    ondismiss: function () {
                        resolve({
                            success: false,
                            paymentMethod: 'razorpay',
                            error: 'Payment cancelled by user',
                        });
                    },
                },
            };

            const razorpay = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
            razorpay.open();
        }
    });
}

// PhonePe Integration
export async function initPhonePe(
    orderData: OrderData,
    callbackUrl: string
): Promise<{ redirectUrl: string }> {
    // PhonePe requires server-side signature generation
    // This function will call our backend to create a PhonePe payment request
    const response = await fetch('/api/payments/phonepe/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: orderData.orderId,
            amount: orderData.amount,
            customerPhone: orderData.customerPhone,
            callbackUrl,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to initialize PhonePe payment');
    }

    return response.json();
}

// UPI Intent (works with any UPI app including PhonePe, GPay, Paytm)
export function generateUPILink(
    orderData: OrderData,
    upiId: string
): string {
    const params = new URLSearchParams({
        pa: upiId, // Payee VPA
        pn: 'Zaykaa', // Payee Name
        am: (orderData.amount / 100).toString(), // Amount in rupees
        tn: orderData.description || `Order ${orderData.orderId}`, // Transaction note
        tr: orderData.orderId, // Transaction reference
        cu: 'INR',
    });

    return `upi://pay?${params.toString()}`;
}

// Payment method types
export type PaymentMethod = 'upi' | 'phonepe' | 'gpay' | 'card' | 'netbanking' | 'wallet' | 'cod';

export interface PaymentOption {
    id: PaymentMethod;
    name: string;
    icon: string;
    description: string;
    discount?: number; // Percentage discount for this method
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        id: 'upi',
        name: 'UPI',
        icon: '📱',
        description: 'Pay using any UPI app',
        discount: 5,
    },
    {
        id: 'phonepe',
        name: 'PhonePe',
        icon: '💜',
        description: 'Pay with PhonePe wallet or UPI',
        discount: 5,
    },
    {
        id: 'gpay',
        name: 'Google Pay',
        icon: '🔵',
        description: 'Pay with Google Pay',
        discount: 5,
    },
    {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Visa, Mastercard, RuPay',
    },
    {
        id: 'netbanking',
        name: 'Net Banking',
        icon: '🏦',
        description: 'All major banks supported',
    },
    {
        id: 'wallet',
        name: 'Zaykaa Wallet',
        icon: '👛',
        description: 'Use your wallet balance',
    },
    {
        id: 'cod',
        name: 'Cash on Delivery',
        icon: '💵',
        description: '+₹25 handling fee',
    },
];

// Verify payment on server
export async function verifyPayment(
    paymentMethod: PaymentMethod,
    paymentData: Record<string, string>
): Promise<{ verified: boolean; orderId: string }> {
    const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod, ...paymentData }),
    });

    if (!response.ok) {
        throw new Error('Payment verification failed');
    }

    return response.json();
}
