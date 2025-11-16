"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface MissionSlide {
  title: string;
  description: string;
  image: string;
}

const missionSlides: MissionSlide[] = [
  {
    title: "Our Vision",
    description: "Raising Able Ministers of Grace Worldwide",
    image: "/vision1.jpg", // Can be replaced with Pinterest URL
  },
  {
    title: "Demonstrating Power",
    description: "Demonstrating Power of God's Word in Our Generation",
    image: "/power.jpg", // Can be replaced with Pinterest URL
  },
  {
    title: "The Super-Life",
    description:
      "Bringing the Body of Christ to Consciousness of The Supernatural",
    image: "/superlife.jpg", // Can be replaced with Pinterest URL
  },
  {
    title: "Prayer",
    description: "Raising a People of Prayer",
    image: "/prayer.jpg", // Can be replaced with Pinterest URL
  },
];

export function MissionCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % missionSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden">
      {missionSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative h-full">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4 space-y-4">
                <Badge className="bg-primary text-primary-foreground text-lg px-6 py-2">
                  {slide.title}
                </Badge>
                <h2 className="text-4xl md:text-6xl font-bold text-balance">
                  {slide.description}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {missionSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
