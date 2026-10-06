import React, { useEffect, useState } from "react";
import { HiArrowRight, HiArrowLeft } from "react-icons/hi";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${API_URL}/banners`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch banners");
      }

      setBanners(data.banners || []);
    } catch (error) {
      console.error("Banner fetch error:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Automatically move to the next banner
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === banners.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === banners.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="w-full h-[280px] sm:h-[420px] lg:h-[650px] bg-gray-100 animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="h-[280px] sm:h-[420px] lg:h-[650px] w-full relative">
        
        {/* Slides */}
        <div
          className="h-full flex transition-transform duration-1000 ease-in-out"
          style={{
          width: `${banners.length * 100}%`,
          transform: `translateX(-${
          currentSlide * (100 / banners.length)
          }%)`,
          }}
        >
        
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="h-full flex-none relative"
              style={{
                width: `${100 / banners.length}%`,
              }}
            >
              <img
                src={banner.image_url}
                alt={banner.heading || "Inthi Banner"}
                className="w-full h-full object-cover"
              />

              {/* Optional banner text */}
              {(banner.heading ||
                banner.subheading ||
                banner.button_text) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16">
                    <div className="max-w-lg text-white">
                      
                      {banner.heading && (
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-semibold mb-3">
                          {banner.heading}
                        </h2>
                      )}

                      {banner.subheading && (
                        <p className="text-base sm:text-lg lg:text-xl mb-6">
                          {banner.subheading}
                        </p>
                      )}

                      {banner.button_text && banner.button_link && (
                        <a
                          href={banner.button_link}
                          className="inline-block bg-white text-black px-6 py-3 hover:bg-gray-100 transition"
                        >
                          {banner.button_text}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {banners.length > 1 && (
          <div className="absolute w-fit left-0 right-0 mx-auto flex gap-3 sm:gap-8 bottom-6 sm:bottom-10 lg:bottom-16">
            <button
              onClick={prevSlide}
              className="w-11 h-10 sm:w-14 sm:h-12 border border-gray-700 bg-white/80 flex items-center justify-center hover:cursor-pointer hover:bg-gray-700 hover:text-white active:bg-gray-900 duration-300"
              aria-label="Previous banner"
            >
              <HiArrowLeft />
            </button>

            <button
              onClick={nextSlide}
              className="w-11 h-10 sm:w-14 sm:h-12 border border-gray-700 bg-white/80 flex items-center justify-center hover:cursor-pointer hover:bg-gray-700 hover:text-white active:bg-gray-900 duration-300"
              aria-label="Next banner"
            >
              <HiArrowRight />
            </button>
          </div>
        )}

        {/* Slide indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-white"
                    : "w-2 bg-white/60"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;