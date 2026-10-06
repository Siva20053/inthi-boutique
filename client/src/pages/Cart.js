import React, { useEffect, useState } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import {
  deleteItem,
  increamentQuantity,
  decrementQuantity,
} from "../redux/bazarSlice";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const Cart = () => {
  const dispatch = useDispatch();

  const productData = useSelector((state) => state.bazar.productData);

  const [totalAmt, setTotalAmt] = useState(0);
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    const total = productData.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    setTotalAmt(total);
  }, [productData]);

  // Get store settings from PostgreSQL
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

  const handleIncrease = (item) => {
    /*
      The product page already prevents selecting more than
      available variant stock.

      We will add stronger server-side stock validation later.
    */

    dispatch(increamentQuantity(item));
  };

  const handleDecrease = (item) => {
    dispatch(decrementQuantity(item));
  };

  const handleDelete = (item) => {
    dispatch(deleteItem(item));

    toast.success(`${item.title} removed from your bag`);
  };

  const handleWhatsAppOrder = () => {
    if (!productData.length) {
      toast.error("Your bag is empty.");
      return;
    }

    if (!storeSettings?.whatsapp) {
      toast.error("WhatsApp ordering is not configured yet.");
      return;
    }



    let message = `Hello ${
      storeSettings.store_name || "Inthi"
    } \n\n`;

    message += `I'd like to place an order.\n\n`;

    productData.forEach((item, index) => {
      message += `${index + 1}. ${item.title}\n`;

      if (item.size) {
        message += `   Size: ${item.size}\n`;
      }

      if (item.color) {
        message += `   Color: ${item.color}\n`;
      }

      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${Number(item.price).toFixed(2)}\n`;
      message += `   Item Total: ₹${(
        Number(item.price) * item.quantity
      ).toFixed(2)}\n\n`;
    });

    message += `Total: ₹${totalAmt.toFixed(2)}\n\n`;
    message += `Please confirm availability and the next steps.`;

    const phoneNumber = storeSettings.whatsapp.replace(/\D/g, "");

    const whatsappUrl =
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div>
      {/* Cart Banner */}
      <img
        className="w-full h-60 object-cover"
        src="https://images.pexels.com/photos/1435752/pexels-photo-1435752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Shopping bag"
      />

      {productData.length > 0 ? (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* CART ITEMS */}
            <div className="w-full lg:w-2/3">
              <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-titleFont font-semibold">
                  Your Shopping Bag
                </h1>

                <p className="text-gray-500 mt-2">
                  {productData.length}{" "}
                  {productData.length === 1 ? "item" : "items"}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                {productData.map((item) => (
                  <div
                    key={`${item._id}-${item.variantId || "default"}-${
                      item.size || "no-size"
                    }-${item.color || "no-color"}`}
                    className="border-b pb-6"
                  >
                    <div className="flex gap-4">
                      
                      {/* IMAGE */}
                      <Link
                        to={`/product/${item._id}`}
                        className="w-28 h-36 sm:w-36 sm:h-44 flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* DETAILS */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between gap-4">
                            <div>
                              <h2 className="font-titleFont font-semibold text-base sm:text-lg">
                                {item.title}
                              </h2>

                              {item.size && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Size:{" "}
                                  <span className="font-medium">
                                    {item.size}
                                  </span>
                                </p>
                              )}

                              {item.color && (
                                <p className="text-sm text-gray-600">
                                  Color:{" "}
                                  <span className="font-medium">
                                    {item.color}
                                  </span>
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="text-sm text-gray-500 hover:text-black"
                            >
                              Remove
                            </button>
                          </div>

                          <p className="text-base font-semibold mt-3">
                            ₹{Number(item.price).toFixed(2)}
                          </p>
                        </div>

                        {/* QUANTITY */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-300">
                            <button
                              type="button"
                              onClick={() => handleDecrease(item)}
                              className="w-9 h-9 hover:bg-gray-100"
                            >
                              -
                            </button>

                            <span className="w-10 text-center">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleIncrease(item)}
                              className="w-9 h-9 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>

                          <p className="font-semibold">
                            ₹
                            {(
                              Number(item.price) * item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CONTINUE SHOPPING */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-8 text-gray-500 hover:text-black duration-300"
              >
                <HiOutlineArrowLeft />
                Continue Shopping
              </Link>
            </div>

            {/* SUMMARY */}
            <div className="w-full lg:w-1/3 lg:min-w-80">
              <div className="bg-[#fafafa] p-6">
                <h2 className="text-2xl font-medium border-b border-gray-300 pb-5">
                  Cart Summary
                </h2>

                <div className="flex justify-between mt-6">
                  <span>Subtotal</span>

                  <span className="font-semibold">
                    ₹{totalAmt.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between mt-4 text-gray-500">
                  <span>Shipping</span>
                  <span>To be confirmed</span>
                </div>

                <div className="border-t border-gray-300 mt-6 pt-6 flex justify-between">
                  <span className="font-titleFont font-semibold">
                    Total
                  </span>

                  <span className="text-xl font-bold">
                    ₹{totalAmt.toFixed(2)}
                  </span>
                </div>

                {/* WHATSAPP ORDER */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full mt-6 py-3 bg-black text-white hover:bg-gray-800 duration-300 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp className="text-xl" />
                  ORDER ON WHATSAPP
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  You'll confirm availability and delivery details
                  directly with Inthi on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EMPTY CART */
        <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center gap-4 justify-center text-center">
          <h2 className="text-2xl sm:text-3xl font-titleFont font-semibold">
            Your Shopping Bag is Empty
          </h2>

          <p className="text-gray-500">
            Discover something beautiful from our latest collection.
          </p>

          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-black duration-300 mt-2"
          >
            <HiOutlineArrowLeft />
            Go Shopping
          </Link>
        </div>
      )}

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

export default Cart;