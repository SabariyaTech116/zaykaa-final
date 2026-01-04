'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/Navigation';

const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export default function BecomeChefPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        kitchenName: '',
        phone: '',
        city: '',
        specialty: '',
        experience: '',
        famousFor: '',
        hasFssai: false,
        bio: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = () => {
        // TODO: API call to register homemaker
        alert('Application submitted! We will contact you within 48 hours.');
    };

    const benefits = [
        { icon: '💰', title: 'Earn ₹15,000+/month', desc: 'Top chefs earn over ₹50,000' },
        { icon: '⏰', title: 'Flexible Hours', desc: 'Cook when you want' },
        { icon: '📦', title: 'We Handle Logistics', desc: 'Packaging & delivery on us' },
        { icon: '📱', title: 'Simple App', desc: 'Manage orders easily' },
        { icon: '💳', title: 'Weekly Payouts', desc: 'Direct to your bank' },
        { icon: '📈', title: 'Grow Your Brand', desc: 'Build your kitchen\'s reputation' },
    ];

    return (
        <div className="min-h-screen bg-cream pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <BackIcon />
                    </Link>
                    <h1 className="font-display text-xl font-semibold">Become a Home Chef</h1>
                </div>
            </header>

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-terracotta to-saffron text-white p-6 text-center">
                <span className="text-6xl mb-4 block">👩‍🍳</span>
                <h1 className="font-display text-3xl font-bold mb-2">
                    Turn Your Passion Into Income
                </h1>
                <p className="text-white/90">
                    Join 500+ homemakers earning from their kitchen
                </p>
            </div>

            {/* Benefits */}
            <div className="p-4">
                <h2 className="font-display text-xl font-semibold text-brown mb-4">
                    Why Join Zaykaa?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="card p-4 text-center">
                            <span className="text-3xl mb-2 block">{benefit.icon}</span>
                            <p className="font-semibold text-brown text-sm">{benefit.title}</p>
                            <p className="text-xs text-gray-500">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Form */}
            <div className="p-4">
                <h2 className="font-display text-xl font-semibold text-brown mb-4">
                    Register Your Kitchen
                </h2>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-terracotta text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > s ? <CheckIcon /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`flex-1 h-1 rounded ${step > s ? 'bg-terracotta' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1 - Basic Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Kitchen Name *</label>
                            <input
                                type="text"
                                name="kitchenName"
                                value={formData.kitchenName}
                                onChange={handleInputChange}
                                placeholder="e.g., Sarala's Kitchen"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="10-digit mobile number"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">City *</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="input-field"
                            >
                                <option value="">Select your city</option>
                                <option value="hyderabad">Hyderabad</option>
                                <option value="bangalore">Bangalore</option>
                                <option value="chennai">Chennai</option>
                                <option value="mumbai">Mumbai</option>
                                <option value="delhi">Delhi</option>
                            </select>
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            disabled={!formData.kitchenName || !formData.phone || !formData.city}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 2 - Kitchen Details */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Specialty *</label>
                            <select
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleInputChange}
                                className="input-field"
                            >
                                <option value="">What do you cook best?</option>
                                <option value="sweets">Sweets & Desserts</option>
                                <option value="savory">Savory Snacks</option>
                                <option value="pickles">Pickles & Chutneys</option>
                                <option value="meals">Home Meals</option>
                                <option value="baked">Baked Goods</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Famous For *</label>
                            <input
                                type="text"
                                name="famousFor"
                                value={formData.famousFor}
                                onChange={handleInputChange}
                                placeholder="e.g., Bellam Gavvalu, Murukku"
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Years of Experience</label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="input-field"
                            >
                                <option value="">Select</option>
                                <option value="1-5">1-5 years</option>
                                <option value="5-10">5-10 years</option>
                                <option value="10-20">10-20 years</option>
                                <option value="20+">20+ years</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="fssai"
                                name="hasFssai"
                                checked={formData.hasFssai}
                                onChange={handleInputChange}
                                className="w-5 h-5 rounded text-terracotta"
                            />
                            <label htmlFor="fssai" className="text-sm text-gray-600">
                                I have FSSAI license (or willing to get one)
                            </label>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 btn-secondary"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!formData.specialty || !formData.famousFor}
                                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3 - Story */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-brown mb-1">Your Story (Optional)</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us about your cooking journey, your family recipes, what makes your food special..."
                                className="input-field resize-none h-32"
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/500</p>
                        </div>

                        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-green-800 font-medium mb-2">✅ What Happens Next?</p>
                            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                                <li>Our team will call you within 48 hours</li>
                                <li>Quick kitchen verification (15 mins)</li>
                                <li>We help you set up your menu</li>
                                <li>Start receiving orders!</li>
                            </ol>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 btn-secondary"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 btn-primary"
                            >
                                Submit Application 🚀
                            </button>
                        </div>
                    </div>
                )}

                {/* Testimonial */}
                <div className="mt-8 p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-saffron/20 flex items-center justify-center text-2xl flex-shrink-0">
                            👩‍🍳
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm italic">
                                &quot;I started with 5 orders a day. Now I do 30+ orders and earn ₹45,000/month from my home kitchen. Zaykaa changed my life!&quot;
                            </p>
                            <p className="font-medium text-brown mt-2">- Lakshmi, Chennai</p>
                            <p className="text-xs text-gray-500">Member since 2024</p>
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
