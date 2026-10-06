import React from "react";
import ProductsCard from "./ProductsCard";

const Products = ({ products = [] }) => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center gap-3 mb-8 sm:mb-10">

          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Inthi Collection
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wide text-gray-900">
            Our Collection
          </h2>

          <span className="w-12 h-[2px] bg-black" />

          <p className="max-w-[650px] px-4 text-sm sm:text-base text-gray-600 leading-6">
            Explore our latest collection of thoughtfully curated
            styles, selected with care for every occasion.
          </p>

        </div>

        {/* PRODUCTS */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((item) => (
              <ProductsCard
                key={item.id}
                product={item}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-gray-500 text-sm">
              Our collection is being updated. Please check back soon.
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default Products;