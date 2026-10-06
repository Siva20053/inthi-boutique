import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        const data = await response.json();

        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Categories fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="min-h-screen bg-white py-10 sm:py-14 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
            Inthi Collection
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wide">
            Categories
          </h1>

          <div className="w-12 h-[2px] bg-black mx-auto mt-4" />

          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 mt-5 leading-6">
            Explore our collections and discover styles
            selected for every occasion.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-64 sm:h-80 bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Categories */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/shop?category=${category.id}`
                  )
                }
                className="group text-left"
              >
                <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-gray-100">
                  <img
                    src={
                      category.image_url ||
                      "https://via.placeholder.com/600x800?text=Inthi"
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                  <div className="absolute bottom-0 left-0 right-0 bg-white/95 px-4 py-4">
                    <h2 className="text-sm sm:text-base font-semibold">
                      {category.name}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      Explore Collection
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-lg font-semibold">
              Categories are being updated
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Please check back soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;