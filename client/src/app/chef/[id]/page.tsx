'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header, BottomNav } from '@/components/ui/Navigation';

// Icons
const StarIcon = () => (
    <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
);

const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const PlayIcon = () => (
    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

// Mock homemaker data
const mockHomemaker = {
    id: 'chef01',
    kitchenName: "Sarala's Kitchen",
    bio: "I've been cooking traditional Andhra sweets for over 25 years. What started as making treats for my family has now become my passion. Every recipe I share carries the love and traditions of my grandmother's kitchen.",
    profileImage: null,
    coverImage: null,
    hasVideo: true,
    rating: { average: 4.8, count: 312 },
    famousFor: 'Bellam Gavvalu & Ariselu',
    specialty: ['Andhra Sweets', 'Traditional Recipes', 'Festival Specials'],
    city: 'Hyderabad',
    memberSince: 'January 2024',
    ordersCompleted: 1250,
    repeatCustomerRate: 68,
    badges: ['Top Rated', 'Quick Responder', 'Festival Star'],
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    capacity: {
        morning: { available: true, slots: '8 slots left' },
        evening: { available: true, slots: '12 slots left' },
    },
};

const mockProducts = [
    { id: 'prod001', name: 'Bellam Gavvalu', price: 250, discountedPrice: 199, rating: 4.8, reviewCount: 156, isVeg: true },
    { id: 'prod002', name: 'Ariselu', price: 299, discountedPrice: 249, rating: 4.9, reviewCount: 203, isVeg: true },
    { id: 'prod003', name: 'Sunnundalu', price: 349, discountedPrice: null, rating: 4.7, reviewCount: 89, isVeg: true },
    { id: 'prod004', name: 'Kajjikayalu', price: 279, discountedPrice: 229, rating: 4.8, reviewCount: 145, isVeg: true },
];

export default function ChefProfilePage() {
    const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
    const homemaker = mockHomemaker;

    return (
        <div className="min-h-screen bg-cream pb-20">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <BackIcon />
                    </Link>
                    <h1 className="font-display text-xl font-semibold">{homemaker.kitchenName}</h1>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-br from-terracotta to-saffron">
                {/* Video Play Button */}
                {homemaker.hasVideo && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                        <div className="flex flex-col items-center gap-2">
                            <PlayIcon />
                            <span className="text-white text-sm font-medium">Watch Kitchen Story</span>
                        </div>
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className="px-4 -mt-16 relative z-10">
                <div className="card p-6">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white text-4xl shadow-warm -mt-12">
                            👩‍🍳
                        </div>
                        <div className="flex-1">
                            <h1 className="font-display text-2xl font-bold text-brown">
                                {homemaker.kitchenName}
                            </h1>
                            <p className="text-gray-500">{homemaker.city}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50">
                                    <StarIcon />
                                    <span className="font-semibold text-green-700">{homemaker.rating.average}</span>
                                    <span className="text-gray-500 text-sm">({homemaker.rating.count})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {homemaker.badges.map((badge) => (
                            <span
                                key={badge}
                                className="px-3 py-1 rounded-full bg-gradient-to-r from-terracotta to-saffron text-white text-xs font-medium"
                            >
                                ✨ {badge}
                            </span>
                        ))}
                    </div>

                    {/* Bio */}
                    <p className="text-gray-600 mb-4">{homemaker.bio}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-cream">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-terracotta">{homemaker.ordersCompleted}</p>
                            <p className="text-xs text-gray-500">Orders</p>
                        </div>
                        <div className="text-center border-x border-gray-200">
                            <p className="text-2xl font-bold text-saffron">{homemaker.repeatCustomerRate}%</p>
                            <p className="text-xs text-gray-500">Repeat Rate</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-sage">2 Yrs</p>
                            <p className="text-xs text-gray-500">Experience</p>
                        </div>
                    </div>

                    {/* Specialty Tags */}
                    <div className="mt-4">
                        <p className="text-sm font-medium text-brown mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                            {homemaker.specialty.map((item) => (
                                <span
                                    key={item}
                                    className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">📅 Available Slots for Tomorrow</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <span>🌅</span>
                                <div>
                                    <p className="text-sm font-medium">Morning</p>
                                    <p className="text-xs text-green-600">{homemaker.capacity.morning.slots}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🌆</span>
                                <div>
                                    <p className="text-sm font-medium">Evening</p>
                                    <p className="text-xs text-green-600">{homemaker.capacity.evening.slots}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-14 z-40 bg-cream px-4 py-3">
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'menu'
                                ? 'text-terracotta border-b-2 border-terracotta'
                                : 'text-gray-500'
                            }`}
                    >
                        Menu ({mockProducts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'reviews'
                                ? 'text-terracotta border-b-2 border-terracotta'
                                : 'text-gray-500'
                            }`}
                    >
                        Reviews ({homemaker.rating.count})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                {activeTab === 'menu' && (
                    <div className="space-y-4">
                        {mockProducts.map((product) => {
                            const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
                            return (
                                <Link key={product.id} href={`/product/${product.id}`}>
                                    <div className="card p-4 flex gap-4">
                                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-saffron/20 to-turmeric/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-4xl">🍪</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="badge-veg mb-1">
                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                        Veg
                                                    </span>
                                                    <h3 className="font-semibold text-brown">{product.name}</h3>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <StarIcon />
                                                        <span>{product.rating}</span>
                                                        <span>({product.reviewCount})</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-lg font-bold text-terracotta">
                                                    ₹{product.discountedPrice || product.price}
                                                </span>
                                                {hasDiscount && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ₹{product.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                alert('Added to cart!');
                                            }}
                                            className="self-end px-4 py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90"
                                        >
                                            ADD
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-4">
                        {[
                            { id: '1', user: 'Priya M.', rating: 5, comment: 'Absolutely divine! The Gavvalu were perfectly crispy and the jaggery coating was just right. Takes me back to my childhood.', date: '2 days ago' },
                            { id: '2', user: 'Rahul K.', rating: 5, comment: 'Best Ariselu I have ever had outside of my grandmother\'s kitchen. Will order again!', date: '1 week ago' },
                            { id: '3', user: 'Anjali S.', rating: 4, comment: 'Great taste and authentic flavors. Packaging could be better for long distance delivery.', date: '2 weeks ago' },
                        ].map((review) => (
                            <div key={review.id} className="card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium">
                                            {review.user[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-brown">{review.user}</p>
                                            <p className="text-xs text-gray-500">{review.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-50">
                                        <StarIcon />
                                        <span className="font-semibold text-green-700">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
