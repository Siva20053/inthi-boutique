import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    activeProducts: 0,
    categories: 0,
    newArrivals: 0,
    featured: 0,
  });

  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return localStorage.getItem("inthi_admin_token");
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_URL}/admin/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data.success) {
          throw new Error("Authentication failed");
        }

        setAdmin(response.data.admin);

        // Get product data
        const productsResponse = await axios.get(
          `${API_URL}/products`
        );

        const products =
          productsResponse.data.products || [];

        // Get categories
        const categoriesResponse =
          await axios.get(`${API_URL}/categories`);

        const categories =
          categoriesResponse.data.categories || [];

        setStats({
          products: products.length,

          activeProducts: products.filter(
            (product) => product.is_active
          ).length,

          categories: categories.length,

          newArrivals: products.filter(
            (product) => product.is_new_arrival
          ).length,

          featured: products.filter(
            (product) => product.is_featured
          ).length,
        });
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        localStorage.removeItem(
          "inthi_admin_token"
        );

        localStorage.removeItem(
          "inthi_admin"
        );

        toast.error("Your session has expired.");

        setTimeout(() => {
          navigate("/admin/login", {
            replace: true,
          });
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(
      "inthi_admin_token"
    );

    localStorage.removeItem("inthi_admin");

    navigate("/admin/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading dashboard...
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
            <h1 className="text-2xl font-titleFont font-semibold">
              INTHI
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-5">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {admin?.name}
              </p>

              <p className="text-xs text-gray-400">
                {admin?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="border border-gray-600 px-4 py-2 text-sm hover:bg-white hover:text-black duration-300"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-1">
            Welcome back, {admin?.name}.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

          <StatCard
            title="Products"
            value={stats.products}
          />

          <StatCard
            title="Active Products"
            value={stats.activeProducts}
          />

          <StatCard
            title="Categories"
            value={stats.categories}
          />

          <StatCard
            title="New Arrivals"
            value={stats.newArrivals}
          />

          <StatCard
            title="Featured"
            value={stats.featured}
          />

        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-10">

          <h3 className="text-xl font-semibold mb-5">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

            <ActionCard
              title="Products"
              description="Add and manage products"
              onClick={() =>
                navigate("/admin/products")
              }
            />

            <ActionCard
              title="Categories"
              description="Manage product categories"
              onClick={() =>
                navigate("/admin/categories")
              }
            />

            <ActionCard
              title="Banners"
              description="Manage homepage banners"
              onClick={() =>
                navigate("/admin/banners")
              }
            />

            <ActionCard
              title="Store Settings"
              description="WhatsApp, address and store details"
              onClick={() =>
                navigate("/admin/settings")
              }
            />

            <ActionCard
              title="Account"
              description="Manage your admin account"
              onClick={() =>
                navigate("/admin/account")
              }
            />

          </div>
        </div>

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

const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="text-3xl font-semibold mt-3">
        {value}
      </p>
    </div>
  );
};

const ActionCard = ({
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white p-6 text-left shadow-sm hover:shadow-md duration-300"
    >
      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-2">
        {description}
      </p>

      <p className="text-sm font-medium mt-5">
        Manage →
      </p>
    </button>
  );
};

export default AdminDashboard;