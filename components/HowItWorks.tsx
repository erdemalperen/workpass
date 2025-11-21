"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  MapPin,
  QrCode,
  Repeat,
  LucideIcon
} from "lucide-react";
import Link from "next/link";

const iconMap: { [key: string]: LucideIcon } = {
  ShoppingBag,
  MapPin,
  QrCode,
  Repeat
};

interface HowItWorksDetail {
  id: string;
  detail_text: string;
}

interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  step_number: number;
  details: HowItWorksDetail[];
}

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: s } = await supabase.from('content_how_it_works_steps').select('*').order('step_number');
      const { data: d } = await supabase.from('content_how_it_works_details').select('*').order('display_order');

      if (s && d) {
        const combined = s.map((step: any) => ({
          ...step,
          details: d.filter((detail: any) => detail.step_id === step.id)
        }));
        setSteps(combined);
      }
    };
    fetchData();
  }, []);

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true);

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Initialize intersection observer after component is mounted
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

    const element = document.getElementById("how-section");
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }

    // Auto-rotation for steps on mobile
    let interval: NodeJS.Timeout | undefined;
    if (isSmallScreen && steps.length > 0) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 5000);
    }

    return () => {
      if (element && observerRef.current) {
        observerRef.current.unobserve(element);
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMounted, isSmallScreen, steps.length]);

  // Navigate to previous step
  const prevStep = () => {
    if (steps.length === 0) return;
    setActiveStep((prev) =>
      prev === 0 ? steps.length - 1 : prev - 1
    );
  };

  // Navigate to next step
  const nextStep = () => {
    if (steps.length === 0) return;
    setActiveStep((prev) =>
      (prev + 1) % steps.length
    );
  };

  // Add steps to refs array with proper typing
  const addToRefs = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      stepRefs.current[index] = el;
    }
  };

  // Handle touch events for mobile swipe
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextStep();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      prevStep();
    }
  };

  if (steps.length === 0) return null;

  return (
    <section id="how" className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      {/* Decorative Background - Only rendered client-side */}
      {isMounted && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        </div>
      )}

      {/* Connecting Lines - Only rendered client-side on desktop */}
      {isMounted && !isSmallScreen && (
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M 25% 50% Q 37.5% 25%, 50% 50% Q 62.5% 75%, 75% 50%"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/20"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6" id="how-section">
        <div className="text-center mb-12">
          <div className="inline-block mb-2 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium text-sm">Simple Process</span>
          </div>
          <h2 className={`text-3xl md:text-4xl font-bold transition-all duration-700 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            How Does the Shopping & Food Pass Work?
          </h2>
          <p className={`mt-4 text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-100 transform
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Get exclusive discounts at 40+ handpicked locations across Istanbul with just one pass
          </p>
        </div>

        {/* Mobile Carousel View */}
        {isSmallScreen && (
          <div className="relative pb-12">
            <div
              className="overflow-hidden touch-pan-y"
              ref={carouselRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeStep * 100}%)` }}
              >
                {steps.map((step, index) => {
                  const Icon = iconMap[step.icon_name] || ShoppingBag;
                  return (
                    <div key={step.id} className="w-full flex-shrink-0 px-4">
                      <Card className="relative h-full overflow-hidden border-0 shadow-lg">
                        {/* Card Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color_gradient}`} />
                        <div className="absolute inset-0 bg-card/80 backdrop-blur-[2px]" />

                        <CardContent className="relative pt-6 text-center px-6 py-8">
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow" />
                            <div className="relative mb-4 mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full" />
                              <Icon className="h-10 w-10 text-primary" />
                              <span className="absolute -right-2 -top-2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                          <p className="text-muted-foreground mb-4">{step.description}</p>

                          {step.details && (
                            <ul className="text-sm text-left space-y-2">
                              {step.details.map((detail, i) => (
                                <li key={detail.id} className="flex items-start">
                                  <span className="mr-2 text-primary mt-1">•</span>
                                  <span>{detail.detail_text}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevStep}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Carousel Indicators */}
              <div className="flex justify-center space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeStep === index ? 'bg-primary w-8' : 'bg-primary/30 w-2'
                      }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Next step"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Desktop View */}
        {!isSmallScreen && (
          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon_name] || ShoppingBag;
              return (
                <div
                  key={step.id}
                  ref={(el) => addToRefs(el, index)}
                  className={`transition-all duration-700 transform
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <Card className="relative h-full overflow-hidden border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    {/* Card Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color_gradient}`} />
                    <div className="absolute inset-0 bg-card/80 backdrop-blur-[2px]" />

                    <CardContent className="relative pt-6 px-6 py-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow" />
                        <div className="relative mb-4 mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center group">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full transform group-hover:scale-110 transition-transform duration-300" />
                          <Icon className="h-8 w-8 text-primary transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-2 -top-2 text-4xl font-bold text-primary/10">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-lg mb-3 relative">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                        {step.details && (
                          <ul className="text-xs space-y-1 text-left">
                            {step.details.map((detail, i) => (
                              <li key={detail.id} className="flex items-start">
                                <span className="mr-2 text-primary mt-0.5">•</span>
                                <span>{detail.detail_text}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className={`mt-12 text-center transition-all duration-700 delay-500 transform 
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link href="/how-it-works">
            <button
              className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors duration-300 shadow-lg hover:shadow-primary/20 flex items-center mx-auto group"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Learn More About How It Works
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}