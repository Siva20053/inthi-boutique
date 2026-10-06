import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AdminAccount = () => {
  const navigate = useNavigate();


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("inthi_admin_token");

  useEffect(() => {
    if (!token) {
    navigate("/admin/login");
    return;
    }

    const fetchAccount = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/account`,
        {
          headers: {
          Authorization: `Bearer ${token}`,
         },
        }
    );

    const data = response.data.account;

    setName(data.name || "");
    setEmail(data.email || "");
    } catch (err) {
        console.error("Account fetch error:", err);

        if (err.response?.status === 401) {
            localStorage.removeItem("inthi_admin_token");
            localStorage.removeItem("inthi_admin");

            navigate("/admin/login");
            return;
        }

        setError(
            err.response?.data?.message ||
              "Failed to load account"
        );
        } finally {
          setLoading(false);
     }
    };

        fetchAccount();
    }, [navigate, token]);

    const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    // Only validate password section if user entered a new password
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError(
          "Enter your current password to change the password."
        );
        return;
      }

      if (!newPassword) {
        setError("Enter a new password.");
        return;
      }

      if (newPassword.length < 8) {
        setError(
          "New password must be at least 8 characters."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${API_URL}/admin/account`,
        {
          name,
          email,
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedAccount = response.data.account;

      setName(updatedAccount.name);
      setEmail(updatedAccount.email);

      // Update locally stored admin information
      localStorage.setItem(
        "inthi_admin",
        JSON.stringify(updatedAccount)
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "Account details updated successfully."
      );
    } catch (err) {
      console.error("Account update error:", err);

      if (err.response?.status === 401) {
        setError(
          err.response?.data?.message ||
            "Current password is incorrect."
        );
        return;
      }

      setError(
        err.response?.data?.message ||
          "Failed to update account."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">
          Loading account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Inthi Admin
            </p>

            <h1 className="text-2xl font-semibold text-gray-900 mt-1">
              Account
            </h1>
          </div>

          <Link
            to="/admin"
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Account information */}
        <div className="bg-white border rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Account Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Update your administrator name and email.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                placeholder="Admin name"
              />
            </div>

            {/* Email */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                placeholder="admin@example.com"
              />
            </div>

            <div className="border-t pt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>

              <p className="text-sm text-gray-500 mt-1 mb-6">
                Leave these fields empty if you don't want to
                change your password.
              </p>

              {/* Current password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  placeholder="Enter current password"
                />
              </div>

              {/* New password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  placeholder="Minimum 8 characters"
                />
              </div>

              {/* Confirm */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-black"
                  placeholder="Repeat new password"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Security note */}
        <div className="mt-5 bg-gray-100 border rounded-xl p-5">
          <p className="text-sm font-medium text-gray-800">
            Security
          </p>

          <p className="text-sm text-gray-600 mt-1">
            Passwords are never displayed in the admin panel.
            Your password is securely stored as a hashed value
            in the database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAccount;