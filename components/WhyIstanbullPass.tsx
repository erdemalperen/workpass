"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BadgePercent,
  Utensils,
  CreditCard,
  HeartHandshake,
  Map,
  ShoppingBag,
  CheckCircle2,
  ExternalLink,
  Globe,
  Coffee,
  Store,
  Wallet,
  LucideIcon
} from "lucide-react";

const iconMap: { [key: string]: LucideIcon } = {
  BadgePercent,
  Utensils,
  CreditCard,
  HeartHandshake,
  Map,
  ShoppingBag,
  Store,
  Wallet,
  Globe,
  Coffee
};

interface BenefitProps {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  color_gradient: string;
}

interface Feature {
  id: string;
  feature_text: string;
}

export default function WhyIstanbulPass() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [benefits, setBenefits] = useState<BenefitProps[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: f } = await supabase.from('content_why_choose_us_features').select('*').order('display_order');
      const { data: b } = await supabase.from('content_why_choose_us_benefits').select('*').order('display_order');

      if (f) setFeatures(f);
      if (b) setBenefits(b);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current && observerRef.current) {
      observerRef.current.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current && observerRef.current) {
        observerRef.current.unobserve(sectionRef.current);
      }
    };
  }, [isMounted]);

  if (features.length === 0 && benefits.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="py-20 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Hero section with text and image */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 items-center">
          {/* Left side - Text content */}
          <div className={`transition-all duration-700 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
              <span className="text-primary font-medium text-sm">Why Choose Us?</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Shopping & Food Pass?
            </h2>

            <p className="text-xl font-semibold text-primary mb-8">
              We guarantee you&apos;ll save on your Istanbul adventure!
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={feature.id} className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mr-3 mt-0.5" />
                  <p className="text-base">{feature.feature_text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Image */}
          <div className={`rounded-xl overflow-hidden shadow-lg transition-all duration-700 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: "200ms" }}
          >
            <img
              src="https://picsum.photos/seed/istanbul/800/600"
              alt="Istanbul Pass"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Benefits cards in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon_name] || Store;
            return (
              <div
                key={benefit.id}
                className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform 
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} hover:scale-[1.02]`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`p-4 bg-card h-full border border-border/50 relative group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color_gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">
                      <div className={`p-3 bg-primary/10 rounded-lg text-primary`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}