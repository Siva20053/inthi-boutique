import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/bazarSlice";
import { toast } from "react-toastify";
import { BsArrowLeft, BsBagPlus } from "react-icons/bs";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Product not found"
          );
        }

        setProduct(data.product);
      } catch (err) {
        console.error("Product details error:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ================= VARIANTS =================

  const variants = product?.variants || [];

  const sizes = useMemo(() => {
    return [
      ...new Set(
        variants
          .map((variant) => variant.size)
          .filter(Boolean)
      ),
    ];
  }, [variants]);

  const colors = useMemo(() => {
    return [
      ...new Set(
        variants
          .map((variant) => variant.color)
          .filter(Boolean)
      ),
    ];
  }, [variants]);

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!product) return null;

    return variants.find((variant) => {
      const sizeMatches = selectedSize
        ? variant.size === selectedSize
        : true;

      const colorMatches = selectedColor
        ? variant.color === selectedColor
        : true;

      return sizeMatches && colorMatches;
    });
  }, [
    product,
    variants,
    selectedSize,
    selectedColor,
  ]);

  // ================= PRICE =================

  const hasSale =
    product?.sale_price !== null &&
    product?.sale_price !== undefined &&
    Number(product.sale_price) < Number(product.price);

  const displayPrice = hasSale
    ? Number(product.sale_price)
    : Number(product?.price || 0);

  // ================= STOCK =================

  const availableStock = selectedVariant
    ? Number(selectedVariant.stock || 0)
    : 0;

  const totalStock = variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const isOutOfStock = totalStock <= 0;

  // ================= IMAGE =================

  const images =
    product?.images?.length > 0
      ? product.images
      : [
          {
            image_url:
              "https://via.placeholder.com/800x1000?text=Inthi",
          },
        ];

  // ================= HANDLERS =================

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    // Reset quantity when variant changes
    setQuantity(1);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);

    // Reset quantity when variant changes
    setQuantity(1);
  };

  const increaseQuantity = () => {
    if (!selectedVariant) {
      toast.error("Please select your size and color");
      return;
    }

    if (quantity < availableStock) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  const handleAddToBag = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (!selectedVariant) {
      toast.error("Selected combination is unavailable");
      return;
    }

    if (availableStock <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    if (quantity > availableStock) {
      toast.error(
        `Only ${availableStock} available`
      );
      return;
    }

    dispatch(
      addToCart({
        _id: product.id,
        id: product.id,
        title: product.name,
        name: product.name,
        image: images[0].image_url,
        price: displayPrice,
        quantity,
        description: product.description,
        category_name: product.category_name,
        fabric: product.fabric,

        // Variant information
        size: selectedSize,
        color: selectedColor,
        variantId: selectedVariant.id,
      })
    );

    toast.success(
      `${product.name} is added to your bag`
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <section className="min-h-screen py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="w-full h-[500px] bg-gray-100 animate-pulse" />

            <div className="space-y-5">
              <div className="h-8 bg-gray-100 animate-pulse w-3/4" />
              <div className="h-6 bg-gray-100 animate-pulse w-1/4" />
              <div className="h-20 bg-gray-100 animate-pulse" />
              <div className="h-12 bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ================= ERROR =================

  if (error || !product) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Product not found
          </h1>

          <p className="text-gray-500 mt-2">
            {error || "This product may no longer be available."}
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-6 border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition"
          >
            Back to Shop
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= BACK ================= */}

        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-8"
        >
          <BsArrowLeft />
          Back to Shop
        </button>

        {/* ================= PRODUCT ================= */}

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">

          {/* ================= IMAGES ================= */}

          <div>
            <div className="relative w-full bg-gray-100 overflow-hidden">
              <img
                src={images[selectedImage]?.image_url}
                alt={product.name}
                className="w-full h-[500px] sm:h-[650px] lg:h-[700px] object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 right-0">
                {isOutOfStock && (
                  <p className="bg-white border border-gray-200 px-5 py-2 text-sm font-semibold">
                    Out of Stock
                  </p>
                )}

                {!isOutOfStock &&
                  product.is_new_arrival && (
                    <p className="bg-black text-white px-6 py-1 font-semibold">
                      New
                    </p>
                  )}

                {!isOutOfStock && hasSale && (
                  <p className="bg-black text-white px-6 py-1 mt-1 font-semibold">
                    Sale
                  </p>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`overflow-hidden border ${
                      selectedImage === index
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= INFORMATION ================= */}

          <div className="lg:py-4">

            {/* Category */}
            {product.category_name && (
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-3">
                {product.category_name}
              </p>
            )}

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mt-5">
              {hasSale && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price}
                </span>
              )}

              <span className="text-xl sm:text-2xl font-semibold">
                ₹{displayPrice}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 border-t pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-3">
                  Description
                </h2>

                <p className="text-sm text-gray-600 leading-7">
                  {product.description}
                </p>
              </div>
            )}

            {/* Fabric */}
            {product.fabric && (
              <div className="mt-5">
                <span className="text-sm font-semibold">
                  Fabric:
                </span>{" "}
                <span className="text-sm text-gray-600">
                  {product.fabric}
                </span>
              </div>
            )}

            {/* ================= SIZE ================= */}

            {sizes.length > 0 && (
              <div className="mt-7">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold">
                    Size
                  </h2>

                  {selectedSize && (
                    <span className="text-xs text-gray-500">
                      Selected: {selectedSize}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const sizeHasStock = variants.some(
                      (variant) =>
                        variant.size === size &&
                        Number(variant.stock || 0) > 0
                    );

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!sizeHasStock}
                        onClick={() =>
                          handleSizeChange(size)
                        }
                        className={`min-w-12 px-4 py-2 border text-sm transition ${
                          selectedSize === size
                            ? "bg-black text-white border-black"
                            : sizeHasStock
                            ? "border-gray-300 hover:border-black"
                            : "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= COLOR ================= */}

            {colors.length > 0 && (
              <div className="mt-7">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold">
                    Color
                  </h2>

                  {selectedColor && (
                    <span className="text-xs text-gray-500">
                      Selected: {selectedColor}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const colorHasStock = variants.some(
                      (variant) =>
                        variant.color === color &&
                        Number(variant.stock || 0) > 0
                    );

                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={!colorHasStock}
                        onClick={() =>
                          handleColorChange(color)
                        }
                        className={`px-4 py-2 border text-sm transition ${
                          selectedColor === color
                            ? "bg-black text-white border-black"
                            : colorHasStock
                            ? "border-gray-300 hover:border-black"
                            : "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ================= STOCK ================= */}

            {!isOutOfStock && (
              <div className="mt-5">
                {!selectedVariant ? (
                  <p className="text-sm text-gray-500">
                    Select your options to check availability.
                  </p>
                ) : availableStock > 0 ? (
                  <p className="text-sm text-green-700">
                    In Stock
                  </p>
                ) : (
                  <p className="text-sm text-red-600">
                    This combination is out of stock.
                  </p>
                )}
              </div>
            )}

            {/* ================= QUANTITY ================= */}

            {!isOutOfStock && selectedVariant && availableStock > 0 && (
              <div className="mt-7">
                <h2 className="text-sm font-semibold mb-3">
                  Quantity
                </h2>

                <div className="flex items-center border border-gray-300 w-fit">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="w-10 h-10 hover:bg-gray-100"
                  >
                    −
                  </button>

                  <span className="w-12 text-center text-sm">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="w-10 h-10 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* ================= ADD TO BAG ================= */}

            <div className="mt-8">
              <button
                type="button"
                onClick={handleAddToBag}
                disabled={isOutOfStock}
                className={`w-full py-4 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-wide transition ${
                  isOutOfStock
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                <BsBagPlus />

                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Bag"}
              </button>
            </div>

            {/* ================= STORE NOTE ================= */}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500 leading-6">
                Availability may vary by size and color.
                For assistance with your order, contact
                Inthi through WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;