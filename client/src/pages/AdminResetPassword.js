import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!token) {
      setError(
        "This password reset link is invalid."
      );
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "The passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/admin/reset-password`,
        {
          token,
          new_password: newPassword,
        }
      );

      if (response.data.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate("/admin/login", {
            replace: true,
          });
        }, 2500);
      }
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to reset your password."
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

          {success ? (
            <div className="text-center">

              <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-xl">
                  ✓
                </span>
              </div>

              <h2 className="text-xl font-semibold mt-5">
                Password Reset
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Your password has been changed
                successfully.
              </p>

              <p className="text-xs text-gray-400 mt-4">
                Redirecting to Admin Login...
              </p>

            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                Create New Password
              </h2>

              <p className="text-sm text-gray-500 mt-2 leading-6">
                Choose a new password for your
                Inthi admin account.
              </p>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6"
              >

                {/* NEW PASSWORD */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Resetting..."
                    : "Reset Password"}
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
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;