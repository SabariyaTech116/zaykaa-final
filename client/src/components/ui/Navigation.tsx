'use client';

import Link from 'next/link';
import { useState } from 'react';

// Icons
const HomeIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CartIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const OrdersIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface HeaderProps {
    location?: string;
    cartCount?: number;
}

export function Header({ location = 'Select Location', cartCount = 0 }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-soft">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Top Row - Location & Cart */}
                <div className="flex items-center justify-between mb-3">
                    {/* Location */}
                    <button className="flex items-center gap-2 text-left">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white">
                            <LocationIcon />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Deliver to</p>
                            <p className="font-semibold text-brown flex items-center gap-1">
                                {location}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </p>
                        </div>
                    </button>

                    {/* Logo & Cart */}
                    <div className="flex items-center gap-6">
                        <Link href="/">
                            <h1 className="font-display text-2xl font-bold text-gradient">Zaykaa</h1>
                        </Link>

                        <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
                            <Link href="/" className="hover:text-terracotta">Home</Link>
                            <Link href="/explore" className="hover:text-terracotta">Explore</Link>
                            <Link href="/become-chef" className="hover:text-terracotta">Become a Chef</Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <CartIcon />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/login" className="px-4 py-2 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-brown transition-colors shadow-sm">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for Murukku, Ladoo, Pickle..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-terracotta/20 transition-all outline-none"
                    />
                    <SearchIcon />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                </div>
            </div>
        </header>
    );
}

export function BottomNav() {
    const [active, setActive] = useState('home');

    const navItems = [
        { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
        { id: 'explore', label: 'Explore', icon: SearchIcon, href: '/explore' },
        { id: 'orders', label: 'Orders', icon: OrdersIcon, href: '/orders' },
        { id: 'profile', label: 'Profile', icon: UserIcon, href: '/profile' },
    ];

    return (
        <nav className="bottom-nav md:hidden">
            {navItems.map((item) => (
                <Link
                    key={item.id}
                    href={item.href}
                    className={`bottom-nav-item ${active === item.id ? 'active' : ''}`}
                    onClick={() => setActive(item.id)}
                >
                    <item.icon />
                    <span className="text-xs">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
