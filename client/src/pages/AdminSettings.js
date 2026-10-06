import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const AdminSettings = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    store_name: "",
    whatsapp: "",
    phone: "",
    instagram: "",
    email: "",
    address: "",
    maps_url: "",
    opening_hours: "",
    logo_url: "",
    whatsapp_template: "",
  });

  const getToken = () => {
    return localStorage.getItem("inthi_admin_token");
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/settings`
        );

        if (
          response.data.success &&
          response.data.settings
        ) {
          setForm(response.data.settings);
        }
      } catch (error) {
        console.error(
          "Settings loading error:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem(
            "inthi_admin_token"
          );

          localStorage.removeItem(
            "inthi_admin"
          );

          navigate("/admin/login", {
            replace: true,
          });

          return;
        }

        toast.error(
          "Failed to load store settings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      navigate("/admin/login", {
        replace: true,
      });
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${API_URL}/admin/settings`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          "Store settings updated successfully."
        );

        if (response.data.settings) {
          setForm(response.data.settings);
        }
      } else {
        toast.error(
          response.data.message ||
            "Failed to update settings."
        );
      }
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem(
          "inthi_admin_token"
        );

        localStorage.removeItem(
          "inthi_admin"
        );

        navigate("/admin/login", {
          replace: true,
        });

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to update store settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading store settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-black text-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold">
              INTHI
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              Store Settings
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="border border-gray-600 px-4 py-2 text-sm hover:bg-white hover:text-black transition"
          >
            Back to Dashboard
          </button>

        </div>
      </header>

      {/* CONTENT */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            Store Settings
          </h2>

          <p className="text-gray-500 mt-1">
            Manage the information displayed across
            your Inthi website.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

          <section className="bg-white p-6 sm:p-8 shadow-sm">

            <h3 className="text-lg font-semibold">
              Store Information
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              Basic information about your boutique.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">

              <InputField
                label="Store Name"
                name="store_name"
                value={form.store_name}
                onChange={handleChange}
                placeholder="Inthi"
                required
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="store@example.com"
              />

              <InputField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
              />

              <InputField
                label="WhatsApp Number"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                required
              />

              <InputField
                label="Instagram"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="@inthi"
              />

              <InputField
                label="Google Maps URL"
                name="maps_url"
                value={form.maps_url}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
              />

            </div>

          </section>

          {/* ADDRESS */}

          <section className="bg-white p-6 sm:p-8 shadow-sm">

            <h3 className="text-lg font-semibold">
              Store Location
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              This information appears on the Contact
              page and Footer.
            </p>

            <label className="block">
              <span className="text-sm font-medium">
                Address
              </span>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="4"
                placeholder="Enter your complete store address"
                className="mt-2 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black resize-none"
              />
            </label>

            <label className="block mt-5">
              <span className="text-sm font-medium">
                Opening Hours
              </span>

              <textarea
                name="opening_hours"
                value={form.opening_hours}
                onChange={handleChange}
                rows="4"
                placeholder={"Monday - Saturday: 10:00 AM - 8:00 PM\nSunday: Closed"}
                className="mt-2 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black resize-none"
              />
            </label>

          </section>

          {/* WHATSAPP */}

          <section className="bg-white p-6 sm:p-8 shadow-sm">

            <h3 className="text-lg font-semibold">
              WhatsApp Order Settings
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              Customize the message used when customers
              place an order through WhatsApp.
            </p>

            <label className="block">
              <span className="text-sm font-medium">
                WhatsApp Message Template
              </span>

              <textarea
                name="whatsapp_template"
                value={form.whatsapp_template}
                onChange={handleChange}
                rows="6"
                placeholder="Leave blank to use the default order message."
                className="mt-2 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black resize-none"
              />
            </label>

            <p className="text-xs text-gray-500 mt-3">
              The current order system generates the
              product list, quantities, total, and order
              reference automatically.
            </p>

          </section>

          {/* LOGO */}

          <section className="bg-white p-6 sm:p-8 shadow-sm">

            <h3 className="text-lg font-semibold">
              Store Logo
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              Enter the Cloudinary URL of your store logo.
            </p>

            <InputField
              label="Logo URL"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              placeholder="https://res.cloudinary.com/..."
            />

            {form.logo_url && (
              <div className="mt-5 border border-gray-200 p-4 w-fit">
                <img
                  src={form.logo_url}
                  alt="Store logo"
                  className="max-w-[220px] max-h-24 object-contain"
                />
              </div>
            )}

          </section>

          {/* SAVE */}

          <div className="flex justify-end pb-10">

            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white px-8 py-3 text-sm font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>

          </div>

        </form>
      </main>

      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) => {
  return (
    <label className="block">
      <span className="text-sm font-medium">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
      />
    </label>
  );
};

export default AdminSettings;