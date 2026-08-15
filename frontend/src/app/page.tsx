'use client';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import LiveEventsTicker from '@/components/LiveEventsTicker';
import MissionEditorial from '@/components/MissionEditorial';
import TrackedCropsGrid from '@/components/TrackedCropsGrid';
import SolutionsSlider from '@/components/SolutionsSlider';
import WhyFoodTrace from '@/components/WhyFoodTrace';
import StakeholderMatrix from '@/components/StakeholderMatrix';
import KnowledgeFAQ from '@/components/KnowledgeFAQ';
import PartnersStrip from '@/components/PartnersStrip';
import SubscribeCTA from '@/components/SubscribeCTA';
import Footer from '@/components/Footer';

export default function Home() {
  useEffect(() => {
    // Intersection Observer for smooth reveal on scroll
    const observerCallback: IntersectionObserverCallback = (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <LiveEventsTicker />
      <MissionEditorial />
      <TrackedCropsGrid />
      <SolutionsSlider />
      <WhyFoodTrace />
      <StakeholderMatrix />
      <KnowledgeFAQ />
      <PartnersStrip />
      <SubscribeCTA />
      <Footer />
    </main>
  );
}
