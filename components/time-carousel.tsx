"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface TimeSlide {
  time: string;
  title: string;
  image: string;
}

const timeSlides: TimeSlide[] = [
  {
    time: "8:00 AM",
    title: "Morning Prayer",
    image: "/time-18.jpg",
  },
  {
    time: "8:00 AM",
    title: "Morning Prayer",
    image: "/time-16.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-14.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-kofiNo7.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-30.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-25.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-31.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-29.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-26.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-27.jpg",
  },
  {
    time: "10:30 AM",
    title: "Sunday Service",
    image: "/time-28.jpg",
  },
  {
    time: "6:00 PM",
    title: "Bible Study",
    image: "/time-13.jpg",
  },
  {
    time: "5:30 PM",
    title: "Prayer Meeting",
    image: "/time-32.jpg",
  },
  {
    time: "7:00 PM",
    title: "Youth Service",
    image: "/time-17.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-11.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-20.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-25.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-21.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-22.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-23.jpg",
  },
  {
    time: "9:00 AM",
    title: "Midweek Service",
    image: "/time-12.jpg",
  },
];

export function TimeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % timeSlides.length);

        // Reset transition state after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
    }, 4000); // Slightly longer interval for smoother experience

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[400px] overflow-hidden">
      <div className="flex h-full">
        {timeSlides.map((time, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index ===
                  (currentSlide - 1 + timeSlides.length) % timeSlides.length
                ? "opacity-0 translate-x-full"
                : index === (currentSlide + 1) % timeSlides.length
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            <div className="relative h-full">
              <img
                src={time.image}
                alt={time.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {timeSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary scale-125"
                : "bg-white/50 hover:bg-white"
            }`}
            onClick={() => {
              if (!isTransitioning) {
                setCurrentSlide(index);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
