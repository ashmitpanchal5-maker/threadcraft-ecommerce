import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const RAZORPAY_KEY = "rzp_test_TdD4Kz2sXwlqfE";
const ADMIN_SECRET = "admin123";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Olive Casual Shirt",
    category: "Shirts",
    bestFor: "Warm",
    color: "Olive Green",
    price: 1299,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80"
  },
  {
    id: 2,
    name: "Pastel Lavender Polo",
    category: "T-Shirts",
    bestFor: "Cool",
    color: "Lavender",
    price: 899,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80"
  },
  {
    id: 3,
    name: "Warm Rust Linen Kurta",
    category: "Ethnic",
    bestFor: "Warm",
    color: "Rust Orange",
    price: 1899,
    sizes: ["M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80"
  },
  {
    id: 4,
    name: "Royal Navy Blue Blazer",
    category: "Formal",
    bestFor: "Cool",
    color: "Navy Blue",
    price: 3499,
    sizes: ["38", "40", "42", "44"],
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80"
  },
  {
    id: 5,
    name: "Mustard Cotton Oversized Tee",
    category: "Streetwear",
    bestFor: "Warm",
    color: "Mustard Yellow",
    price: 799,
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80"
  },
  {
    id: 6,
    name: "Minimalist Cool Grey Hoodie",
    category: "Winterwear",
    bestFor: "Cool",
    color: "Slate Grey",
    price: 1599,
    sizes: ["M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"
  }
];

export default function App() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_products");
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState({});
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(5000);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // User Auth State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  // Admin State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminTab, setAdminTab] = useState("products");
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    category: "Shirts",
    bestFor: "Warm",
    price: "",
    sizes: "S, M, L, XL",
    image: ""
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem("threadcraft_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("threadcraft_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("threadcraft_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("threadcraft_orders", JSON.stringify(orders));
  }, [orders]);

  // AI Stylist Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiFilterTone, setAiFilterTone] = useState("All");

  const webcamRef = useRef(null);

  // Admin Actions
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_SECRET) {
      setIsAdminLoggedIn(true);
      showToast("🛡️ Admin Login Successful!");
      setAdminPasswordInput("");
    } else {
      showToast("❌ Galat Password! (Try: admin123)");
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price || !newProductForm.image) {
      showToast("⚠️ Kripya details bharein!");
      return;
    }

    const newProd = {
      id: Date.now(),
      name: newProductForm.name,
      category: newProductForm.category,
      bestFor: newProductForm.bestFor,
      price: Number(newProductForm.price),
      sizes: newProductForm.sizes ? newProductForm.sizes.split(",").map((s) => s.trim()) : ["M", "L"],
      image: newProductForm.image
    };

    setProducts((prev) => [newProd, ...prev]);
    showToast(`✅ "${newProd.name}" add ho gaya!`);
    setNewProductForm({ name: "", category: "Shirts", bestFor: "Warm", price: "", sizes: "S, M, L, XL", image: "" });
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("🗑️ Product delete ho gaya.");
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    showToast(`Status updated to "${newStatus}"!`);
  };

  // Auth Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: authMode === "signup" ? authForm.name || "Customer" : authForm.email.split("@")[0],
      email: authForm.email
    };
    setCurrentUser(userData);
    localStorage.setItem("threadcraft_user", JSON.stringify(userData));
    setIsAuthModalOpen(false);
    showToast(`🎉 Welcome, ${userData.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("threadcraft_user");
    showToast("Aap log out ho chuke hain.");
  };

  // AI Tone Analysis
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsCameraActive(false);
        runAIAnalysis(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setIsCameraActive(false);
        runAIAnalysis(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = (imgSrc) => {
    setAnalyzing(true);
    setAnalysisResult(null);

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 25, 25, 50, 50, 0, 0, 100, 100);

      const frame = ctx.getImageData(0, 0, 100, 100);
      let r = 0, g = 0, b = 0;
      const count = frame.data.length / 4;

      for (let i = 0; i < frame.data.length; i += 4) {
        r += frame.data[i];
        g += frame.data[i + 1];
        b += frame.data[i + 2];
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      const isWarm = r > b;
      const undertone = isWarm ? "Warm" : "Cool";

      setTimeout(() => {
        setAnalyzing(false);
        setAnalysisResult({
          undertone,
          palette: isWarm ? "Olive, Mustard, Rust, Brown" : "Navy, Lavender, Slate Grey, Pastels",
          description: isWarm
            ? "Aapke skin profile par warm aur golden-earthy tones standout karenge."
            : "Aapke skin profile par cool tones, navy aur pastel shades best dikhenge."
        });
        setAiFilterTone(undertone);
        showToast(`✨ ${undertone} Tone matching clothes filtered!`);
      }, 900);
    };
  };

  // Cart operations
  const addToCart = (product) => {
    const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ["Free Size"];
    const chosenSize = selectedSizes[product.id] || sizesList[0];
    const cartItemId = `${product.id}-${chosenSize}`;

    setCart((prev) => {
      const exists = prev.find((item) => item.cartItemId === cartItemId);
      if (exists) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, cartItemId, selectedSize: chosenSize, qty: 1 }];
    });
    showToast(`🛒 ${product.name} (${chosenSize}) added to bag!`);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.cartItemId === cartItemId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast("Item cart se remove kar diya.");
  };

  const toggleWishlist = (product) => {
    const inWish = wishlist.some((w) => w.id === product.id);
    if (inWish) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast("Item wishlist se remove ho gaya.");
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast("❤️ Wishlist me add ho gaya!");
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0);

  // Detailed Order Placement
  const handleCheckout = () => {
    if (cart.length === 0) return;
    const mockPayId = "PAY_RZP_" + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: "TC-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: cart.map((item) => ({ ...item })),
      total: cartTotal,
      customer: currentUser ? currentUser.name : "Guest Shopper",
      paymentId: mockPayId,
      status: "Processing"
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCartOpen(false);
    setIsOrdersOpen(true);
    showToast(`✅ Order Success! Order #${newOrder.id}`);
  };

  // Safe Filter & Sort
  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesTone = aiFilterTone === "All" || p.bestFor === aiFilterTone;
      const matchesPrice = (p.price || 0) <= maxPrice;
      return matchesSearch && matchesCat && matchesTone && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === "low-to-high") return (a.price || 0) - (b.price || 0);
      if (sortBy === "high-to-low") return (b.price || 0) - (a.price || 0);
      return (a.id || 0) - (b.id || 0);
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#1e293b", color: "#38bdf8", border: "1px solid #38bdf8", padding: "10px 18px", borderRadius: "8px", zIndex: 999, fontWeight: "600" }}>
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid #1e293b", background: "#0b1120", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.6rem" }}>✨</span>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>ThreadCraft</h1>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: "320px", margin: "0 16px" }}>
          <input
            type="text"
            placeholder="Search clothes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "7px 14px", borderRadius: "20px", border: "1px solid #334155", background: "#1e293b", color: "#fff", outline: "none", fontSize: "0.85rem" }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => { setIsModalOpen(true); setIsCameraActive(true); }}
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "20px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem" }}
          >
            📷 AI Stylist
          </button>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            style={{ background: isAdminLoggedIn ? "#059669" : "#334155", color: "#fff", border: "none", padding: "7px 12px", borderRadius: "18px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
          >
            🛡️ Admin {isAdminLoggedIn && "✓"}
          </button>

          <button
            onClick={() => setIsOrdersOpen(true)}
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "7px 12px", borderRadius: "18px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            📦 Orders ({orders.length})
          </button>

          <button
            onClick={() => showToast(`❤️ Wishlist me ${wishlist.length} items hain!`)}
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#fff", padding: "7px 12px", borderRadius: "18px", cursor: "pointer" }}
          >
            ❤️ {wishlist.length}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            style={{ background: "#2563eb", border: "none", color: "#fff", padding: "7px 14px", borderRadius: "18px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
          >
            🛒 ({cart.reduce((s, i) => s + (i.qty || 1), 0)})
          </button>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1e293b", padding: "5px 10px", borderRadius: "18px", border: "1px solid #334155", fontSize: "0.85rem" }}>
              <span style={{ color: "#38bdf8", fontWeight: "600" }}>👤 {currentUser.name}</span>
              <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>Logout</button>
            </div>
          ) : (
            <button
              onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
              style={{ background: "#334155", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "18px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
            >
              👤 Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px" }}>
        {/* Category Pills & Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {["All", "Shirts", "T-Shirts", "Ethnic", "Formal", "Streetwear", "Winterwear"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ padding: "7px 14px", borderRadius: "18px", border: "none", background: selectedCategory === cat ? "#3b82f6" : "#1e293b", color: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#1e293b", padding: "7px 14px", borderRadius: "12px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}>
              <span>Max: <strong>₹{maxPrice}</strong></span>
              <input type="range" min="700" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} style={{ cursor: "pointer" }} />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ background: "#0f172a", color: "#fff", border: "1px solid #334155", borderRadius: "6px", padding: "4px 8px", fontSize: "0.85rem" }}>
              <option value="featured">Featured</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* AI Tone Banner */}
        {aiFilterTone !== "All" && analysisResult && (
          <div style={{ background: "#064e3b", border: "1px solid #059669", padding: "12px 18px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ color: "#34d399" }}>AI Tone Active:</strong> Showing outfits matching <strong>{analysisResult.undertone} Tone</strong>.
              <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "#cbd5e1" }}>({analysisResult.palette})</span>
            </div>
            <button onClick={() => { setAiFilterTone("All"); setAnalysisResult(null); }} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}>
              Show All
            </button>
          </div>
        )}

        {/* Product Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "22px" }}>
          {filteredProducts.map((p) => {
            const sizesList = p.sizes && p.sizes.length > 0 ? p.sizes : ["Free Size"];
            const currentSelectedSize = selectedSizes[p.id] || sizesList[0];
            return (
              <div key={p.id} style={{ background: "#1e293b", borderRadius: "14px", overflow: "hidden", border: "1px solid #334155", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: "260px" }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => toggleWishlist(p)} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer" }}>
                    {wishlist.some((w) => w.id === p.id) ? "❤️" : "🤍"}
                  </button>
                  <span style={{ position: "absolute", bottom: "8px", left: "8px", background: "#0f172a", color: "#93c5fd", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "600" }}>
                    {p.bestFor} Tone
                  </span>
                </div>

                <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{p.category}</span>
                    <h3 style={{ margin: "4px 0", fontSize: "1rem", color: "#f8fafc" }}>{p.name}</h3>
                    <p style={{ margin: "0 0 10px", fontSize: "1.05rem", fontWeight: "700", color: "#38bdf8" }}>₹{p.price}</p>

                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Select Size:</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {sizesList.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: sz }))}
                            style={{ padding: "4px 8px", borderRadius: "4px", border: currentSelectedSize === sz ? "1px solid #38bdf8" : "1px solid #475569", background: currentSelectedSize === sz ? "#0284c7" : "#0f172a", color: "#fff", fontSize: "0.75rem", cursor: "pointer" }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => addToCart(p)} style={{ width: "100%", padding: "9px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600" }}>
                    Add to Bag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* DETAILED ORDERS TRACKING MODAL */}
      {isOrdersOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 250, display: "flex", justifyContent: "center", alignItems: "center", padding: "16px" }}>
          <div style={{ background: "#1e293b", borderRadius: "16px", padding: "24px", maxWidth: "620px", width: "100%", maxHeight: "85vh", overflowY: "auto", border: "1px solid #334155", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
            <button
              onClick={() => setIsOrdersOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.4rem", cursor: "pointer" }}
            >
              ✕
            </button>
            <h3 style={{ margin: "0 0 4px", fontSize: "1.35rem", display: "flex", alignItems: "center", gap: "8px" }}>
              📦 My Orders & Tracking ({orders.length})
            </h3>
            <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: "0.85rem" }}>
              Track order progress, item details, size selection and delivery status.
            </p>

            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                <p style={{ fontSize: "1.1rem", margin: 0 }}>Abhi tak koi order place nahi hua hai.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
                  >
                    {/* Order Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1e293b", paddingBottom: "12px" }}>
                      <div>
                        <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#38bdf8" }}>
                          Order #{order.id}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                          Placed on: <span style={{ color: "#e2e8f0" }}>{order.date || "Recent"}</span>
                          {order.customer && <span> • For: <strong style={{ color: "#e2e8f0" }}>{order.customer}</strong></span>}
                        </div>
                        {order.paymentId && (
                          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                            Payment ID: {order.paymentId}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.15rem", fontWeight: "800", color: "#34d399" }}>
                          ₹{order.total}
                        </div>
                        <span style={{
                          display: "inline-block",
                          marginTop: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          background: order.status === "Delivered" ? "rgba(16, 185, 129, 0.2)" : "rgba(251, 191, 36, 0.2)",
                          color: order.status === "Delivered" ? "#34d399" : "#fbbf24",
                          border: `1px solid ${order.status === "Delivered" ? "#059669" : "#d97706"}`
                        }}>
                          ● {order.status || "Processing"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Step Bar */}
                    <div style={{ background: "#1e293b", padding: "10px 14px", borderRadius: "8px", fontSize: "0.78rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "6px" }}>
                        <span style={{ color: "#34d399", fontWeight: "600" }}>✓ Placed</span>
                        <span style={{ color: order.status !== "Processing" ? "#34d399" : "#94a3b8" }}>
                          {order.status !== "Processing" ? "✓ Dispatched" : "○ Dispatched"}
                        </span>
                        <span style={{ color: order.status === "Delivered" ? "#34d399" : "#94a3b8" }}>
                          {order.status === "Delivered" ? "✓ Delivered" : "○ Out for Delivery"}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "4px", background: "#334155", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: order.status === "Delivered" ? "100%" : (order.status === "Packed & Dispatched" || order.status === "Out for Delivery") ? "65%" : "30%",
                          background: "#10b981",
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600" }}>Items in this order:</span>
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{ display: "flex", alignItems: "center", gap: "12px", background: "#1e293b", padding: "8px 12px", borderRadius: "8px", border: "1px solid #334155" }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "#f8fafc" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                                Size: <span style={{ color: "#38bdf8", fontWeight: "600" }}>{item.selectedSize || "Standard"}</span> • Qty: <strong>{item.qty || 1}</strong>
                              </div>
                            </div>
                            <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>
                              ₹{(item.price || 0) * (item.qty || 1)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>Item details unavailable for legacy order.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {isAdminModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 350, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#1e293b", borderRadius: "14px", padding: "22px", maxWidth: "660px", width: "92%", maxHeight: "85vh", overflowY: "auto", border: "1px solid #334155", position: "relative" }}>
            <button onClick={() => setIsAdminModalOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.3rem", cursor: "pointer" }}>✕</button>

            {!isAdminLoggedIn ? (
              <div>
                <h3 style={{ margin: "0 0 10px" }}>🛡️ Admin Login</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "14px" }}>Enter admin password to manage products and update order tracking status.</p>
                <form onSubmit={handleAdminLogin} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="password"
                    placeholder="Enter password (admin123)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
                  />
                  <button type="submit" style={{ padding: "8px 14px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>Unlock</button>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "10px", marginBottom: "14px" }}>
                  <h3 style={{ margin: 0, color: "#34d399" }}>🛡️ Store Admin Dashboard</h3>
                  <button onClick={() => setIsAdminLoggedIn(false)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>Lock Admin</button>
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <button onClick={() => setAdminTab("products")} style={{ padding: "6px 12px", background: adminTab === "products" ? "#2563eb" : "#0f172a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>📦 Products ({products.length})</button>
                  <button onClick={() => setAdminTab("orders")} style={{ padding: "6px 12px", background: adminTab === "orders" ? "#2563eb" : "#0f172a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>📋 Orders ({orders.length})</button>
                </div>

                {adminTab === "products" ? (
                  <div>
                    <form onSubmit={handleAddProduct} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px", background: "#0f172a", padding: "12px", borderRadius: "8px" }}>
                      <input type="text" placeholder="Title" required value={newProductForm.name} onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })} style={{ padding: "7px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                      <input type="number" placeholder="Price (₹)" required value={newProductForm.price} onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })} style={{ padding: "7px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                      <input type="text" placeholder="Image Link" required value={newProductForm.image} onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })} style={{ gridColumn: "span 2", padding: "7px", background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px" }} />
                      <button type="submit" style={{ gridColumn: "span 2", padding: "9px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}>Save & Add to Catalog</button>
                    </form>
                    {products.map((p) => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#0f172a", marginBottom: "6px", borderRadius: "6px" }}>
                        <span>{p.name} - ₹{p.price}</span>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {orders.length === 0 ? <p style={{ color: "#94a3b8" }}>No customer orders placed yet.</p> : orders.map((o) => (
                      <div key={o.id} style={{ padding: "12px", background: "#0f172a", marginBottom: "10px", borderRadius: "8px", border: "1px solid #334155" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div><strong>Order #{o.id}</strong> - ₹{o.total}</div>
                          <span style={{ color: "#38bdf8", fontSize: "0.8rem" }}>{o.date}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                          <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>Change Status:</span>
                          <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: "4px", padding: "4px 8px", fontSize: "0.8rem" }}>
                            <option>Processing</option>
                            <option>Packed & Dispatched</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 150, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: "360px", background: "#0f172a", height: "100%", padding: "18px", boxSizing: "border-box", display: "flex", flexDirection: "column", borderLeft: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Your Bag ({cart.length})</h3>
              <button onClick={() => setIsCartOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
              {cart.length === 0 ? (
                <p style={{ color: "#94a3b8", textAlign: "center", marginTop: "30px" }}>Bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: "flex", gap: "8px", marginBottom: "10px", background: "#1e293b", padding: "8px", borderRadius: "6px" }}>
                    <img src={item.image} alt={item.name} style={{ width: "45px", height: "45px", borderRadius: "4px", objectFit: "cover" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Size: {item.selectedSize}</div>
                      <div style={{ color: "#38bdf8", fontWeight: "bold", fontSize: "0.85rem" }}>₹{item.price} × {item.qty}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem" }}>✕</button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={handleCheckout} style={{ width: "100%", padding: "11px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                Pay via Razorpay (₹{cartTotal})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", maxWidth: "340px", width: "90%", position: "relative" }}>
            <button onClick={() => setIsAuthModalOpen(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>✕</button>
            <h3 style={{ margin: "0 0 12px" }}>{authMode === "login" ? "Login" : "Sign Up"}</h3>
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {authMode === "signup" && (
                <input type="text" placeholder="Name" required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} style={{ padding: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "6px" }} />
              )}
              <input type="email" placeholder="Email" required value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={{ padding: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "6px" }} />
              <input type="password" placeholder="Password" required value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} style={{ padding: "8px", background: "#0f172a", border: "1px solid #334155", color: "#fff", borderRadius: "6px" }} />
              <button type="submit" style={{ padding: "8px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>{authMode === "login" ? "Login" : "Register"}</button>
            </form>
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "0.8rem", color: "#94a3b8" }}>
              {authMode === "login" ? (
                <button onClick={() => setAuthMode("signup")} style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer" }}>Create account</button>
              ) : (
                <button onClick={() => setAuthMode("login")} style={{ background: "transparent", border: "none", color: "#38bdf8", cursor: "pointer" }}>Already have account?</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Stylist Camera */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#1e293b", borderRadius: "14px", padding: "20px", maxWidth: "420px", width: "90%", position: "relative" }}>
            <button onClick={() => { setIsModalOpen(false); setIsCameraActive(false); }} style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>✕</button>
            <h3 style={{ margin: "0 0 6px" }}>AI Stylist Match</h3>
            <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "#94a3b8" }}>Capture live photo or upload to detect your skin undertone.</p>

            {isCameraActive && !capturedImage && (
              <div>
                <div style={{ borderRadius: "8px", overflow: "hidden", background: "#000" }}>
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: "user" }} style={{ width: "100%", display: "block" }} />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "center" }}>
                  <button onClick={capturePhoto} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>📸 Capture</button>
                  <label style={{ background: "#475569", color: "#fff", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                    📁 Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            )}

            {capturedImage && (
              <div style={{ textAlign: "center" }}>
                <img src={capturedImage} alt="Captured" style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #3b82f6" }} />
                {analyzing ? (
                  <p style={{ color: "#38bdf8", fontWeight: "600", marginTop: "10px" }}>Analyzing tone...</p>
                ) : (
                  analysisResult && (
                    <div style={{ marginTop: "12px", background: "#0f172a", padding: "10px", borderRadius: "6px", textAlign: "left" }}>
                      <p style={{ margin: "0 0 4px", color: "#38bdf8", fontWeight: "bold" }}>{analysisResult.undertone} Tone</p>
                      <button onClick={() => { setIsModalOpen(false); setIsCameraActive(false); }} style={{ width: "100%", padding: "8px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginTop: "8px" }}>
                        View Outfits
                      </button>
                    </div>
                  )
                )}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => { setCapturedImage(null); setIsCameraActive(true); }} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem" }}>Retake</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}