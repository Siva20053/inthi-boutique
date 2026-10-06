import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const emptyForm = {
  name: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

const AdminCategories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem(
    "inthi_admin_token"
  );

  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchCategories();
  }, [navigate, token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "inthi_admin_token"
          );

          localStorage.removeItem(
            "inthi_admin"
          );

          navigate("/admin/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to fetch categories"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORM HANDLER
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
  };

  // =====================================================
  // CLOUDINARY IMAGE UPLOAD
  // =====================================================

  const uploadImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be smaller than 10MB.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/admin/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "inthi_admin_token"
          );

          localStorage.removeItem(
            "inthi_admin"
          );

          navigate("/admin/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to upload image"
        );
      }

      const imageUrl = data.image?.url;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned."
        );
      }

      setForm((prev) => ({
        ...prev,
        image_url: imageUrl,
      }));

      alert("Image uploaded successfully.");
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      alert(
        error.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // SAVE CATEGORY
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Category name is required"
      );
      return;
    }

    if (uploading) {
      alert(
        "Please wait for the image upload to finish."
      );
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/admin/categories/${editingId}`
        : `${API_URL}/admin/categories`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),

          image_url:
            form.image_url.trim() ||
            null,

          is_active:
            form.is_active,

          sort_order:
            Number(form.sort_order) ||
            0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "inthi_admin_token"
          );

          localStorage.removeItem(
            "inthi_admin"
          );

          navigate("/admin/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to save category"
        );
      }

      alert(
        editingId
          ? "Category updated successfully"
          : "Category created successfully"
      );

      resetForm();

      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT CATEGORY
  // =====================================================

  const handleEdit = (category) => {
    setEditingId(category.id);

    setForm({
      name: category.name || "",

      image_url:
        category.image_url || "",

      is_active:
        category.is_active,

      sort_order:
        category.sort_order || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DEACTIVATE CATEGORY
  // =====================================================

  const handleDeactivate = async (
    category
  ) => {
    const confirmed =
      window.confirm(
        `Deactivate "${category.name}"?`
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${API_URL}/admin/categories/${category.id}`,
          {
            method: "DELETE",
            headers: authHeaders,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "inthi_admin_token"
          );

          localStorage.removeItem(
            "inthi_admin"
          );

          navigate("/admin/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to deactivate category"
        );
      }

      alert(
        "Category deactivated successfully"
      );

      fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handlePermanentDelete = async (category) => {
  const confirmed = window.confirm(
    `PERMANENTLY DELETE "${category.name}"?\n\n` +
      `This will permanently remove this category.\n\n` +
      `A category can only be deleted if no products are assigned to it.\n\n` +
      `This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_URL}/admin/categories/${category.id}/permanent`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("inthi_admin_token");
        localStorage.removeItem("inthi_admin");

        navigate("/admin/login");
        return;
      }

      throw new Error(
        data.message || "Failed to permanently delete category"
      );
    }

    alert("Category permanently deleted successfully");

    fetchCategories();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "30px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Categories
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#666",
            }}
          >
            Manage product categories
            for Inthi.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/admin")
          }
          style={{
            padding: "11px 18px",
            border: "1px solid #222",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          ← Dashboard
        </button>

      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >

            <h2 style={{ margin: 0 }}>
              {editingId
                ? "Edit Category"
                : "Add Category"}
            </h2>

            {editingId && (
              <button
                onClick={resetForm}
                style={{
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >

              {/* CATEGORY NAME */}

              <div>
                <label>
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Sarees"
                  style={inputStyle}
                />
              </div>

              {/* IMAGE UPLOAD */}

              <div>
                <label>
                  Category Image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) =>
                    uploadImage(
                      e.target.files?.[0]
                    )
                  }
                  style={{
                    ...inputStyle,
                    padding:
                      "9px",
                  }}
                />

                {uploading && (
                  <p
                    style={{
                      marginTop: "7px",
                      color: "#666",
                      fontSize:
                        "13px",
                    }}
                  >
                    Uploading image...
                  </p>
                )}

              </div>

              {/* SORT ORDER */}

              <div>
                <label>
                  Sort Order
                </label>

                <input
                  type="number"
                  name="sort_order"
                  value={
                    form.sort_order
                  }
                  onChange={handleChange}
                  min="0"
                  style={inputStyle}
                />
              </div>

            </div>

            {/* IMAGE URL FALLBACK */}

            <div
              style={{
                marginTop: "18px",
              }}
            >

              <label>
                Image URL
              </label>

              <input
                type="text"
                name="image_url"
                value={
                  form.image_url
                }
                onChange={handleChange}
                placeholder="Cloudinary URL or public image URL"
                style={inputStyle}
              />

              <p
                style={{
                  marginTop: "6px",
                  color: "#777",
                  fontSize: "12px",
                }}
              >
                You can upload an image
                above or paste an image
                URL manually.
              </p>

            </div>

            {/* ACTIVE */}

            <div
              style={{
                marginTop: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >

              <input
                type="checkbox"
                name="is_active"
                checked={
                  form.is_active
                }
                onChange={handleChange}
                id="category-active"
              />

              <label htmlFor="category-active">
                Active category
              </label>

            </div>

            {/* IMAGE PREVIEW */}

            {form.image_url && (
              <div
                style={{
                  marginTop: "20px",
                }}
              >

                <p
                  style={{
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  Image Preview
                </p>

                <img
                  src={form.image_url}
                  alt="Category preview"
                  style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border:
                      "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                saving || uploading
              }
              style={{
                marginTop: "22px",
                padding:
                  "12px 25px",
                background: "#111",
                color: "#fff",
                border: "none",
                cursor:
                  saving || uploading
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  saving || uploading
                    ? 0.7
                    : 1,
              }}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Category"
                : "Add Category"}
            </button>

          </form>

        </div>

        {/* ================================================= */}
        {/* CATEGORY LIST */}
        {/* ================================================= */}

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "8px",
            boxShadow:
              "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >

            <h2 style={{ margin: 0 }}>
              All Categories (
              {categories.length})
            </h2>

            <button
              onClick={fetchCategories}
              style={{
                padding:
                  "8px 14px",
                border:
                  "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>

          </div>

          {loading ? (
            <p>
              Loading categories...
            </p>
          ) : categories.length ===
            0 ? (
            <p
              style={{
                color: "#666",
              }}
            >
              No categories found.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >

              {categories.map(
                (category) => (
                  <div
                    key={category.id}
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "16px",
                      padding: "14px",
                      border:
                        "1px solid #e5e5e5",
                      borderRadius: "7px",
                      flexWrap: "wrap",
                    }}
                  >

                    {/* IMAGE */}

                    <div>

                      {category.image_url ? (
                        <img
                          src={
                            category.image_url
                          }
                          alt={
                            category.name
                          }
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "5px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            background:
                              "#eee",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color: "#777",
                            fontSize:
                              "12px",
                            textAlign:
                              "center",
                          }}
                        >
                          No Image
                        </div>
                      )}

                    </div>

                    {/* INFO */}

                    <div
                      style={{
                        flex: 1,
                      }}
                    >

                      <h3
                        style={{
                          margin: 0,
                          fontSize:
                            "17px",
                        }}
                      >
                        {category.name}
                      </h3>

                      <p
                        style={{
                          margin:
                            "5px 0",
                          color: "#777",
                          fontSize:
                            "13px",
                        }}
                      >
                        Sort Order:{" "}
                        {
                          category.sort_order
                        }
                      </p>

                      <span
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "4px 9px",
                          borderRadius:
                            "20px",
                          fontSize:
                            "12px",
                          background:
                            category.is_active
                              ? "#e8f7ed"
                              : "#eee",
                          color:
                            category.is_active
                              ? "#187a3d"
                              : "#777",
                        }}
                      >
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                      }}
                    >

                      <button
                        onClick={() =>
                          handleEdit(
                            category
                          )
                        }
                        style={{
                          padding:
                            "8px 14px",
                          border:
                            "1px solid #ddd",
                          background:
                            "#fff",
                          cursor:
                            "pointer",
                        }}
                      >
                        Edit
                      </button>

                      {category.is_active && (
                        <button
                          onClick={() =>
                            handleDeactivate(
                              category
                            )
                          }
                          style={{
                            padding:
                              "8px 14px",
                            border:
                              "1px solid #ddd",
                            background:
                              "#fff",
                            color:
                              "#b00020",
                            cursor:
                              "pointer",
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handlePermanentDelete(category)}
                          style={{
                            padding: "8px 14px",
                            border: "1px solid #f0b4b4",
                            background: "#fff",
                            color: "#c62828",
                            cursor: "pointer",
                          }}
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: "7px",
  padding: "11px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  outline: "none",
};

export default AdminCategories;