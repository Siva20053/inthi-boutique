import React, { useEffect, useState } from "react";
import {
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineClock,
} from "react-icons/hi";
import { Link } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`);
      const data = await response.json();

      if (response.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Footer settings error:", error);
    }
  };

  const storeName = settings?.store_name || "Inthi";
  const instagramUrl = (() => {
    const value = settings?.instagram?.trim();

    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith("@")) {
      return `https://www.instagram.com/${value.substring(1)}`;
    }

    if (/^(www\.)?instagram\.com/i.test(value)) {
      return `https://${value}`;
    }

    return `https://www.instagram.com/${value.replace(/^\/+/, "")}`;
  })();

  return (
    <footer className="bg-black text-gray-400 font-titleFont">

      {/* MAIN FOOTER */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* BRAND */}
          <div>
            <h2 className="text-2xl tracking-[0.18em] font-semibold text-white mb-5">
              {storeName.toUpperCase()}
            </h2>

            <p className="text-sm leading-7 max-w-sm">
              Discover thoughtfully curated fashion designed
              to bring timeless style and effortless elegance
              to your wardrobe.
            </p>

            {/* SOCIAL */}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-6 text-xl text-gray-400 hover:text-white transition"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.15em] text-white mb-5">
              Quick Links
            </h3>

            <ul className="flex flex-col gap-3 text-sm">

              <li>
                <Link
                  to="/"
                  className="hover:text-white transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/shop"
                  className="hover:text-white transition"
                >
                  Shop
                </Link>
              </li>

              <li>
                <Link
                  to="/shop?filter=new"
                  className="hover:text-white transition"
                >
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link
                  to="/categories"
                  className="hover:text-white transition"
                >
                  Categories
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.15em] text-white mb-5">
              Contact Us
            </h3>

            <div className="flex flex-col gap-4 text-sm">

              {settings?.address && (
                <div className="flex gap-3">
                  <HiOutlineLocationMarker className="text-lg flex-shrink-0 mt-0.5" />

                  <span className="leading-6">
                    {settings.address}
                  </span>
                </div>
              )}

              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex gap-3 hover:text-white transition"
                >
                  <HiOutlinePhone className="text-lg flex-shrink-0" />

                  <span>{settings.phone}</span>
                </a>
              )}

              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex gap-3 hover:text-white transition break-all"
                >
                  <HiOutlineMail className="text-lg flex-shrink-0" />

                  <span>{settings.email}</span>
                </a>
              )}

              {settings?.opening_hours && (
                <div className="flex gap-3">
                  <HiOutlineClock className="text-lg flex-shrink-0" />

                  <span className="leading-6">
                    {settings.opening_hours}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* VISIT / WHATSAPP */}
          <div>
            <h3 className="text-sm uppercase tracking-[0.15em] text-white mb-5">
              Visit Us
            </h3>

            <p className="text-sm leading-7 mb-6">
              Have questions about our collections or
              want to check product availability?
              Get in touch with us.
            </p>

            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-600 px-5 py-3 text-sm text-white hover:bg-white hover:text-black transition"
              >
                <FaWhatsapp className="text-lg" />
                WhatsApp Us
              </a>
            )}

            {settings?.maps_url && (
              <a
                href={settings.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-sm underline underline-offset-4 hover:text-white transition"
              >
                View on Google Maps
              </a>
            )}
          </div>

        </div>
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/admin"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-white text-black text-sm font-medium rounded-md border border-white hover:bg-black hover:text-white transition-all duration-300"
        >
        Admin
        </Link>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-gray-800">

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>

          <p className="text-xs text-gray-600">
            Crafted with care
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;