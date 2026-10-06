import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/admin/login`,
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        const { token, admin } = response.data;

        // Save authentication data
        localStorage.setItem("inthi_admin_token", token);
        localStorage.setItem(
          "inthi_admin",
          JSON.stringify(admin)
        );

        toast.success("Login successful!");

        // Go to admin dashboard
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        toast.error(
          response.data.message || "Login failed"
        );
      }
    } catch (error) {
      console.error("Admin login error:", error);

      toast.error(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-wide">
              INTHI
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Admin Panel
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter admin email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-black transition"
                autoComplete="current-password"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mb-6">
              <Link
                to="/admin/forgot-password"
                className="text-sm text-gray-500 hover:text-black transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Back to Store */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-black transition"
            >
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;