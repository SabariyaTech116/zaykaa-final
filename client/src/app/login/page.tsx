'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const { login, sendOtp, user } = useAuth();
    const router = useRouter();

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const validatePhone = (phone: string) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(phone);
    };

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');

        if (!validatePhone(phone)) {
            setError('Please enter a valid 10-digit Indian mobile number');
            return;
        }

        setIsLoading(true);

        try {
            await sendOtp(phone);
            setStep('otp');
            setTimer(30); // Start 30s timer
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = () => {
        if (timer === 0) {
            handleSendOtp();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(phone, otp);
            // Redirection handled by useEffect
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
            setIsLoading(false);
        }
    };

    // ... useEffect for redirection (kept as is) ...
    // Note: In a real replacement, we would keep the useEffect block here.
    // For brevity in this tool call, I am assuming the tool matches by context. 
    // Since I'm replacing the entire function body logic related to state/handlers, I need to include the Redirection Effect from previous step or re-declare it.
    // To be safe and precise with `replace_file_content`, I should probably target specific blocks or replace the whole component if `StartLine` covers it.
    // The previous `view_file` showed lines 1-202. 
    // I will replace the component logic carefully.

    // (Redirection Effect from lines 88-98 needs to be preserved)
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                router.push('/admin');
            } else if (user.role === 'homemaker') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-terracotta to-saffron rounded-full flex items-center justify-center text-white text-2xl">
                        🥘
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to Zaykaa
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Taste the tradition
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'phone' ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // Only numbers
                                            if (val.length <= 10) setPhone(val);
                                        }}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm"
                                        placeholder="9999999999"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Enter your 10-digit mobile number</p>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || phone.length !== 10}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    Enter OTP
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        autoComplete="one-time-code"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-terracotta focus:border-terracotta sm:text-sm text-center tracking-widest text-lg"
                                        placeholder="123456"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Change number
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={timer > 0 || isLoading}
                                        className={`font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-terracotta hover:text-brown'}`}
                                    >
                                        {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-terracotta hover:bg-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
