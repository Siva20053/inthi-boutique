import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductsCard from "../components/ProductsCard";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Shop = () => {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [filter, setFilter] = useState(
    searchParams.get("filter") || "all"
  );
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`),
          ]);

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (productsData.success) {
          setProducts(productsData.products || []);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error("Shop data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Keep filters synced with URL
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "all";
    const urlFilter = searchParams.get("filter") || "all";

    setSearch(urlSearch);
    setSelectedCategory(urlCategory);
    setFilter(urlFilter);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const searchText = search.toLowerCase().trim();

      result = result.filter((product) => {
        return (
          String(product.id).includes(searchText) ||
          product.name?.toLowerCase().includes(searchText) ||
          product.category_name
            ?.toLowerCase()
            .includes(searchText) ||
          product.description
            ?.toLowerCase()
           .includes(searchText) ||
          product.fabric
            ?.toLowerCase()
           .includes(searchText)
        );
      });
    }

    // Category
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          String(product.category_id) ===
          String(selectedCategory)
      );
    }

    // New arrivals
    if (filter === "new") {
      result = result.filter(
        (product) => product.is_new_arrival
      );
    }

    // Featured
    if (filter === "featured") {
      result = result.filter(
        (product) => product.is_featured
      );
    }

    // Sorting
    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.sale_price ?? a.price) -
          Number(b.sale_price ?? b.price)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.sale_price ?? b.price) -
          Number(a.sale_price ?? a.price)
      );
    }

    if (sort === "name-az") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    if (sort === "name-za") {
      result.sort((a, b) =>
        (b.name || "").localeCompare(a.name || "")
      );
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    filter,
    sort,
  ]);

  return (
    <section className="min-h-screen bg-white py-10 sm:py-14">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= HEADER ================= */}
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
            Inthi Collection
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-wide">
            Shop
          </h1>

          <div className="w-12 h-[2px] bg-black mx-auto mt-4" />
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="border-y border-gray-200 py-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

            {/* Search */}
            <div className="w-full lg:w-80">
              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search products..."
                className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">

              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="border border-gray-300 px-4 py-2.5 text-sm bg-white outline-none focus:border-black"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Collection */}
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="border border-gray-300 px-4 py-2.5 text-sm bg-white outline-none focus:border-black"
              >
                <option value="all">
                  All Products
                </option>
                <option value="new">
                  New Arrivals
                </option>
                <option value="featured">
                  Featured
                </option>
              </select>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className="border border-gray-300 px-4 py-2.5 text-sm bg-white outline-none focus:border-black"
              >
                <option value="default">
                  Sort By
                </option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
                <option value="name-az">
                  Name: A to Z
                </option>
                <option value="name-za">
                  Name: Z to A
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= RESULT COUNT ================= */}
        {!loading && (
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-gray-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>
          </div>
        )}

        {/* ================= PRODUCTS ================= */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="w-full h-52 sm:h-72 lg:h-96 bg-gray-100 animate-pulse" />

                <div className="border px-3 py-4">
                  <div className="h-4 bg-gray-100 animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 animate-pulse w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductsCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-lg font-semibold mb-2">
              No products found
            </h2>

            <p className="text-sm text-gray-500">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setFilter("all");
                setSort("default");
              }}
              className="mt-5 border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;