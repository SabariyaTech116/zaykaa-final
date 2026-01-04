'use client';

import Image from 'next/image';
import Link from 'next/link';

// Star Icon
const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
    </svg>
);

// Play Icon for video
const PlayIcon = () => (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

interface HomemakerCardProps {
    id: string;
    kitchenName: string;
    famousFor: string;
    rating: number;
    reviewCount: number;
    city: string;
    profileImage?: string;
    hasVideo?: boolean;
    nextSlot: string;
    specialty: string[];
}

export function HomemakerCard({
    id,
    kitchenName,
    famousFor,
    rating,
    reviewCount,
    city,
    profileImage,
    hasVideo,
    nextSlot,
    specialty,
}: HomemakerCardProps) {
    return (
        <Link href={`/chef/${id}`} className="block">
            <div className="card group overflow-hidden">
                {/* Image Container */}
                <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                    {profileImage ? (
                        <Image
                            src={profileImage}
                            alt={kitchenName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-terracotta/20 to-saffron/20 flex items-center justify-center">
                            <span className="text-6xl">👩‍🍳</span>
                        </div>
                    )}

                    {/* Video Indicator */}
                    {hasVideo && (
                        <button className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <PlayIcon />
                        </button>
                    )}

                    {/* Next Slot Badge */}
                    <div className="absolute bottom-3 left-3 z-20">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-medium text-brown">
                            🕐 {nextSlot}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div>
                    {/* Kitchen Name & Rating */}
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-xl font-semibold text-brown group-hover:text-terracotta transition-colors">
                            {kitchenName}
                        </h3>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50">
                            <StarIcon />
                            <span className="font-semibold text-green-700">{rating.toFixed(1)}</span>
                        </div>
                    </div>

                    {/* Famous For */}
                    <p className="text-gray-600 mb-3">
                        <span className="text-terracotta font-medium">Famous for:</span> {famousFor}
                    </p>

                    {/* Specialty Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {specialty.slice(0, 3).map((item) => (
                            <span
                                key={item}
                                className="px-2 py-1 rounded-full bg-cream text-sm text-brown/70"
                            >
                                {item}
                            </span>
                        ))}
                    </div>

                    {/* Location & Reviews */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {city}
                        </span>
                        <span>{reviewCount} reviews</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    image?: string;
    category: string;
    isVegetarian: boolean;
    rating: number;
    homemakerName: string;
}

export function ProductCard({
    id,
    name,
    price,
    discountedPrice,
    image,
    category,
    isVegetarian,
    rating,
    homemakerName,
}: ProductCardProps) {
    const hasDiscount = discountedPrice && discountedPrice < price;
    const discountPercent = hasDiscount
        ? Math.round(((price - discountedPrice) / price) * 100)
        : 0;

    return (
        <Link href={`/product/${id}`} className="block">
            <div className="card group">
                {/* Image */}
                <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden">
                    {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-bold">
                            {discountPercent}% OFF
                        </div>
                    )}

                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-saffron/20 to-turmeric/20 flex items-center justify-center">
                            <span className="text-4xl">🍪</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div>
                    {/* Veg/Non-veg Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className={isVegetarian ? 'badge-veg' : 'badge-nonveg'}>
                            <span className={`w-2 h-2 rounded-full ${isVegetarian ? 'bg-green-500' : 'bg-red-500'}`} />
                            {isVegetarian ? 'Veg' : 'Non-Veg'}
                        </span>
                        <span className="text-xs text-gray-500">{category}</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-brown mb-1 group-hover:text-terracotta transition-colors line-clamp-2">
                        {name}
                    </h3>

                    {/* Homemaker */}
                    <p className="text-sm text-gray-500 mb-2">by {homemakerName}</p>

                    {/* Price & Rating */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-terracotta">
                                ₹{discountedPrice || price}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">₹{price}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <StarIcon />
                            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
