import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your admin email.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/admin/forgot-password`,
        {
          email: email.trim(),
        }
      );

      setMessage(
        response.data.message ||
          "If an admin account exists with that email, a password reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-wide">
            INTHI
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Admin Password Recovery
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white shadow-sm border p-6 sm:p-8">

          <h2 className="text-xl font-semibold">
            Forgot Password?
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-6">
            Enter the email address associated with your
            admin account. If the account exists, we'll
            send you a password reset link.
          </p>

          {message && (
            <div className="mt-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="admin@example.com"
              autoComplete="email"
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-sm text-gray-600 hover:text-black"
            >
              ← Back to Admin Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;