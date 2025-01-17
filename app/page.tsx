'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Features } from '@/components/Features';
import { UseCases } from '@/components/UseCases';
import { ProductHuntBadges } from '@/components/ProductHuntBadges';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { Pricing } from '@/components/Pricing';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const searchParams = useSearchParams();
  const section = searchParams.get('section');

  useEffect(() => {
    if (section === 'pricing') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [section]);

  return (
    <div className="min-h-screen relative flex flex-col" role="region" aria-label="Home page content">
      {/* Simplified Gradient Background */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[#0A0A0A]" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-[#0A0A0A] to-[#0A0A0A]" />
      </div>

      {/* Content Container */}
      <div ref={scrollRef} className="relative z-10 flex-grow">
        <Navbar />

        <main className="pt-24" role="main" aria-label="Main content">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-4 md:py-10"> {/* Changed from md:py-24 to md:py-16 */}
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Transform Your Images
                <br/>
                <span className="text-purple-400 md:mt-2 block">Like Never Before</span>
              </h1>
              <p className="text-md md:text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              The all-in-one tool to clone images, place logos, text, shapes, or other images behind your photo, remove backgrounds, and change backgrounds.
              </p>
              <Link 
                href="/custom-editor"
                onClick={() => setIsLoading(true)}
                className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xl font-semibold transition-all"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Loading...
                  </>
                ) : (
                  "Start Creating"
                )}
              </Link>
            </div>
          </section>
          {/* Feature Showcase */}
          <FeatureShowcase />
          {/* Features, Use Cases, and Product Hunt Badges */}
          <Features />
          <UseCases />
          <section id="pricing">
            <Pricing />
          </section>
          <ProductHuntBadges />
          <Footer />
        </main>
      </div>
    </div>
  );
}