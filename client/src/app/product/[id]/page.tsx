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

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg className={`w-6 h-6 ${filled ? 'text-red-500 fill-current' : 'text-gray-400'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const ShareIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);

// Mock product data
const mockProduct = {
    id: 'prod001',
    name: 'Bellam Gavvalu',
    description: 'Traditional Andhra sweet made with jaggery and rice flour. These shell-shaped delicacies are deep-fried to perfection and coated with aromatic cardamom-infused jaggery syrup. A festive favorite that brings back memories of Nani\'s kitchen.',
    story: 'This recipe has been passed down through 4 generations in our family. My grandmother used to make these for every Sankranti, and now I\'m proud to share this tradition with you.',
    price: 250,
    discountedPrice: 199,
    unit: '250g pack',
    category: 'Sweets',
    region: 'Andhra Pradesh',
    dietary: {
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
    },
    ingredients: [
        { name: 'Rice Flour', isAllergen: false },
        { name: 'Jaggery (Bellam)', isAllergen: false },
        { name: 'Ghee', isAllergen: true },
        { name: 'Cardamom', isAllergen: false },
        { name: 'Sesame Seeds', isAllergen: true },
    ],
    shelfLife: { days: 15, instructions: 'Store in airtight container at room temperature' },
    images: [],
    rating: { average: 4.8, count: 156 },
    homemaker: {
        id: 'chef01',
        kitchenName: "Sarala's Kitchen",
        rating: 4.8,
        famousFor: 'Andhra Sweets',
        city: 'Hyderabad',
    },
    reviews: [
        { id: '1', user: 'Priya M.', rating: 5, comment: 'Tastes exactly like my grandmother used to make! Authentic and delicious.', date: '2 days ago' },
        { id: '2', user: 'Rahul K.', rating: 5, comment: 'Perfect for Sankranti. Ordered 5 packs for family.', date: '1 week ago' },
        { id: '3', user: 'Anjali S.', rating: 4, comment: 'Great taste, but wish the packaging was better.', date: '2 weeks ago' },
    ],
};

export default function ProductDetailPage() {
    const [quantity, setQuantity] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState<'MORNING' | 'EVENING'>('MORNING');
    const [isFavorite, setIsFavorite] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const product = mockProduct;
    const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    const effectivePrice = product.discountedPrice || product.price;
    const totalPrice = effectivePrice * quantity;

    const handleAddToCart = () => {
        // TODO: Implement cart context
        alert(`Added ${quantity} x ${product.name} to cart for ${selectedSlot} slot!`);
    };

    return (
        <div className="min-h-screen bg-cream pb-32">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <BackIcon />
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <HeartIcon filled={isFavorite} />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <ShareIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* Product Image */}
            <div className="relative h-72 bg-gradient-to-br from-saffron/20 to-turmeric/20">
                {hasDiscount && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-bold">
                        {discountPercent}% OFF
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl">🍪</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="px-4 -mt-6 relative z-10">
                <div className="bg-white rounded-t-3xl shadow-soft p-6">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="badge-veg">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Pure Veg
                        </span>
                        {product.dietary.isGlutenFree && (
                            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                Gluten Free
                            </span>
                        )}
                        <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                            {product.region}
                        </span>
                    </div>

                    {/* Title & Rating */}
                    <h1 className="font-display text-2xl font-bold text-brown mb-2">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1">
                            <StarIcon />
                            <span className="font-semibold">{product.rating.average}</span>
                            <span className="text-gray-500">({product.rating.count} reviews)</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{product.unit}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl font-bold text-terracotta">₹{effectivePrice}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm font-medium">
                                    Save ₹{product.price - product.discountedPrice}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Homemaker Card */}
                    <Link href={`/chef/${product.homemaker.id}`} className="block mb-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-cream hover:bg-orange-50 transition-colors">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white text-2xl">
                                👩‍🍳
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-brown">{product.homemaker.kitchenName}</p>
                                <p className="text-sm text-gray-500">{product.homemaker.famousFor} • {product.homemaker.city}</p>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white">
                                <StarIcon />
                                <span className="font-semibold text-sm">{product.homemaker.rating}</span>
                            </div>
                        </div>
                    </Link>

                    {/* Description */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg text-brown mb-2">About this item</h2>
                        <p className={`text-gray-600 ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                            {product.description}
                        </p>
                        <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-terracotta font-medium text-sm mt-1"
                        >
                            {showFullDescription ? 'Show less' : 'Read more'}
                        </button>
                    </div>

                    {/* Story */}
                    {product.story && (
                        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100">
                            <p className="text-sm font-medium text-terracotta mb-1">Chef&apos;s Story ✨</p>
                            <p className="text-gray-700 text-sm italic">&quot;{product.story}&quot;</p>
                        </div>
                    )}

                    {/* Ingredients */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg text-brown mb-3">Ingredients</h2>
                        <div className="flex flex-wrap gap-2">
                            {product.ingredients.map((ing, idx) => (
                                <span
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-full text-sm ${ing.isAllergen
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {ing.name} {ing.isAllergen && '⚠️'}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">⚠️ = May contain allergens</p>
                    </div>

                    {/* Shelf Life */}
                    <div className="mb-6 p-4 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📦</span>
                            <div>
                                <p className="font-medium text-brown">Shelf Life: {product.shelfLife.days} days</p>
                                <p className="text-sm text-gray-500">{product.shelfLife.instructions}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Slot Selection */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg text-brown mb-3">Choose Delivery Slot</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedSlot('MORNING')}
                                className={`slot-card ${selectedSlot === 'MORNING' ? 'active' : ''}`}
                            >
                                <p className="text-2xl mb-1">🌅</p>
                                <p className="font-semibold">Morning</p>
                                <p className="text-sm text-gray-500">6 AM - 8 AM</p>
                                <p className="text-xs text-terracotta mt-1">Tomorrow</p>
                            </button>
                            <button
                                onClick={() => setSelectedSlot('EVENING')}
                                className={`slot-card ${selectedSlot === 'EVENING' ? 'active' : ''}`}
                            >
                                <p className="text-2xl mb-1">🌆</p>
                                <p className="font-semibold">Evening</p>
                                <p className="text-sm text-gray-500">5 PM - 7 PM</p>
                                <p className="text-xs text-terracotta mt-1">Tomorrow</p>
                            </button>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg text-brown">Reviews</h2>
                            <button className="text-terracotta text-sm font-medium">See all</button>
                        </div>
                        <div className="space-y-4">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="p-4 rounded-xl bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                                {review.user[0]}
                                            </div>
                                            <span className="font-medium text-sm">{review.user}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm">{review.comment}</p>
                                    <p className="text-gray-400 text-xs mt-2">{review.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Bar - Add to Cart */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50">
                <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-3 py-2">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-terracotta"
                        >
                            -
                        </button>
                        <span className="font-semibold w-6 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center font-bold text-terracotta"
                        >
                            +
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                        <span>Add to Cart</span>
                        <span className="font-bold">₹{totalPrice}</span>
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
