import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const emptyForm = {
  image_url: "",
  heading: "",
  subheading: "",
  button_text: "",
  button_link: "",
  is_active: true,
  sort_order: 0,
};

const AdminBanners = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem(
    "inthi_admin_token"
  );

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // =====================================================
  // FETCH BANNERS
  // =====================================================



  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/banners`,
        {
          headers: {
          Authorization: `Bearer ${token}`,
          },
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
            "Failed to fetch banners"
        );
      }

      setBanners(data.banners || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetchBanners();
  }, [fetchBanners, navigate, token]);

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
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
  };

  // =====================================================
  // IMAGE UPLOAD
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

      alert("Banner image uploaded successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // SAVE BANNER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image_url.trim()) {
      alert("Please upload a banner image.");
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
        ? `${API_URL}/admin/banners/${editingId}`
        : `${API_URL}/admin/banners`;

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
          image_url:
            form.image_url.trim(),

          heading:
            form.heading.trim(),

          subheading:
            form.subheading.trim(),

          button_text:
            form.button_text.trim(),

          button_link:
            form.button_link.trim(),

          is_active:
            form.is_active,

          sort_order:
            Number(form.sort_order) || 0,
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
            "Failed to save banner"
        );
      }

      alert(
        editingId
          ? "Banner updated successfully"
          : "Banner created successfully"
      );

      resetForm();

      fetchBanners();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (banner) => {
    setEditingId(banner.id);

    setForm({
      image_url:
        banner.image_url || "",

      heading:
        banner.heading || "",

      subheading:
        banner.subheading || "",

      button_text:
        banner.button_text || "",

      button_link:
        banner.button_link || "",

      is_active:
        banner.is_active,

      sort_order:
        banner.sort_order || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DEACTIVATE
  // =====================================================

  const handleDeactivate = async (
    banner
  ) => {
    const confirmed =
      window.confirm(
        "Deactivate this banner?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${API_URL}/admin/banners/${banner.id}`,
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
            "Failed to deactivate banner"
        );
      }

      alert(
        "Banner deactivated successfully"
      );

      fetchBanners();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
  const handlePermanentDelete = async (banner) => {
    const confirmed = window.confirm(
      `PERMANENTLY DELETE THIS BANNER?\n\n` +
        `This will permanently remove the banner and its database record.\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/admin/banners/${banner.id}/permanent`,
        {
          method: "DELETE",
          headers: authHeaders,
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
          data.message || "Failed to permanently delete banner"
        );
      }

      alert("Banner permanently deleted successfully.");

      fetchBanners();
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
            Banners
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#666",
            }}
          >
            Manage homepage banners for Inthi.
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
                ? "Edit Banner"
                : "Add Banner"}
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

            {/* IMAGE */}

            <div
              style={{
                marginBottom: "20px",
              }}
            >

              <label>
                Banner Image
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
                  padding: "9px",
                }}
              />

              {uploading && (
                <p
                  style={{
                    marginTop: "7px",
                    color: "#666",
                    fontSize: "13px",
                  }}
                >
                  Uploading image...
                </p>
              )}

            </div>

            {/* IMAGE URL */}

            <div
              style={{
                marginBottom: "20px",
              }}
            >

              <label>
                Image URL
              </label>

              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Cloudinary URL"
                style={inputStyle}
              />

            </div>

            {/* IMAGE PREVIEW */}

            {form.image_url && (
              <div
                style={{
                  marginBottom: "25px",
                }}
              >

                <p
                  style={{
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  Banner Preview
                </p>

                <img
                  src={form.image_url}
                  alt="Banner preview"
                  style={{
                    width: "100%",
                    maxWidth: "700px",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border:
                      "1px solid #ddd",
                  }}
                />

              </div>
            )}

            {/* TEXT FIELDS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >

              <div>
                <label>
                  Heading
                </label>

                <input
                  type="text"
                  name="heading"
                  value={
                    form.heading
                  }
                  onChange={handleChange}
                  placeholder="New Collection"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Subheading
                </label>

                <input
                  type="text"
                  name="subheading"
                  value={
                    form.subheading
                  }
                  onChange={handleChange}
                  placeholder="Discover our latest styles"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Button Text
                </label>

                <input
                  type="text"
                  name="button_text"
                  value={
                    form.button_text
                  }
                  onChange={handleChange}
                  placeholder="Shop Now"
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Button Link
                </label>

                <input
                  type="text"
                  name="button_link"
                  value={
                    form.button_link
                  }
                  onChange={handleChange}
                  placeholder="/shop"
                  style={inputStyle}
                />
              </div>

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
                id="banner-active"
              />

              <label htmlFor="banner-active">
                Active banner
              </label>

            </div>

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
                ? "Update Banner"
                : "Add Banner"}
            </button>

          </form>

        </div>

        {/* ================================================= */}
        {/* BANNER LIST */}
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
              All Banners ({banners.length})
            </h2>

            <button
              onClick={fetchBanners}
              style={{
                padding: "8px 14px",
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
              Loading banners...
            </p>
          ) : banners.length === 0 ? (
            <p
              style={{
                color: "#666",
              }}
            >
              No banners found.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >

              {banners.map(
                (banner) => (
                  <div
                    key={banner.id}
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "18px",
                      padding: "15px",
                      border:
                        "1px solid #e5e5e5",
                      borderRadius: "7px",
                      flexWrap: "wrap",
                    }}
                  >

                    {/* IMAGE */}

                    <img
                      src={
                        banner.image_url
                      }
                      alt={
                        banner.heading ||
                        "Banner"
                      }
                      style={{
                        width: "180px",
                        height: "100px",
                        objectFit:
                          "cover",
                        borderRadius:
                          "5px",
                      }}
                    />

                    {/* INFO */}

                    <div
                      style={{
                        flex: 1,
                        minWidth:
                          "200px",
                      }}
                    >

                      <h3
                        style={{
                          margin: 0,
                        }}
                      >
                        {banner.heading ||
                          "Untitled Banner"}
                      </h3>

                      {banner.subheading && (
                        <p
                          style={{
                            margin:
                              "6px 0",
                            color: "#666",
                          }}
                        >
                          {
                            banner.subheading
                          }
                        </p>
                      )}

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
                          banner.sort_order
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
                            banner.is_active
                              ? "#e8f7ed"
                              : "#eee",
                          color:
                            banner.is_active
                              ? "#187a3d"
                              : "#777",
                        }}
                      >
                        {banner.is_active
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
                            banner
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

                      {banner.is_active && (
                        <button
                          onClick={() =>
                            handleDeactivate(
                              banner
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
                        onClick={() => handlePermanentDelete(banner)}
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

export default AdminBanners;