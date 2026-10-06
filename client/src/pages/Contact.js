import React, { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaPhoneAlt,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        const data = await response.json();

        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Contact settings error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="h-8 w-40 bg-gray-100 animate-pulse mx-auto" />
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="h-80 bg-gray-100 animate-pulse" />
            <div className="h-80 bg-gray-100 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  const whatsappNumber =
    settings?.whatsapp?.replace(/\D/g, "") || "";

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;

  const phoneUrl = settings?.phone
    ? `tel:${settings.phone.replace(/\s/g, "")}`
    : null;

  const emailUrl = settings?.email
    ? `mailto:${settings.email}`
    : null;

  return (
    <section className="min-h-screen bg-white py-10 sm:py-14 lg:py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">
            {settings?.store_name || "Inthi"}
          </p>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
            Contact Us
          </h1>

          <div className="w-12 h-[2px] bg-black mx-auto mt-4" />

          <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 mt-5 leading-6">
            We'd love to hear from you. Reach out to us for
            product enquiries, availability, orders, or any
            other questions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Contact Information */}
          <div className="border border-gray-200 p-6 sm:p-8 lg:p-10">
            <h2 className="text-xl sm:text-2xl font-semibold mb-8">
              Get in Touch
            </h2>

            <div className="space-y-7">

              {/* WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition">
                    <FaWhatsapp />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      WhatsApp
                    </p>

                    <p className="text-sm mt-1">
                      Chat with us on WhatsApp
                    </p>
                  </div>
                </a>
              )}

              {/* Phone */}
              {settings?.phone && (
                <a
                  href={phoneUrl}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition">
                    <FaPhoneAlt className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Phone
                    </p>

                    <p className="text-sm mt-1">
                      {settings.phone}
                    </p>
                  </div>
                </a>
              )}

              {/* Email */}
              {settings?.email && (
                <a
                  href={emailUrl}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition">
                    <FaEnvelope className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Email
                    </p>

                    <p className="text-sm mt-1 break-all">
                      {settings.email}
                    </p>
                  </div>
                </a>
              )}

              {/* Instagram */}
              {settings?.instagram && (
                <a
                  href={
                    settings.instagram.startsWith("http")
                      ? settings.instagram
                      : `https://instagram.com/${settings.instagram.replace(
                          /^@/,
                          ""
                        )}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition">
                    <FaInstagram />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Instagram
                    </p>

                    <p className="text-sm mt-1">
                      Follow us on Instagram
                    </p>
                  </div>
                </a>
              )}

              {/* Address */}
              {settings?.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Store Address
                    </p>

                    <p className="text-sm mt-1 leading-6">
                      {settings.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {settings?.opening_hours && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gray-100">
                    <FaClock className="text-sm" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Opening Hours
                    </p>

                    <p className="text-sm mt-1 leading-6 whitespace-pre-line">
                      {settings.opening_hours}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Store / Map */}
          <div className="flex flex-col gap-6">

            <div className="bg-[#fafafa] p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Visit {settings?.store_name || "Inthi"}
              </h2>

              <p className="text-sm text-gray-600 mt-3 leading-6">
                Visit our store to explore our collection in
                person and get help choosing the right style
                for you.
              </p>

              {settings?.maps_url && (
                <a
                  href={settings.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-6 bg-black text-white px-6 py-3 text-sm hover:bg-gray-800 transition"
                >
                  Get Directions
                </a>
              )}
            </div>

            {/* WhatsApp CTA */}
            {whatsappUrl && (
              <div className="border border-gray-200 p-6 sm:p-8">
                <FaWhatsapp className="text-2xl mb-4" />

                <h2 className="text-xl font-semibold">
                  Have a Question?
                </h2>

                <p className="text-sm text-gray-600 mt-2 leading-6">
                  For product availability, sizes, colors, or
                  order-related questions, message us directly
                  on WhatsApp.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-5 border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition"
                >
                  <FaWhatsapp />
                  Chat on WhatsApp
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;