import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import "./adminProducts.css";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    supplier: "",
    supplierSlug: "",
    category: "",
    categorySlug: "",
    brand: "",
    brandSlug: "",
    manufacturer: "",
    manufacturerSlug: "",
    capacity: "",
    description: "",
    image: "",
    images: [],
    featuresText: "",
    specifications: {
      voltage: "",
      batteryType: "",
      inverterType: "",
      warranty: "",
      phase: "",
      outputPower: "",
    },
    inStock: true,
  });

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://builtright-backend.onrender.com/api/products");
        const data = await response.json();

        if (data.status && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
        setMessage("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const slugify = (text) =>
    String(text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      supplier: "",
      supplierSlug: "",
      category: "",
      categorySlug: "",
      brand: "",
      brandSlug: "",
      manufacturer: "",
      manufacturerSlug: "",
      capacity: "",
      description: "",
      image: "",
      images: [],
      featuresText: "",
      specifications: {
        voltage: "",
        batteryType: "",
        inverterType: "",
        warranty: "",
        phase: "",
        outputPower: "",
      },
      inStock: true,
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      price: product.price || "",
      supplier: product.supplier || "",
      supplierSlug: product.supplierSlug || "",
      category: product.category || "",
      categorySlug: product.categorySlug || "",
      brand: product.brand || "",
      brandSlug: product.brandSlug || "",
      manufacturer: product.manufacturer || "",
      manufacturerSlug: product.manufacturerSlug || "",
      capacity: product.capacity || "",
      description: product.description || "",
      image: product.image || product.images?.[0] || "",
      images:
        product.images?.length > 0
          ? product.images
          : product.image
          ? [product.image]
          : [],
      featuresText: Array.isArray(product.features)
        ? product.features.join("\n")
        : "",
      specifications: {
        voltage: product.specifications?.voltage || "",
        batteryType: product.specifications?.batteryType || "",
        inverterType: product.specifications?.inverterType || "",
        warranty: product.specifications?.warranty || "",
        phase: product.specifications?.phase || "",
        outputPower: product.specifications?.outputPower || "",
      },
      inStock: product.inStock ?? true,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
    setUploadingImage(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "supplier") updated.supplierSlug = slugify(value);
      if (name === "category") updated.categorySlug = slugify(value);
      if (name === "brand") updated.brandSlug = slugify(value);
      if (name === "manufacturer") updated.manufacturerSlug = slugify(value);

      return updated;
    });
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value,
      },
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      setUploadingImage(true);
      setMessage("");

      const uploadedUrls = [];

      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("image", file);

        const response = await fetch(
          "https://builtright-backend.onrender.com/api/admin/upload-image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: uploadData,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
          throw new Error(data.message || "Image upload failed.");
        }

        uploadedUrls.push(data.imageUrl);
      }

      setFormData((prev) => {
        const updatedImages = [...prev.images, ...uploadedUrls];

        return {
          ...prev,
          image: updatedImages[0] || "",
          images: updatedImages,
        };
      });

      setMessage("Images uploaded successfully.");
    } catch (error) {
      setMessage(error.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    try {
      setMessage("");

      const features = formData.featuresText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        price: Number(formData.price || 0),
        image: formData.images?.[0] || formData.image || "",
        images: formData.images || [],
        features,
        supplierSlug: formData.supplierSlug || slugify(formData.supplier),
        categorySlug: formData.categorySlug || slugify(formData.category),
        brandSlug: formData.brandSlug || slugify(formData.brand),
        manufacturerSlug:
          formData.manufacturerSlug || slugify(formData.manufacturer),
      };

      delete payload.featuresText;

      const url = editingProduct
        ? `https://builtright-backend.onrender.com/api/admin/products/${editingProduct._id}`
        : "https://builtright-backend.onrender.com/api/admin/products";

      const method = editingProduct ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to save product.");
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === editingProduct._id ? data.product : item
          )
        );
        setMessage("Product updated successfully.");
      } else {
        setProducts((prev) => [data.product, ...prev]);
        setMessage("Product added successfully.");
      }

      closeModal();
    } catch (error) {
      setMessage(error.message || "Failed to save product.");
    }
  };

  const suppliers = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((item) => item.supplier).filter(Boolean)),
    ];
  }, [products]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((item) => item.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (supplierFilter !== "All") {
      result = result.filter((item) => item.supplier === supplierFilter);
    }

    if (categoryFilter !== "All") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.supplier?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search) ||
          item.manufacturer?.toLowerCase().includes(search) ||
          item.category?.toLowerCase().includes(search) ||
          item.capacity?.toLowerCase().includes(search)
      );
    }

    return result;
  }, [products, supplierFilter, categoryFilter, searchTerm]);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://builtright-backend.onrender.com/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((prev) => prev.filter((item) => item._id !== productId));
      setMessage("Product deleted successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to delete product.");
    }
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage BuiltRight marketplace inventory, suppliers, categories, pricing, and stock."
    >
      <div className="admin-products-toolbar">
        <div>
          <p>Product Management</p>
          <h2>Marketplace Inventory</h2>
        </div>

        <button type="button" className="admin-add-btn" onClick={openAddModal}>
          Add Product
        </button>
      </div>

      <section className="admin-product-filters">
        <input
          type="text"
          placeholder="Search product, brand, manufacturer, supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          {suppliers.map((supplier) => (
            <option key={supplier} value={supplier}>
              {supplier}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </section>

      {message && <p className="admin-product-message">{message}</p>}

      <section className="admin-products-panel">
        <div className="admin-products-panel-head">
          <h2>{filteredProducts.length} Products</h2>
        </div>

        {loading ? (
          <div className="admin-empty-box">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="admin-empty-box">No products found.</div>
        ) : (
          <div className="admin-products-table-wrap">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th>Capacity</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="admin-product-thumb"
                          />
                        )}

                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td>{product.supplier}</td>
                    <td>{product.manufacturer || product.brand || "N/A"}</td>
                    <td>{product.category}</td>
                    <td>{product.capacity || "N/A"}</td>
                    <td>₦{Number(product.price || 0).toLocaleString()}</td>

                    <td>
                      <span
                        className={
                          product.inStock ? "stock-badge in" : "stock-badge out"
                        }
                      >
                        {product.inStock ? "In Stock" : "Out"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-product-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <div className="admin-product-modal-backdrop">
          <div className="admin-product-modal">
            <div className="admin-product-modal-head">
              <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

              <button type="button" onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-product-form">
              <input
                type="text"
                name="name"
                placeholder="Product Name*"
                value={formData.name}
                onChange={handleFormChange}
                required
              />

              <div className="admin-form-row">
                <input
                  type="number"
                  name="price"
                  placeholder="Price*"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                />

                <input
                  type="text"
                  name="capacity"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={handleFormChange}
                />
              </div>

              <div className="admin-form-row">
                <input
                  type="text"
                  name="supplier"
                  placeholder="Supplier*"
                  value={formData.supplier}
                  onChange={handleFormChange}
                  required
                />

                <input
                  type="text"
                  name="brand"
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={handleFormChange}
                />
              </div>

              <div className="admin-form-row">
                <input
                  type="text"
                  name="manufacturer"
                  placeholder="Manufacturer"
                  value={formData.manufacturer}
                  onChange={handleFormChange}
                />

                <input
                  type="text"
                  name="category"
                  placeholder="Category*"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={formData.image}
                onChange={handleFormChange}
              />

              <div className="admin-image-upload-box">
                <label className="admin-image-upload-label">
                  <span>
                    {uploadingImage
                      ? "Uploading images..."
                      : "Upload Product Images"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>

                {formData.images?.length > 0 && (
                  <div className="admin-multi-image-preview">
                    {formData.images.map((img, index) => (
                      <div className="admin-preview-image-card" key={img || index}>
                        <img src={img} alt={`Preview ${index + 1}`} />

                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages = formData.images.filter(
                              (_, i) => i !== index
                            );

                            setFormData((prev) => ({
                              ...prev,
                              image: updatedImages[0] || "",
                              images: updatedImages,
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                name="description"
                placeholder="Product Description"
                rows="4"
                value={formData.description}
                onChange={handleFormChange}
              />

              <textarea
                name="featuresText"
                placeholder="Features - one per line"
                rows="4"
                value={formData.featuresText}
                onChange={handleFormChange}
              />

              <div className="admin-form-section-title">
                Product Specifications
              </div>

              <div className="admin-form-row">
                <input
                  type="text"
                  name="voltage"
                  placeholder="Voltage e.g. 48V"
                  value={formData.specifications.voltage}
                  onChange={handleSpecificationChange}
                />

                <input
                  type="text"
                  name="batteryType"
                  placeholder="Battery Type e.g. Lithium"
                  value={formData.specifications.batteryType}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div className="admin-form-row">
                <input
                  type="text"
                  name="inverterType"
                  placeholder="Inverter Type e.g. Hybrid"
                  value={formData.specifications.inverterType}
                  onChange={handleSpecificationChange}
                />

                <input
                  type="text"
                  name="warranty"
                  placeholder="Warranty e.g. 2 Years"
                  value={formData.specifications.warranty}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div className="admin-form-row">
                <input
                  type="text"
                  name="phase"
                  placeholder="Phase e.g. Single Phase"
                  value={formData.specifications.phase}
                  onChange={handleSpecificationChange}
                />

                <input
                  type="text"
                  name="outputPower"
                  placeholder="Output Power e.g. 5kW"
                  value={formData.specifications.outputPower}
                  onChange={handleSpecificationChange}
                />
              </div>

              <label className="admin-stock-check">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleFormChange}
                />
                <span>Product is in stock</span>
              </label>

              <button
                type="submit"
                className="admin-save-product-btn"
                disabled={uploadingImage}
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;