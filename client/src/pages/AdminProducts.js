import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  sale_price: "",
  category_id: "",
  fabric: "",
  is_featured: false,
  is_new_arrival: false,
  is_active: true,
  images: [""],
  variants: [],
};

const AdminProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [uploadingImages, setUploadingImages] = useState({});

  const token = localStorage.getItem("inthi_admin_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // LOAD PRODUCTS + CATEGORIES
  // =====================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (!token) {
        navigate("/admin/login", {
          replace: true,
        });
        return;
      }

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          axios.get(
            `${API_URL}/admin/products`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            `${API_URL}/categories`
          ),
        ]);

      setProducts(
        productsResponse.data.products || []
      );

      setCategories(
        categoriesResponse.data.categories || []
      );
    } catch (error) {
      console.error(error);

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
        "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =====================================================
  // IMAGE HANDLERS
  // =====================================================

  const addImageField = () => {
    setForm((previous) => ({
      ...previous,
      images: [
        ...previous.images,
        "",
      ],
    }));
  };

  const removeImageField = (index) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    }));
  };

  const updateImage = (index, value) => {
    setForm((previous) => ({
      ...previous,
      images: previous.images.map(
        (image, imageIndex) =>
          imageIndex === index
            ? value
            : image
      ),
    }));
  };

  // =====================================================
  // CLOUDINARY IMAGE UPLOAD
  // =====================================================

  const uploadImage = async (index, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select an image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "Image must be smaller than 10MB."
      );
      return;
    }

    try {
      setUploadingImages((previous) => ({
        ...previous,
        [index]: true,
      }));

      const formData = new FormData();

      formData.append("image", file);

      const response = await axios.post(
        `${API_URL}/admin/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl =
        response.data.image?.url;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned."
        );
      }

      updateImage(index, imageUrl);

      toast.success(
        "Image uploaded successfully."
      );
    } catch (error) {
      console.error(
        "Image upload error:",
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
          "Failed to upload image."
      );
    } finally {
      setUploadingImages((previous) => ({
        ...previous,
        [index]: false,
      }));
    }
  };

  // =====================================================
  // VARIANT HANDLERS
  // =====================================================

  const addVariant = () => {
    setForm((previous) => ({
      ...previous,
      variants: [
        ...previous.variants,
        {
          size: "",
          color: "",
          stock: 0,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.filter(
        (_, variantIndex) =>
          variantIndex !== index
      ),
    }));
  };

  const updateVariant = (
    index,
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      variants: previous.variants.map(
        (variant, variantIndex) =>
          variantIndex === index
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      ),
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
      images: [""],
      variants: [],
    });

    setEditingId(null);
    setUploadingImages({});
  };

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const handleAddProduct = () => {
    resetForm();

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const handleEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",

      description:
        product.description || "",

      price: product.price || "",

      sale_price:
        product.sale_price || "",

      category_id:
        product.category_id || "",

      fabric: product.fabric || "",

      is_featured:
        Boolean(product.is_featured),

      is_new_arrival:
        Boolean(product.is_new_arrival),

      is_active:
        Boolean(product.is_active),

      images:
        product.images?.length > 0
          ? product.images.map(
              (image) =>
                image.image_url
            )
          : [""],

      variants:
        product.variants?.map(
          (variant) => ({
            size: variant.size || "",

            color:
              variant.color || "",

            stock:
              variant.stock ?? 0,
          })
        ) || [],
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Product name is required."
      );
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      toast.error(
        "Enter a valid product price."
      );
      return;
    }

    if (!form.category_id) {
      toast.error(
        "Please select a category."
      );
      return;
    }

    if (
      Object.values(uploadingImages).some(
        (value) => value
      )
    ) {
      toast.error(
        "Please wait for image uploads to finish."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,

        name: form.name.trim(),

        price: Number(form.price),

        sale_price:
          form.sale_price === ""
            ? null
            : Number(form.sale_price),

        category_id:
          Number(form.category_id),

        images: form.images.filter(
          (image) =>
            image.trim() !== ""
        ),

        variants: form.variants
          .filter(
            (variant) =>
              variant.size ||
              variant.color
          )
          .map((variant) => ({
            size:
              variant.size || null,

            color:
              variant.color || null,

            stock:
              Number(variant.stock) || 0,
          })),
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/admin/products/${editingId}`,
          payload,
          authConfig
        );

        toast.success(
          "Product updated successfully."
        );
      } else {
        await axios.post(
          `${API_URL}/admin/products`,
          payload,
          authConfig
        );

        toast.success(
          "Product created successfully."
        );
      }

      resetForm();

      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(error);

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
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DEACTIVATE PRODUCT
  // =====================================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Deactivate "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/admin/products/${product.id}`,
        authConfig
      );

      toast.success(
        "Product deactivated."
      );

      await loadData();
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to deactivate product."
      );
    }
  };

  // =====================================================
// PERMANENTLY DELETE PRODUCT
// =====================================================

const handlePermanentDelete = async (product) => {
  const confirmed = window.confirm(
    `PERMANENTLY DELETE "${product.name}"?\n\n` +
      `This will permanently remove the product, ` +
      `all its images, and all its variants.\n\n` +
      `This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await axios.delete(
      `${API_URL}/admin/products/${product.id}/permanent`,
      authConfig
    );

    toast.success("Product permanently deleted.");

    await loadData();
  } catch (error) {
    console.error(
      "Permanent product deletion error:",
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
        "Failed to permanently delete product."
    );
  }
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-black text-white">
        <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="text-2xl font-titleFont font-semibold"
            >
              INTHI
            </button>

            <p className="text-xs text-gray-400 mt-1">
              Product Management
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin")
            }
            className="border border-gray-600 px-4 py-2 text-sm hover:bg-white hover:text-black duration-300"
          >
            Dashboard
          </button>

        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-8">

        {/* PAGE HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-2xl font-semibold">
              Products
            </h1>

            <p className="text-gray-500 mt-1">
              Manage your Inthi catalogue.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="bg-black text-white px-5 py-3 hover:bg-gray-800 duration-300"
          >
            + Add Product
          </button>

        </div>

        {/* ================================================= */}
        {/* PRODUCT FORM */}
        {/* ================================================= */}

        {showForm && (
          <div className="bg-white p-6 mb-8 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold">
                {editingId
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="text-gray-500 hover:text-black"
              >
                Close
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* BASIC INFO */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Input
                  label="Product Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Floral Anarkali Dress"
                />

                <Input
                  label="Fabric"
                  name="fabric"
                  value={form.fabric}
                  onChange={handleChange}
                  placeholder="e.g. Rayon"
                />

                <Input
                  label="Price"
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="1899"
                />

                <Input
                  label="Sale Price"
                  name="sale_price"
                  type="number"
                  min="0"
                  value={form.sale_price}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                {/* CATEGORY */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>

                  <select
                    name="category_id"
                    value={
                      form.category_id
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>
                </div>

              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the product..."
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              {/* CHECKBOXES */}

              <div className="flex flex-wrap gap-6">

                <Checkbox
                  name="is_featured"
                  checked={
                    form.is_featured
                  }
                  onChange={handleChange}
                  label="Featured Product"
                />

                <Checkbox
                  name="is_new_arrival"
                  checked={
                    form.is_new_arrival
                  }
                  onChange={handleChange}
                  label="New Arrival"
                />

                <Checkbox
                  name="is_active"
                  checked={
                    form.is_active
                  }
                  onChange={handleChange}
                  label="Active"
                />

              </div>

              {/* ================================================= */}
              {/* IMAGES */}
              {/* ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <h3 className="font-semibold">
                    Product Images
                  </h3>

                  <button
                    type="button"
                    onClick={
                      addImageField
                    }
                    className="text-sm border border-gray-300 px-3 py-2 hover:border-black"
                  >
                    + Add Image
                  </button>

                </div>

                <div className="space-y-5">

                  {form.images.map(
                    (image, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 p-4"
                      >

                        <div className="flex flex-col sm:flex-row gap-4">

                          {/* IMAGE PREVIEW */}

                          <div className="w-28 h-32 bg-gray-100 overflow-hidden flex-shrink-0">

                            {image ? (
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center px-2">
                                Image Preview
                              </div>
                            )}

                          </div>

                          {/* IMAGE CONTROLS */}

                          <div className="flex-1 space-y-3">

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Upload Image
                              </label>

                              <input
                                type="file"
                                accept="image/*"
                                disabled={
                                  uploadingImages[
                                    index
                                  ]
                                }
                                onChange={(
                                  event
                                ) =>
                                  uploadImage(
                                    index,
                                    event.target
                                      .files?.[0]
                                  )
                                }
                                className="w-full border border-gray-300 px-4 py-3 text-sm"
                              />

                              {uploadingImages[
                                index
                              ] && (
                                <p className="text-sm text-gray-500 mt-2">
                                  Uploading image...
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Image URL
                              </label>

                              <input
                                type="url"
                                value={image}
                                onChange={(
                                  event
                                ) =>
                                  updateImage(
                                    index,
                                    event.target
                                      .value
                                  )
                                }
                                placeholder="Or paste image URL"
                                className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
                              />
                            </div>

                          </div>

                          {/* REMOVE */}

                          {form.images.length >
                            1 && (
                            <div className="flex items-start">

                              <button
                                type="button"
                                onClick={() =>
                                  removeImageField(
                                    index
                                  )
                                }
                                disabled={
                                  uploadingImages[
                                    index
                                  ]
                                }
                                className="px-4 py-3 border border-gray-300 hover:border-red-500 hover:text-red-500 disabled:opacity-50"
                              >
                                ×
                              </button>

                            </div>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Upload images directly from
                  your device. Images are stored
                  securely in Cloudinary.
                </p>

              </div>

              {/* ================================================= */}
              {/* VARIANTS */}
              {/* ================================================= */}

              <div>

                <div className="flex items-center justify-between mb-3">

                  <h3 className="font-semibold">
                    Size / Color / Stock
                  </h3>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="text-sm border border-gray-300 px-3 py-2 hover:border-black"
                  >
                    + Add Variant
                  </button>

                </div>

                {form.variants.length ===
                0 ? (
                  <p className="text-sm text-gray-500 border border-dashed border-gray-300 p-4">
                    No variants. Use this for
                    products that don't have
                    size/color options.
                  </p>
                ) : (
                  <div className="space-y-3">

                    {form.variants.map(
                      (variant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_120px_auto] gap-2"
                        >

                          <input
                            type="text"
                            value={
                              variant.size
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "size",
                                event.target.value
                              )
                            }
                            placeholder="Size e.g. M"
                            className="border border-gray-300 px-4 py-3 outline-none focus:border-black"
                          />

                          <input
                            type="text"
                            value={
                              variant.color
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "color",
                                event.target.value
                              )
                            }
                            placeholder="Color e.g. Pink"
                            className="border border-gray-300 px-4 py-3 outline-none focus:border-black"
                          />

                          <input
                            type="number"
                            min="0"
                            value={
                              variant.stock
                            }
                            onChange={(event) =>
                              updateVariant(
                                index,
                                "stock",
                                event.target.value
                              )
                            }
                            placeholder="Stock"
                            className="border border-gray-300 px-4 py-3 outline-none focus:border-black"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                index
                              )
                            }
                            className="border border-gray-300 px-4 hover:border-red-500 hover:text-red-500"
                          >
                            ×
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ================================================= */}
              {/* SUBMIT */}
              {/* ================================================= */}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">

                <button
                  type="submit"
                  disabled={
                    saving ||
                    Object.values(
                      uploadingImages
                    ).some(
                      (value) => value
                    )
                  }
                  className="bg-black text-white px-6 py-3 hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Create Product"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="border border-gray-300 px-6 py-3 hover:border-black"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

        {/* ================================================= */}
        {/* PRODUCT LIST */}
        {/* ================================================= */}

        <div className="bg-white shadow-sm">

          <div className="p-6 border-b">

            <h2 className="text-lg font-semibold">
              All Products
            </h2>

          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm">
                      Product
                    </th>

                    <th className="text-left px-6 py-4 text-sm">
                      Category
                    </th>

                    <th className="text-left px-6 py-4 text-sm">
                      Price
                    </th>

                    <th className="text-left px-6 py-4 text-sm">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-sm">
                      Variants
                    </th>

                    <th className="text-right px-6 py-4 text-sm">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products.map(
                    (product) => {
                      const firstImage =
                        product.images?.[0]
                          ?.image_url;

                      return (
                        <tr
                          key={product.id}
                          className="border-t"
                        >

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-4">

                              <div className="w-16 h-20 bg-gray-100 overflow-hidden flex-shrink-0">

                                {firstImage ? (
                                  <img
                                    src={
                                      firstImage
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    No Image
                                  </div>
                                )}

                              </div>

                              <div>

                                <p className="font-medium">
                                  {
                                    product.name
                                  }
                                </p>

                                <div className="flex gap-2 mt-1">

                                  {product.is_new_arrival && (
                                    <span className="text-xs bg-black text-white px-2 py-1">
                                      New
                                    </span>
                                  )}

                                  {product.is_featured && (
                                    <span className="text-xs border border-gray-300 px-2 py-1">
                                      Featured
                                    </span>
                                  )}

                                </div>

                              </div>

                            </div>

                          </td>

                          <td className="px-6 py-4 text-sm">
                            {
                              product.category_name ||
                              "—"
                            }
                          </td>

                          <td className="px-6 py-4">

                            <div className="text-sm">
                              ₹
                              {Number(
                                product.price
                              ).toFixed(2)}
                            </div>

                            {product.sale_price && (
                              <div className="text-xs text-gray-500">
                                Sale: ₹
                                {Number(
                                  product.sale_price
                                ).toFixed(2)}
                              </div>
                            )}

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`text-xs px-3 py-1 ${
                                product.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {product.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-sm">
                            {
                              product
                                .variants
                                ?.length || 0
                            }
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(product)
                                }
                                className="border border-gray-300 px-3 py-2 text-sm hover:border-black"
                              >
                                Edit
                              </button>

                              {product.is_active && (
                                <button
                                    type="button"
                                    onClick={() =>
                                    handleDelete(product)
                                    }
                                  className="border border-gray-300 px-3 py-2 text-sm hover:border-orange-500 hover:text-orange-500"
                                >
                                  Deactivate
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handlePermanentDelete(product)
                                }
                                className="border border-red-300 text-red-600 px-3 py-2 text-sm hover:bg-red-600 hover:text-white transition"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

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

// =====================================================
// REUSABLE INPUT
// =====================================================

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
}) => {
  return (
    <div>

      <label className="block text-sm font-medium mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black"
      />

    </div>
  );
};

// =====================================================
// CHECKBOX
// =====================================================

const Checkbox = ({
  name,
  checked,
  onChange,
  label,
}) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
      />

      <span className="text-sm">
        {label}
      </span>

    </label>
  );
};

export default AdminProducts;