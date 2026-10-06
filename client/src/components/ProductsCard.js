import React from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/bazarSlice";
import { toast } from "react-toastify";

const ProductsCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productId = product.id;

  // Product image
  const image =
    product.images?.length > 0
      ? product.images[0].image_url
      : "https://via.placeholder.com/600x800?text=Inthi";

  // Price
  const displayPrice =
    product.sale_price !== null && product.sale_price !== undefined
      ? product.sale_price
      : product.price;

  const hasSale =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) < Number(product.price);

  // Check stock from variants
  const variants = product.variants || [];

  const totalStock = variants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0
  );

  const isOutOfStock =
    variants.length > 0 ? totalStock <= 0 : false;

  // Product details
  const handleDetails = () => {
    navigate(`/product/${productId}`, {
      state: {
        item: product,
      },
    });
  };

  // Add to cart
  const handleAddToCart = (event) => {
    event.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is currently out of stock");
      return;
    }

    dispatch(
      addToCart({
        _id: product.id,
        id: product.id,
        title: product.name,
        name: product.name,
        image,
        price: Number(displayPrice),
        quantity: 1,
        description: product.description,
        category_name: product.category_name,
        fabric: product.fabric,
        variants: product.variants || [],
      })
    );

    toast.success(`${product.name} is added to your bag`);
  };

  return (
    <div className="w-full relative group">
      {/* ================= PRODUCT IMAGE ================= */}
      <div
        onClick={handleDetails}
        className="w-full h-52 sm:h-72 lg:h-96 cursor-pointer overflow-hidden bg-gray-100"
      >
        <img
          className={`w-full h-full object-cover duration-500 ${
            isOutOfStock
              ? "opacity-70"
              : "group-hover:scale-110"
          }`}
          src={image}
          alt={product.name || "Inthi product"}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 px-5 py-2 text-sm font-semibold tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ================= PRODUCT INFORMATION ================= */}
      <div className="w-full border-[1px] px-2 py-4">
        <div className="flex justify-between items-center gap-2">
          {/* Product Name */}
          <div className="min-w-0">
            <h2 className="font-titleFont text-sm sm:text-base font-bold">
              {product.name?.substring(0, 20)}
              {product.name?.length > 20 ? "..." : ""}
            </h2>
          </div>

          {/* Price / Add to Bag */}
          <div className="text-xs sm:text-sm relative w-24 sm:w-28 flex justify-end overflow-hidden flex-shrink-0">
            <div
              className={`flex gap-2 transform ${
                !isOutOfStock
                  ? "sm:group-hover:translate-x-24"
                  : ""
              } transition-transform duration-500`}
            >
              {hasSale && (
                <p className="line-through text-gray-500">
                  ₹{product.price}
                </p>
              )}

              <p className="font-semibold">
                ₹{displayPrice}
              </p>
            </div>

            {/* Desktop Add to Bag */}
            {!isOutOfStock && (
              <p
                onClick={handleAddToCart}
                className="hidden sm:flex absolute z-20 w-[100px] text-gray-500 hover:text-gray-900 items-center gap-1 top-0 transform -translate-x-32 group-hover:translate-x-0 transition-transform cursor-pointer duration-500"
              >
                add to bag
                <span>
                  <BsArrowRight />
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Mobile Add to Bag */}
        {!isOutOfStock ? (
          <button
            type="button"
            onClick={handleAddToCart}
            className="sm:hidden mt-3 w-full border border-gray-300 py-2 text-sm hover:bg-gray-100 transition"
          >
            Add to bag
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="sm:hidden mt-3 w-full border border-gray-200 py-2 text-sm text-gray-400 cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}

        {/* Category */}
        {product.category_name && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {product.category_name}
            </p>
          </div>
        )}
      </div>

      {/* ================= BADGES ================= */}
      <div className="absolute top-4 right-0">
        {/* Out of Stock */}
        {isOutOfStock && (
          <p className="bg-white text-black border border-gray-200 font-semibold font-titleFont px-4 py-1">
            Out of Stock
          </p>
        )}

        {/* New Arrival */}
        {!isOutOfStock && product.is_new_arrival && (
          <p className="bg-black text-white font-semibold font-titleFont px-6 py-1">
            New
          </p>
        )}

        {/* Sale */}
        {!isOutOfStock && hasSale && (
          <p className="bg-black text-white font-semibold font-titleFont px-6 py-1 mt-1">
            Sale
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductsCard;