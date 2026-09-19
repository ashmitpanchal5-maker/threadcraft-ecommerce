import React, { useState } from "react";

const FALLBACK_PRODUCTS = [
  {
    _id: "demo1",
    name: "Oversized Acid Wash Tee",
    category: "T-Shirts",
    price: 999,
    originalPrice: 1499,
    stock: 15,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    description: "Heavyweight 240 GSM combed cotton vintage streetwear acid-wash drop."
  },
  {
    _id: "demo2",
    name: "Cyberpunk Tactical Cargo Pants",
    category: "Bottoms",
    price: 1899,
    originalPrice: 2499,
    stock: 8,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=60",
    description: "Multi-pocket durable nylon techwear bottoms with adjustable straps."
  },
  {
    _id: "demo3",
    name: "Matrix Utility Bomber",
    category: "Jackets",
    price: 2499,
    originalPrice: 3999,
    stock: 5,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
    description: "Water-resistant matte black shell jacket with reflective typography."
  },
  {
    _id: "demo4",
    name: "Midnight Heavyweight Pullover",
    category: "Hoodies",
    price: 1599,
    originalPrice: 2199,
    stock: 12,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
    description: "400 GSM fleece lined hoodie with drop shoulder tailored silhouette."
  }
];

export default function App() {
  const [products] = useState(FALLBACK_PRODUCTS);
  const [category, setCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);

  const categories = ["All", "T-Shirts", "Jackets", "Bottoms", "Hoodies"];

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((item) => item.category === category);

  return (
    <div style={{ backgroundColor: "#0b0f19", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif" }}>
      {/* Top Banner */}
      <div style={{ backgroundColor: "#6366f1", textAlign: "center", padding: "8px", fontSize: "14px", fontWeight: "bold" }}>
        ⚡ EXCLUSIVE DROP: Apply coupon THREAD40 for Flat 40% OFF!
      </div>

      {/* Navbar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", borderBottom: "1px solid #1f293d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "#8b5cf6", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>T</div>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "2px", margin: 0 }}>THREAD CRAFT</h1>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ background: "#1f293d", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}>Wishlist (0)</button>
          <button style={{ background: "#1f293d", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "20px", cursor: "pointer" }}>My Orders (0)</button>
          <button style={{ background: "#6366f1", border: "none", color: "#fff", padding: "8px 18px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      {/* Catalog Title & Category Filters */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ color: "#818cf8", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Connected Catalog</span>
            <h2 style={{ fontSize: "28px", fontWeight: "bold", margin: "6px 0 0 0" }}>Live Streetwear Catalog</h2>
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "10px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: category === cat ? "#6366f1" : "#1f293d",
                  color: "#fff",
                  transition: "0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "25px" }}>
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              style={{
                backgroundColor: "#131b2e",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid #1f293d",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "240px", objectFit: "cover" }} />
              
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ color: "#818cf8", fontSize: "12px", fontWeight: "600" }}>{p.category}</span>
                    <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "bold" }}>★ {p.rating}</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>{p.name}</h3>
                  <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 16px 0", lineHeight: "1.4" }}>{p.description}</p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#38bdf8" }}>₹{p.price}</span>
                    <span style={{ fontSize: "13px", color: "#6b7280", textDecoration: "line-through" }}>₹{p.originalPrice}</span>
                  </div>
                  <button
                    onClick={() => setCartCount((prev) => prev + 1)}
                    style={{
                      width: "100%",
                      backgroundColor: "#6366f1",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}