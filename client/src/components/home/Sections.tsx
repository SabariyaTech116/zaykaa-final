'use client';

import Link from 'next/link';

interface Collection {
    id: string;
    name: string;
    emoji: string;
    color: string;
}

const collections: Collection[] = [
    { id: 'sunday-special', name: 'Sunday Special', emoji: '🌞', color: 'from-amber-400 to-orange-500' },
    { id: 'kids-snacks', name: "Kids' Snacks", emoji: '🧒', color: 'from-pink-400 to-rose-500' },
    { id: 'festival-combos', name: 'Festival Combos', emoji: '🎉', color: 'from-purple-400 to-indigo-500' },
    { id: 'healthy-bites', name: 'Healthy Bites', emoji: '🥗', color: 'from-green-400 to-emerald-500' },
    { id: 'sweet-cravings', name: 'Sweet Cravings', emoji: '🍬', color: 'from-red-400 to-pink-500' },
    { id: 'pickles', name: 'Pickles & Chutneys', emoji: '🫙', color: 'from-yellow-400 to-lime-500' },
];

export function Collections() {
    return (
        <section className="py-6">
            <h2 className="font-display text-2xl font-semibold text-brown mb-4 px-4">
                Explore Collections
            </h2>
            <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {collections.map((collection) => (
                    <Link
                        key={collection.id}
                        href={`/collection/${collection.id}`}
                        className="flex-shrink-0"
                    >
                        <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${collection.color} p-4 flex flex-col items-center justify-center text-white transition-transform hover:scale-105`}>
                            <span className="text-3xl mb-1">{collection.emoji}</span>
                            <span className="text-xs font-medium text-center leading-tight">{collection.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

interface DietaryFilter {
    id: string;
    label: string;
    active: boolean;
}

interface DietaryFiltersProps {
    filters: DietaryFilter[];
    onFilterChange: (id: string) => void;
}

export function DietaryFilters({ filters, onFilterChange }: DietaryFiltersProps) {
    return (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter.active
                            ? 'bg-terracotta text-white shadow-warm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-terracotta'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-cream via-white to-orange-50 py-8 px-4">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-saffron/10 rounded-full blur-2xl" />

            <div className="relative max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-sage/20 text-sage text-sm font-medium mb-4">
                            ✨ Fresh from Home Kitchens
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-brown mb-4 leading-tight">
                            Taste the <span className="text-gradient">Tradition</span> in Every Bite
                        </h1>
                        <p className="text-lg text-gray-600 mb-6 max-w-lg">
                            Discover authentic homemade snacks crafted by talented homemakers.
                            From Nani&apos;s secret recipes to regional delicacies.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link href="/explore" className="btn-primary">
                                Order Now 🍪
                            </Link>
                            <Link href="/become-chef" className="btn-secondary">
                                Become a Chef 👩‍🍳
                            </Link>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 md:gap-8">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-terracotta">500+</p>
                            <p className="text-sm text-gray-500">Home Chefs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-saffron">10K+</p>
                            <p className="text-sm text-gray-500">Happy Customers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-sage">50+</p>
                            <p className="text-sm text-gray-500">Cities Served</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

interface WelcomeSamplerProps {
    isNewUser: boolean;
}

export function WelcomeSampler({ isNewUser }: WelcomeSamplerProps) {
    if (!isNewUser) return null;

    return (
        <section className="mx-4 my-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-terracotta via-saffron to-turmeric p-6 text-white">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="relative">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-3">
                        🎁 First Order Special
                    </span>
                    <h2 className="font-display text-2xl font-bold mb-2">
                        Welcome Sampler Box
                    </h2>
                    <p className="text-white/90 mb-4">
                        Try 4 bestselling items from top-rated chefs for just
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl font-bold">₹199</span>
                        <span className="text-lg line-through text-white/60">₹399</span>
                        <Link
                            href="/sampler"
                            className="ml-auto px-6 py-2.5 rounded-full bg-white text-terracotta font-semibold hover:bg-white/90 transition-colors"
                        >
                            Get Yours →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function TrustBadges() {
    const badges = [
        { icon: '✅', label: 'FSSAI Verified Kitchens' },
        { icon: '🌿', label: 'No Preservatives' },
        { icon: '🏠', label: 'Made Fresh Daily' },
        { icon: '📦', label: 'Eco-Friendly Packaging' },
    ];

    return (
        <section className="py-6 bg-white/50">
            <div className="flex gap-6 overflow-x-auto px-4 scrollbar-hide">
                {badges.map((badge, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-soft"
                    >
                        <span className="text-lg">{badge.icon}</span>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            {badge.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
