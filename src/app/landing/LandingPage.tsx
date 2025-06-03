'use client';

import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ForTutorsSection from './components/ForTutorsSection';
import ForLearnersSection from './components/ForLearnersSection';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('learners');

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <FeaturesSection />
      <ForTutorsSection />
      <ForLearnersSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
