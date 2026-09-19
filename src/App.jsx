import { useState, useEffect } from "react";

const RAZORPAY_KEY = "rzp_test_TdD4Kz2sXwlqfE";
const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pincode & Coupon state
  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Payment state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentOption, setPaymentOption] = useState("razorpay");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  // Auth modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });

  // Admin form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "T-Shirts",
    tag: "NEW DROP",
    stock: 10,
    desc: "",
    image: ""
  });

  // --- MONGODB API CALLS ---
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products from database:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders from database:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem("threadcraft_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("threadcraft_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleWishlist = (product) => {
    const prodId = product._id || product.id;
    setWishlist((prev) => {
      const exists = prev.find((item) => (item._id || item.id) === prodId);
      if (exists) return prev.filter((item) => (item._id || item.id) !== prodId);
      return [...prev, product];
    });
  };

  const isWishlisted = (id) => wishlist.some((item) => (item._id || item.id) === id);

  const checkPincode = (e) => {
    e.preventDefault();
    if (pincodeInput.trim().length === 6 && !isNaN(pincodeInput)) {
      setPincodeStatus({ valid: true, msg: "⚡ Delivery available in 2-3 days | COD Eligible" });
    } else {
      setPincodeStatus({ valid: false, msg: "❌ Please enter a valid 6-digit Indian PIN code." });
    }
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim().toUpperCase() === "THREAD40") {
      setDiscountPercent(40);
      setCouponError("");
    } else {
      setDiscountPercent(0);
      setCouponError("Invalid code. Use 'THREAD40'");
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || !quickViewProduct) return;

    try {
      const prodId = quickViewProduct._id || quickViewProduct.id;
      const res = await fetch(`${API_BASE}/products/${prodId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUser ? currentUser.name : "Anonymous Customer",
          rating: Number(reviewRating),
          comment: reviewComment.trim()
        })
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === prodId ? updatedProduct : p))
        );
        setQuickViewProduct(updatedProduct);
        setReviewComment("");
      }
    } catch (err) {
      alert("Failed to submit review to server.");
    }
  };

  const addToCart = (product, size) => {
    if (product.stock <= 0) {
      alert("Product is currently out of stock!");
      return;
    }
    const prodId = product._id || product.id;
    const cartKey = `${prodId}-${size}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, size, qty: 1, cartKey, id: prodId }];
    });
    setQuickViewProduct(null);
  };

  const updateQty = (cartKey, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartKey === cartKey) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert("Please provide Name, Price, and Image!");
      return;
    }

    try {
      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        originalPrice: Number(newProduct.originalPrice) || Number(newProduct.price) + 500,
        category: newProduct.category,
        rating: "5.0",
        tag: newProduct.tag || "FRESH",
        stock: Number(newProduct.stock) || 10,
        desc: newProduct.desc || "Custom apparel item added from Store Owner Admin Console.",
        image: newProduct.image
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setProducts([saved, ...products]);
        setNewProduct({ name: "", price: "", originalPrice: "", category: "T-Shirts", tag: "NEW DROP", stock: 10, desc: "", image: "" });
        alert("✓ Product saved directly to MongoDB Atlas Cloud Database!");
      }
    } catch (err) {
      alert("Error saving product to backend server.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Permanently delete this product from MongoDB?")) return;

    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setProducts(products.filter((p) => (p._id || p.id) !== productId));
      }
    } catch (err) {
      alert("Failed to delete from database.");
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const rawTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = Math.round((rawTotal * discountPercent) / 100);
  const finalPayable = rawTotal - discountAmount;

  const saveConfirmedOrder = async (methodUsed, txnId = "") => {
    const generatedId = "TC-" + Math.floor(100000 + Math.random() * 900000);
    const orderPayload = {
      orderId: generatedId,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      items: [...cart],
      total: finalPayable,
      paymentMethod: methodUsed,
      transactionId: txnId || "COD-VERIFIED",
      address: { ...shippingAddress },
      status: "Confirmed"
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const savedOrder = await res.json();
        setOrders([savedOrder, ...orders]);
        setLatestOrderId(generatedId);
        setOrderSuccess(true);
        setCart([]);
        localStorage.removeItem("threadcraft_cart");
        fetchProducts(); // Refresh stock counts from database
      }
    } catch (err) {
      alert("Order could not be saved to server.");
    }
  };

  const printInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId || order.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .badge { background: #6366f1; color: white; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background: #f8fafc; }
            .total-section { text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; color: #4338ca;">THREAD CRAFT D2C</h1>
              <p style="margin: 4px 0; color: #64748b;">Official Tax Invoice / Bill of Sale</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">PAID INVOICE</span>
              <p style="margin: 8px 0 0 0;"><b>Invoice ID:</b> #${order.orderId || order.id}</p>
              <p style="margin: 0; color: #64748b;">Date: ${order.date}</p>
            </div>
          </div>

          <div style="margin: 25px 0;">
            <h4 style="margin: 0 0 6px 0;">Customer Delivery Address:</h4>
            <p style="margin: 0; font-weight: bold;">${order.address?.fullName || ""}</p>
            <p style="margin: 2px 0;">${order.address?.address || ""}, ${order.address?.city || ""} - ${order.address?.pincode || ""}</p>
            <p style="margin: 2px 0;">Mobile: ${order.address?.phone || ""}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (it) => `
                <tr>
                  <td>${it.name}</td>
                  <td>${it.size}</td>
                  <td>${it.qty}</td>
                  <td>₹${it.price}</td>
                  <td>₹${it.price * it.qty}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-section">
            <p style="margin: 4px 0;">Payment Method: <b>${order.paymentMethod}</b></p>
            <p style="margin: 4px 0;">Txn Reference: <b>${order.transactionId}</b></p>
            <h2 style="margin: 14px 0; color: #059669;">Final Paid Amount: ₹${order.total}</h2>
          </div>

          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 50px;">Thank you for shopping directly with Thread Craft Streetwear!</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.pincode) {
      alert("Please fill in your delivery address completely!");
      return;
    }

    if (paymentOption === "cod") {
      saveConfirmedOrder("Cash On Delivery (COD)");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay SDK is loading. Please check your internet connection.");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: finalPayable * 100,
      currency: "INR",
      name: "Thread Craft",
      description: "Apparel Order Checkout",
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200",
      handler: function (response) {
        saveConfirmedOrder("RAZORPAY (ONLINE)", response.razorpay_payment_id);
      },
      prefill: {
        name: shippingAddress.fullName,
        email: currentUser ? currentUser.email : "customer@threadcraft.in",
        contact: shippingAddress.phone
      },
      theme: { color: "#6366f1" }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
      {/* Top Banner */}
      <div style={{ background: "linear-gradient(90deg, #6366f1, #a855f7)", color: "#fff", textAlign: "center", padding: "8px 16px", fontSize: "13px", fontWeight: "600" }}>
        ⚡ EXCLUSIVE DROP: Apply coupon <span style={{ textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }} onClick={() => setCouponInput("THREAD40")}>THREAD40</span> for Flat 40% OFF!
      </div>

      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 40px", background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "#fff" }}>T</div>
          <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "2px", background: "linear-gradient(to right, #ffffff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THREAD CRAFT</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setIsWishlistOpen(true)} style={{ background: "rgba(255,255,255,0.06)", color: "#f43f5e", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            ❤️ Wishlist ({wishlist.length})
          </button>
          <button onClick={() => setIsOrdersOpen(true)} style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            📦 My Orders ({orders.length})
          </button>
          <button onClick={() => setIsAdminOpen(true)} style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid #6366f1", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}>
            ⚙️ Admin Panel
          </button>

          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.06)", padding: "6px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "13px", fontWeight: "600" }}>👤 {currentUser.name}</span>
              <button onClick={() => { localStorage.removeItem("threadcraft_user"); setCurrentUser(null); }} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", padding: "8px 18px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
              Sign In
            </button>
          )}

          <button onClick={() => setIsCartOpen(true)} style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", padding: "10px 22px", borderRadius: "999px", fontSize: "14px", fontWeight: "700", border: "none", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.5)" }}>
            🛒 Cart ({totalItems})
          </button>
        </div>
      </header>

      {/* Catalog Grid */}
      <main style={{ maxWidth: "1200px", margin: "30px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <span style={{ color: "#6366f1", fontSize: "12px", fontWeight: "800", textTransform: "uppercase" }}>Connected to MongoDB Atlas</span>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "4px 0 0 0" }}>Live Database Catalog</h2>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.04)", padding: "4px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.08)" }}>
              {["All", "T-Shirts", "Jackets", "Bottoms", "Hoodies"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: selectedCategory === cat ? "#6366f1" : "transparent",
                    color: selectedCategory === cat ? "#fff" : "#94a3b8",
                    fontWeight: "600",
                    fontSize: "13px"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search drops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 18px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none", width: "190px", fontSize: "13px" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            Connecting to MongoDB Cloud... ⏳
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
            {filteredProducts.map((product) => {
              const pId = product._id || product.id;
              return (
                <div
                  key={pId}
                  style={{ background: "#1e293b", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", position: "relative" }}
                >
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(6px)", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", color: "#a5b4fc", border: "1px solid rgba(255,255,255,0.1)", zIndex: 2 }}>
                    {product.tag}
                  </div>

                  <div style={{ position: "absolute", bottom: "120px", left: "12px", background: product.stock > 0 ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)", backdropFilter: "blur(6px)", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "800", color: "#fff", zIndex: 2 }}>
                    {product.stock > 0 ? `Stock: ${product.stock} units` : "OUT OF STOCK"}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                    style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(15,23,42,0.7)", border: "none", borderRadius: "50%", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", zIndex: 2 }}
                  >
                    {isWishlisted(pId) ? "❤️" : "🤍"}
                  </button>

                  <div style={{ cursor: "pointer", overflow: "hidden" }} onClick={() => { setSelectedSize("M"); setPincodeStatus(null); setQuickViewProduct(product); }}>
                    <img src={product.image} alt={product.name} style={{ width: "100%", height: "290px", objectFit: "cover" }} />
                  </div>

                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>{product.category}</span>
                        <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "700" }}>★ {product.rating}</span>
                      </div>
                      <h3 style={{ margin: "0 0 10px 0", fontSize: "15px", fontWeight: "700" }}>{product.name}</h3>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
                        <span style={{ fontWeight: "800", fontSize: "19px" }}>₹{product.price}</span>
                        <span style={{ fontSize: "13px", color: "#64748b", textDecoration: "line-through" }}>₹{product.originalPrice}</span>
                      </div>
                    </div>

                    <button
                      disabled={product.stock <= 0}
                      onClick={() => { setSelectedSize("M"); setPincodeStatus(null); setQuickViewProduct(product); }}
                      style={{ width: "100%", padding: "12px", background: product.stock <= 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)", color: product.stock <= 0 ? "#64748b" : "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", fontWeight: "700", cursor: product.stock <= 0 ? "not-allowed" : "pointer", fontSize: "13px" }}
                    >
                      {product.stock > 0 ? "Select Size & Buy →" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* QUICK VIEW & REVIEWS MODAL */}
      {quickViewProduct && (
        <div onClick={() => setQuickViewProduct(null)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", borderRadius: "24px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", overflowX: "hidden", display: "flex", flexWrap: "wrap", position: "relative", border: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => setQuickViewProduct(null)} style={{ position: "absolute", top: "14px", right: "14px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", zIndex: 10 }}>✕</button>
            
            <img src={quickViewProduct.image} alt={quickViewProduct.name} style={{ width: "300px", height: "350px", objectFit: "cover" }} />

            <div style={{ padding: "24px", flex: 1, minWidth: "280px" }}>
              <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "800" }}>{quickViewProduct.category}</span>
              <h2 style={{ margin: "4px 0 8px 0", fontSize: "18px", fontWeight: "800" }}>{quickViewProduct.name}</h2>
              
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
                <span style={{ fontSize: "22px", fontWeight: "900" }}>₹{quickViewProduct.price}</span>
                <span style={{ fontSize: "13px", color: "#64748b", textDecoration: "line-through" }}>₹{quickViewProduct.originalPrice}</span>
                <span style={{ fontSize: "11px", color: quickViewProduct.stock > 0 ? "#10b981" : "#ef4444", fontWeight: "bold" }}>
                  ({quickViewProduct.stock > 0 ? `${quickViewProduct.stock} items left in stock` : "Sold Out"})
                </span>
              </div>

              <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.4", margin: "0 0 12px 0" }}>{quickViewProduct.desc}</p>

              {/* Size Chooser */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Select Apparel Size:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["S", "M", "L", "XL"].map((sz) => (
                    <button key={sz} onClick={() => setSelectedSize(sz)} style={{ width: "36px", height: "36px", borderRadius: "8px", border: selectedSize === sz ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.12)", background: selectedSize === sz ? "#6366f1" : "rgba(255,255,255,0.05)", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pincode Estimator */}
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "4px" }}>📍 Check Delivery Date &amp; COD:</label>
                <form onSubmit={checkPincode} style={{ display: "flex", gap: "6px" }}>
                  <input maxLength={6} placeholder="Enter Pincode" value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                  <button type="submit" style={{ padding: "6px 12px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid #6366f1", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Check</button>
                </form>
                {pincodeStatus && <div style={{ fontSize: "11px", marginTop: "4px", color: pincodeStatus.valid ? "#10b981" : "#ef4444" }}>{pincodeStatus.msg}</div>}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => toggleWishlist(quickViewProduct)} style={{ padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "18px" }}>
                  {isWishlisted(quickViewProduct._id || quickViewProduct.id) ? "❤️" : "🤍"}
                </button>
                <button
                  disabled={quickViewProduct.stock <= 0}
                  onClick={() => addToCart(quickViewProduct, selectedSize)}
                  style={{ flex: 1, padding: "12px", background: quickViewProduct.stock > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", cursor: quickViewProduct.stock > 0 ? "pointer" : "not-allowed" }}
                >
                  {quickViewProduct.stock > 0 ? `Add Size (${selectedSize}) To Bag →` : "Out of Stock"}
                </button>
              </div>

              {/* Reviews Section */}
              <div style={{ marginTop: "24px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>Customer Reviews ({quickViewProduct.reviews ? quickViewProduct.reviews.length : 0})</h4>
                
                <div style={{ maxHeight: "120px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                  {(!quickViewProduct.reviews || quickViewProduct.reviews.length === 0) ? (
                    <span style={{ fontSize: "11px", color: "#64748b" }}>No customer reviews yet. Be the first to review!</span>
                  ) : (
                    quickViewProduct.reviews.map((rev, idx) => (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", fontSize: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                          <span>{rev.user}</span>
                          <span style={{ color: "#f59e0b" }}>★ {rev.rating}</span>
                        </div>
                        <div style={{ color: "#94a3b8", marginTop: "2px" }}>{rev.comment}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Review Form */}
                <form onSubmit={handleAddReview} style={{ display: "flex", gap: "6px" }}>
                  <select value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} style={{ padding: "6px", background: "#1e293b", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", fontSize: "11px" }}>
                    <option value={5}>★ 5</option>
                    <option value={4}>★ 4</option>
                    <option value={3}>★ 3</option>
                  </select>
                  <input required placeholder="Write a short review..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ flex: 1, padding: "6px 10px", background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", fontSize: "11px" }} />
                  <button type="submit" style={{ padding: "6px 12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Post</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN PANEL CONNECTED TO MONGO DATABASE */}
      {isAdminOpen && (
        <div onClick={() => setIsAdminOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10003, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", borderRadius: "24px", width: "100%", maxWidth: "800px", maxHeight: "88vh", overflowY: "auto", padding: "28px", position: "relative", border: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => setIsAdminOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer" }}>✕</button>

            <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "800" }}>⚙️ Store Controller (MongoDB Cloud Active)</h2>

            {/* Add Product Form */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "18px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700" }}>➕ Add New Apparel to Live Catalog</h3>
              <form onSubmit={handleAddProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                <input required placeholder="Product Title" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                <input required type="number" placeholder="Selling Price (₹)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                <input type="number" placeholder="Stock Units" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "#1e293b", color: "#fff", fontSize: "12px" }}>
                  <option>T-Shirts</option>
                  <option>Jackets</option>
                  <option>Bottoms</option>
                  <option>Hoodies</option>
                </select>
                
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", alignItems: "center" }}>
                  <input placeholder="Image URL (or upload from device)" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                  <label style={{ background: "rgba(99,102,241,0.2)", border: "1px solid #6366f1", color: "#a5b4fc", padding: "8px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                    📁 Upload Image
                    <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                  </label>
                </div>

                <button type="submit" style={{ gridColumn: "1 / -1", padding: "10px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                  Publish Product to MongoDB Cloud
                </button>
              </form>
            </div>

            {/* Inventory List with Database Delete */}
            <div style={{ marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700" }}>📦 MongoDB Catalog Inventory ({products.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "180px", overflowY: "auto" }}>
                {products.map((p) => {
                  const pId = p._id || p.id;
                  return (
                    <div key={pId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={p.image} alt={p.name} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>{p.name}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>₹{p.price} | Stock: {p.stock}</span>
                      </div>
                      <button onClick={() => handleDeleteProduct(pId)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                        Delete 🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Orders */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "700" }}>📋 Customer Orders Received ({orders.length})</h3>
              {orders.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "12px" }}>No orders placed in database yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {orders.map((o) => (
                    <div key={o._id || o.orderId} style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ color: "#a5b4fc", fontWeight: "bold", fontSize: "12px" }}>#{o.orderId || o._id}</span> — {o.address?.fullName} ({o.address?.phone})
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{o.address?.city} | Total: ₹{o.total}</div>
                      </div>
                      <button onClick={() => printInvoice(o)} style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid #6366f1", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
                        Print Bill 🖨️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MY ORDERS DRAWER */}
      {isOrdersOpen && (
        <div onClick={() => setIsOrdersOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10002, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", borderRadius: "24px", width: "100%", maxWidth: "600px", maxHeight: "85vh", overflowY: "auto", padding: "28px", position: "relative", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Your Orders</h2>
              <button onClick={() => setIsOrdersOpen(false)} style={{ border: "none", background: "none", color: "#fff", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {orders.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", margin: "40px 0" }}>No orders placed yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {orders.map((ord) => (
                  <div key={ord._id || ord.orderId} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "8px", marginBottom: "10px" }}>
                      <div>
                        <span style={{ fontWeight: "800", color: "#a5b4fc" }}>#{ord.orderId || ord._id}</span>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{ord.date}</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontWeight: "800", fontSize: "15px" }}>₹{ord.total}</span>
                        <button onClick={() => printInvoice(ord)} style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid #10b981", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>
                          Invoice 📄
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {ord.items.map((it) => (
                        <div key={it.cartKey} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img src={it.image} alt={it.name} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />
                          <div style={{ flex: 1, fontSize: "12px" }}>
                            <div>{it.name}</div>
                            <span style={{ color: "#94a3b8", fontSize: "10px" }}>Size: {it.size} | Qty: {it.qty}</span>
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "bold" }}>₹{it.price * it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER */}
      {isWishlistOpen && (
        <div onClick={() => setIsWishlistOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "flex-end", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "380px", background: "#1e293b", height: "100%", padding: "24px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Wishlist ({wishlist.length})</h2>
              <button onClick={() => setIsWishlistOpen(false)} style={{ border: "none", background: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {wishlist.length === 0 ? (
                <p style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>No items saved yet.</p>
              ) : (
                wishlist.map((item) => (
                  <div key={item._id || item.id} style={{ display: "flex", gap: "10px", background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "10px", alignItems: "center" }}>
                    <img src={item.image} alt={item.name} style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: "700" }}>{item.name}</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#a5b4fc" }}>₹{item.price}</div>
                    </div>
                    <button onClick={() => { addToCart(item, "M"); toggleWishlist(item); }} style={{ background: "#6366f1", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Bag</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div onClick={() => setIsCartOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "flex-end", zIndex: 9999 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "400px", background: "#1e293b", height: "100%", padding: "24px", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Shopping Bag ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ border: "none", background: "none", fontSize: "20px", color: "#94a3b8", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ flexGrow: 1, overflowY: "auto" }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>Your bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.cartKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "10px 0" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700" }}>{item.name}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>Size: {item.size} | ₹{item.price}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button onClick={() => updateQty(item.cartKey, -1)} style={{ width: "24px", height: "24px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>-</button>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.cartKey, 1)} style={{ width: "24px", height: "24px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
              <label style={{ fontSize: "11px", fontWeight: "bold", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Promo Code:</label>
              <form onSubmit={applyCoupon} style={{ display: "flex", gap: "6px" }}>
                <input placeholder="THREAD40" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "11px" }} />
                <button type="submit" style={{ padding: "6px 12px", background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid #6366f1", borderRadius: "6px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}>Apply</button>
              </form>
              {discountPercent > 0 && <div style={{ color: "#10b981", fontSize: "11px", marginTop: "4px" }}>✓ 40% OFF applied!</div>}
              {couponError && <div style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px" }}>{couponError}</div>}
            </div>

            {/* Total */}
            <div style={{ paddingTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                <span>Subtotal:</span>
                <span>₹{rawTotal}</span>
              </div>
              {discountPercent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#10b981" }}>
                  <span>Discount:</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "800", margin: "8px 0 14px 0" }}>
                <span>Total:</span>
                <span>₹{finalPayable}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => { setIsCartOpen(false); setIsPaymentOpen(true); }}
                style={{ width: "100%", padding: "12px", background: cart.length === 0 ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", cursor: cart.length === 0 ? "not-allowed" : "pointer" }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAZORPAY / PAYMENT MODAL */}
      {isPaymentOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "#1e293b", borderRadius: "24px", width: "100%", maxWidth: "480px", maxHeight: "90vh", overflowY: "auto", padding: "26px", position: "relative", border: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => { setIsPaymentOpen(false); setOrderSuccess(false); }} style={{ position: "absolute", top: "16px", right: "16px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer" }}>✕</button>

            {orderSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "30px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", border: "1px solid #10b981" }}>✓</div>
                <h2 style={{ fontSize: "20px", margin: "0 0 6px 0", fontWeight: "800" }}>Order Confirmed &amp; Saved!</h2>
                <div style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "bold", marginBottom: "16px" }}>
                  #{latestOrderId}
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "20px" }}>Delivering to {shippingAddress.city} ({shippingAddress.pincode})</p>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => { setIsPaymentOpen(false); setOrderSuccess(false); setIsOrdersOpen(true); }} style={{ flex: 1, padding: "10px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    View &amp; Print Bill 📦
                  </button>
                  <button onClick={() => { setIsPaymentOpen(false); setOrderSuccess(false); }} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit}>
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "bold" }}>CHECKOUT</span>
                  <div style={{ fontSize: "24px", fontWeight: "900" }}>₹{finalPayable}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input required placeholder="Name" value={shippingAddress.fullName} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                    <input required placeholder="Phone" value={shippingAddress.phone} onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                  </div>
                  <input required placeholder="Address" value={shippingAddress.address} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input required placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                    <input required placeholder="Pincode" value={shippingAddress.pincode} onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })} style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "12px" }} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "18px" }}>
                  <div onClick={() => setPaymentOption("razorpay")} style={{ padding: "10px", borderRadius: "8px", border: paymentOption === "razorpay" ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.08)", background: paymentOption === "razorpay" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="radio" checked={paymentOption === "razorpay"} readOnly />
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>⚡ Razorpay Official (UPI / Cards)</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>Google Pay, PhonePe, Cards, NetBanking</div>
                    </div>
                  </div>
                  <div onClick={() => setPaymentOption("cod")} style={{ padding: "10px", borderRadius: "8px", border: paymentOption === "cod" ? "2px solid #6366f1" : "1px solid rgba(255,255,255,0.08)", background: paymentOption === "cod" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="radio" checked={paymentOption === "cod"} readOnly />
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "bold" }}>💵 Cash On Delivery (COD)</div>
                      <div style={{ fontSize: "10px", color: "#94a3b8" }}>Pay upon delivery at your doorstep</div>
                    </div>
                  </div>
                </div>

                <button type="submit" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "800", fontSize: "13px", cursor: "pointer" }}>
                  {paymentOption === "razorpay" ? `Pay ₹${finalPayable} via Razorpay →` : `Confirm COD Order • ₹${finalPayable}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, padding: "20px" }}>
          <div style={{ background: "#1e293b", borderRadius: "20px", width: "100%", maxWidth: "360px", padding: "24px", position: "relative", border: "1px solid rgba(255,255,255,0.12)" }}>
            <button onClick={() => setIsAuthOpen(false)} style={{ position: "absolute", top: "14px", right: "14px", border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer" }}>✕</button>

            <h3 style={{ fontSize: "18px", margin: "0 0 12px 0", fontWeight: "800" }}>{authMode === "login" ? "Account Sign In" : "Join Thread Craft"}</h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              const uData = { name: authMode === "signup" ? authForm.name : authForm.email.split("@")[0], email: authForm.email };
              localStorage.setItem("threadcraft_user", JSON.stringify(uData));
              setCurrentUser(uData);
              setIsAuthOpen(false);
            }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {authMode === "signup" && (
                <input required placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
              )}
              <input required type="email" placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
              <input required type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "#fff" }} />
              <button type="submit" style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                {authMode === "login" ? "Sign In" : "Register"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "14px", fontSize: "12px", color: "#94a3b8" }}>
              <span onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")} style={{ color: "#818cf8", cursor: "pointer", fontWeight: "bold" }}>
                {authMode === "login" ? "New user? Create an account" : "Already registered? Log in"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}