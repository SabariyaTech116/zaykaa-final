'use client';

import { Header, BottomNav } from '@/components/ui/Navigation';
import { HeroSection, Collections, WelcomeSampler, TrustBadges } from '@/components/home/Sections';
import { HomemakerCard } from '@/components/home/Cards';

import { useFeaturedProducts, useFeaturedHomemakers } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

export default function HomePage() {
  const { data: featuredHomemakers, loading: homemakersLoading } = useFeaturedHomemakers();
  const { data: featuredProducts, loading: productsLoading } = useFeaturedProducts();
  const { showToast } = useToast();

  const homemakers = Array.isArray(featuredHomemakers) ? featuredHomemakers : [];

  // In production, this would come from auth context
  const isNewUser = true;

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-0">
      {/* Header */}
      <Header location="Hyderabad" cartCount={2} />

      {/* Hero Section */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Welcome Sampler (for new users) */}
      <WelcomeSampler isNewUser={isNewUser} />

      {/* Collections */}
      <Collections />

      {/* Homemaker Feed */}
      <section className="py-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-semibold text-brown">
            Top Home Chefs Near You
          </h2>
          <a href="/explore" className="text-terracotta font-medium text-sm hover:underline">
            View All →
          </a>
        </div>

        {/* Dietary Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {['All', 'Pure Veg 🌱', 'Sweets', 'Savory', 'Pickles', 'Healthy'].map((filter, index) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${index === 0
                ? 'bg-terracotta text-white shadow-warm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-terracotta'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Homemaker Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homemakersLoading ? (
            // Skeleton Loader
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm h-80 animate-pulse">
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 w-3/4 rounded mb-2" />
                <div className="h-4 bg-gray-200 w-1/2 rounded" />
              </div>
            ))
          ) : homemakers.length > 0 ? (
            // @ts-ignore - Assuming Homemaker type match for now
            homemakers.map((homemaker) => (
              <HomemakerCard key={homemaker.id} {...homemaker} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No homemakers found in your area yet.
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 bg-white">
        <h2 className="font-display text-3xl font-semibold text-brown text-center mb-8">
          How Zaykaa Works
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-terracotta to-saffron flex items-center justify-center text-white text-2xl">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">Browse & Order</h3>
            <p className="text-gray-600">
              Explore authentic dishes from verified home chefs. Add to cart and choose your delivery slot.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-saffron to-turmeric flex items-center justify-center text-white text-2xl">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">Freshly Prepared</h3>
            <p className="text-gray-600">
              Your order is prepared fresh by the homemaker the next day, just for you.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sage to-green-500 flex items-center justify-center text-white text-2xl">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Delivered Fresh</h3>
            <p className="text-gray-600">
              Get your food delivered in eco-friendly packaging at your chosen slot.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-semibold text-brown mb-4">
            Are You a Home Chef?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Turn your passion into income. Join 500+ homemakers earning ₹15,000+/month on Zaykaa.
          </p>
          <a href="/become-chef" className="btn-primary inline-block">
            Start Your Kitchen Today 👩‍🍳
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display text-2xl font-bold mb-4 text-gradient">Zaykaa</h3>
              <p className="text-gray-300 text-sm">
                Roots of Taste, Routes to Health
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/explore" className="hover:text-white">Browse Food</a></li>
                <li><a href="/become-chef" className="hover:text-white">Become a Chef</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/faq" className="hover:text-white">FAQs</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/refund" className="hover:text-white">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-sm text-gray-400">
            © 2026 Zaykaa. All rights reserved. Made with ❤️ in India
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
