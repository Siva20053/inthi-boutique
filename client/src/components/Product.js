import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MdOutlineStar } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/bazarSlice";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const Product = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [baseQty, setBaseQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [storeSettings, setStoreSettings] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // ================= FETCH PRODUCT =================

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_URL}/products/${id}`
        );

        setDetails(response.data.product);
        setSelectedImage(0);
      } catch (error) {
        console.error("Failed to load product:", error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  // ================= FETCH STORE SETTINGS =================

  useEffect(() => {
    const getStoreSettings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/settings`
        );

        setStoreSettings(response.data.settings);
      } catch (error) {
        console.error("Failed to load store settings:", error);
      }
    };

    getStoreSettings();
  }, []);

  const variants = useMemo(() => details?.variants || [], [details?.variants]);

  // ================= VARIANTS =================


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

  // ================= SELECTED VARIANT =================

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    return variants.find((variant) => {
      const sizeMatches =
        !sizes.length || variant.size === selectedSize;

      const colorMatches =
        !colors.length || variant.color === selectedColor;

      return sizeMatches && colorMatches;
    });
  }, [
    variants,
    selectedSize,
    selectedColor,
    sizes.length,
    colors.length,
  ]);

  const variantStock = selectedVariant?.stock ?? 0;

  const isVariantSelected =
    !variants.length ||
    ((!sizes.length || selectedSize) &&
      (!colors.length || selectedColor));

  const isAvailable =
    !variants.length ||
    (isVariantSelected && variantStock > 0);

  // Reset quantity when variant changes
  useEffect(() => {
    setBaseQty(1);
  }, [selectedSize, selectedColor]);

  // ================= IMAGE =================

  const images =
    details?.images?.length > 0
      ? details.images
      : [
          {
            image_url:
              "https://via.placeholder.com/600x800?text=Inthi",
          },
        ];

  const image =
    images[selectedImage]?.image_url ||
    images[0]?.image_url;

  // ================= PRICE =================

  const displayPrice =
    details?.sale_price ?? details?.price;

  const hasSale =
    details?.sale_price !== null &&
    details?.sale_price !== undefined &&
    Number(details.sale_price) < Number(details.price);

  // ================= ADD TO CART =================

  const handleAddToCart = () => {
    if (!details) return;

    if (variants.length && !isVariantSelected) {
      toast.error("Please select your size and color.");
      return;
    }

    if (!isAvailable) {
      toast.error("This variant is currently out of stock.");
      return;
    }

    if (baseQty > variantStock && variants.length) {
      toast.error("Requested quantity is not available.");
      return;
    }

    dispatch(
      addToCart({
        _id: details.id,
        title: details.name,
        image,
        price: displayPrice,
        quantity: baseQty,
        description: details.description,
        size: selectedSize || null,
        color: selectedColor || null,
        variantId: selectedVariant?.id || null,
      })
    );

    toast.success(
      `${details.name} is added to your bag`
    );
  };

  // ================= WHATSAPP =================

  const handleWhatsAppOrder = () => {
    if (!details) return;

    if (variants.length && !isVariantSelected) {
      toast.error("Please select your size and color.");
      return;
    }

    if (!isAvailable) {
      toast.error("This variant is currently out of stock.");
      return;
    }

    if (baseQty > variantStock && variants.length) {
      toast.error("Requested quantity is not available.");
      return;
    }

    if (!storeSettings?.whatsapp) {
      toast.error(
        "WhatsApp ordering is not configured yet."
      );
      return;
    }



    const total =
      Number(displayPrice) * baseQty;

    let message = `Hello ${
      storeSettings.store_name || "Inthi"
    } \n\n`;

    message += `I'd like to order:\n\n`;

    message += `1. ${details.name}\n`;
    message += `   Product ID: ${details.id}\n`;

    if (selectedSize) {
      message += `   Size: ${selectedSize}\n`;
    }

    if (selectedColor) {
      message += `   Color: ${selectedColor}\n`;
    }

    message += `   Quantity: ${baseQty}\n`;
    message += `   Price: ₹${Number(
      displayPrice
    ).toFixed(2)}\n\n`;

    message += `Total: ₹${total.toFixed(2)}\n\n`;


    message += `Please confirm availability.`;

    const phoneNumber =
      storeSettings.whatsapp.replace(/\D/g, "");

    const whatsappUrl =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  // ================= NOT FOUND =================

  if (!details) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold">
          Product not found
        </h2>

        <p className="text-gray-500 mt-2">
          This product may no longer be available.
        </p>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

        {/* ================= IMAGE ================= */}

        <div className="w-full lg:w-1/2">
          {/* MAIN IMAGE */}
          <div className="w-full h-[500px] sm:h-[600px] overflow-hidden bg-gray-100">
            <img
              src={image}
              alt={details.name}
              className="w-full h-full object-cover"
            />
         </div>

          {/* IMAGE THUMBNAILS */}
          {images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {images.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={() => setSelectedImage(index)}
                className={`w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 overflow-hidden border-2 ${
                  selectedImage === index
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <img
                src={item.image_url}
                alt={`${details.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

    </div>

        {/* ================= DETAILS ================= */}

        <div className="w-full lg:w-1/2 flex flex-col">

          <p className="text-sm text-gray-500 uppercase tracking-wide">
            {details.category_name}
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-titleFont font-semibold mt-2">
            {details.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <MdOutlineStar
                key={star}
                className="text-yellow-500"
              />
            ))}

            <span className="text-sm text-gray-500 ml-2">
              No reviews yet
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-5">
            {hasSale && (
              <span className="line-through text-gray-400 text-lg">
                ₹{details.price}
              </span>
            )}

            <span className="text-2xl font-semibold">
              ₹{displayPrice}
            </span>

            {hasSale && (
              <span className="bg-black text-white text-xs px-3 py-1">
                SALE
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-7 mt-6">
            {details.description}
          </p>

          {/* Fabric */}
          {details.fabric && (
            <p className="mt-4 text-sm">
              <span className="font-semibold">
                Fabric:
              </span>{" "}
              {details.fabric}
            </p>
          )}

          {/* ================= COLORS ================= */}

          {colors.length > 0 && (
            <div className="mt-7">
              <h3 className="font-semibold mb-3">
                Color
              </h3>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const colorVariants =
                    variants.filter(
                      (variant) =>
                        variant.color === color
                    );

                  const colorAvailable =
                    colorVariants.some(
                      (variant) =>
                        variant.stock > 0
                    );

                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={!colorAvailable}
                      onClick={() =>
                        setSelectedColor(color)
                      }
                      className={`px-5 py-2 border text-sm ${
                        selectedColor === color
                          ? "border-black bg-black text-white"
                          : "border-gray-300"
                      } ${
                        !colorAvailable
                          ? "opacity-40 cursor-not-allowed line-through"
                          : "hover:border-black"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SIZES ================= */}

          {sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">
                Size
              </h3>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const sizeAvailable =
                    variants.some((variant) => {
                      const colorMatches =
                        !selectedColor ||
                        variant.color === selectedColor;

                      return (
                        variant.size === size &&
                        colorMatches &&
                        variant.stock > 0
                      );
                    });

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!sizeAvailable}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`w-12 h-10 border text-sm ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300"
                      } ${
                        !sizeAvailable
                          ? "opacity-40 cursor-not-allowed line-through"
                          : "hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= STOCK ================= */}

          <div className="mt-6">
            {variants.length === 0 ? (
              <p className="text-green-600 font-medium">
                In Stock
              </p>
            ) : !isVariantSelected ? (
              <p className="text-gray-500">
                Select your size and color
              </p>
            ) : variantStock > 0 ? (
              <p className="text-green-600 font-medium">
                In Stock
              </p>
            ) : (
              <p className="text-red-500 font-medium">
                Out of Stock
              </p>
            )}
          </div>

          {/* ================= QUANTITY ================= */}

          <div className="flex items-center gap-4 mt-6">
            <span className="font-semibold">
              Quantity
            </span>

            <div className="flex items-center border border-gray-300">
              <button
                type="button"
                disabled={baseQty <= 1}
                onClick={() =>
                  setBaseQty((qty) =>
                    Math.max(1, qty - 1)
                  )
                }
                className="w-10 h-10 hover:bg-gray-100 disabled:opacity-40"
              >
                -
              </button>

              <span className="w-10 text-center">
                {baseQty}
              </span>

              <button
                type="button"
                disabled={
                  variants.length > 0 &&
                  (!isVariantSelected ||
                    baseQty >= variantStock)
                }
                onClick={() =>
                  setBaseQty((qty) =>
                    variants.length
                      ? Math.min(
                          qty + 1,
                          variantStock
                        )
                      : qty + 1
                  )
                }
                className="w-10 h-10 hover:bg-gray-100 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="flex-1 py-3 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed duration-300"
            >
              ADD TO BAG
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              disabled={!isAvailable}
              className="flex-1 py-3 border border-black hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-400 duration-300 flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="text-xl" />
              ORDER ON WHATSAPP
            </button>

          </div>

          {/* ================= PRODUCT INFO ================= */}

          <div className="border-t mt-8 pt-6 text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-semibold">
                Category:
              </span>{" "}
              {details.category_name}
            </p>

            {details.fabric && (
              <p>
                <span className="font-semibold">
                  Fabric:
                </span>{" "}
                {details.fabric}
              </p>
            )}

            <p>
              <span className="font-semibold">
                Product ID:
              </span>{" "}
              {details.id}
            </p>
          </div>

        </div>
      </div>

      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Product;