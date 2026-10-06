import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch categories"
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        console.error("Categories fetch error:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 animate-pulse mx-auto mb-8" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-[4/5] bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
            Explore
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wide text-gray-900">
            Shop by Category
          </h2>
        </div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="group relative overflow-hidden bg-gray-100 aspect-[4/5]"
            >
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    No Image
                  </span>
                </div>
              )}

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition duration-500" />

              {/* CATEGORY NAME */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <div className="bg-white/95 px-3 py-3 text-center">
                  <h3 className="text-sm sm:text-base font-medium tracking-wide text-gray-900">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* VIEW ALL */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Link
            to="/categories"
            className="border border-black px-7 py-3 text-sm tracking-wide hover:bg-black hover:text-white transition duration-300"
          >
            View All Categories
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;