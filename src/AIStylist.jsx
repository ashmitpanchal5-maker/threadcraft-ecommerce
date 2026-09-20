import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Classic Olive Casual Shirt",
    category: "Shirts",
    bestFor: "Warm",
    color: "Olive Green",
    price: "₹1,299",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80"
  },
  {
    id: 2,
    name: "Pastel Lavender Polo",
    category: "T-Shirts",
    bestFor: "Cool",
    color: "Lavender",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80"
  },
  {
    id: 3,
    name: "Warm Rust Linen Kurta",
    category: "Ethnic",
    bestFor: "Warm",
    color: "Rust Orange",
    price: "₹1,899",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80"
  },
  {
    id: 4,
    name: "Royal Navy Blue Blazer",
    category: "Formal",
    bestFor: "Cool",
    color: "Navy Blue",
    price: "₹3,499",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80"
  },
  {
    id: 5,
    name: "Mustard Cotton Oversized Tee",
    category: "Streetwear",
    bestFor: "Warm",
    color: "Mustard Yellow",
    price: "₹799",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80"
  },
  {
    id: 6,
    name: "Minimalist Cool Grey Hoodie",
    category: "Winterwear",
    bestFor: "Cool",
    color: "Slate Grey",
    price: "₹1,599",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80"
  }
];

export default function AIStylist() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [filterTone, setFilterTone] = useState("All");

  const webcamRef = useRef(null);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCameraActive(false);
      runAIAnalysis(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
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
          palette: isWarm
            ? "Earthy & Warm tones (Olive, Mustard, Rust, Brown)"
            : "Cool & Vibrant tones (Navy, Lavender, Slate Grey)",
          description: isWarm
            ? "Aapke skin tone par earthy aur warm shades standout karenge."
            : "Aapke skin profile par cool aur contrast shades best suit honge."
        });
        setFilterTone(undertone);
      }, 1000);
    };
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsCameraActive(false);
  };

  const resetFilter = () => {
    setFilterTone("All");
    setAnalysisResult(null);
    setCapturedImage(null);
  };

  const displayedProducts = filterTone === "All" 
    ? ALL_PRODUCTS 
    : ALL_PRODUCTS.filter(item => item.bestFor === filterTone);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Header Bar */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#111827" }}>UrbanThreads</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "0.9rem" }}>Trending Styles & Personal Recommendations</p>
        </div>

        {/* AI Stylist Button */}
        <button
          onClick={() => { setIsModalOpen(true); setIsCameraActive(true); }}
          style={{
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "#fff",
            border: "none",
            padding: "12px 20px",
            borderRadius: "30px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          📷 Try Live AI Stylist
        </button>
      </header>

      {/* Filter Status Badge */}
      {filterTone !== "All" && analysisResult && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 18px", borderRadius: "10px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong style={{ color: "#166534" }}>AI Match Active:</strong> Showing collections matching your <strong>{analysisResult.undertone} Tone</strong>.
          </div>
          <button 
            onClick={resetFilter}
            style={{ background: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}

      {/* Main Clothes Grid */}
      <h2 style={{ fontSize: "1.3rem", color: "#1f2937", marginBottom: "16px" }}>
        {filterTone === "All" ? "Featured Collection" : `Recommended Outfits (${displayedProducts.length})`}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "24px" }}>
        {displayedProducts.map((item) => (
          <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <img src={item.image} alt={item.name} style={{ width: "100%", height: "260px", objectFit: "cover" }} />
            <div style={{ padding: "14px" }}>
              <span style={{ fontSize: "0.75rem", background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: "8px", fontWeight: "600" }}>
                {item.category}
              </span>
              <h3 style={{ margin: "10px 0 6px", fontSize: "1rem", color: "#111827" }}>{item.name}</h3>
              <p style={{ margin: "0 0 12px", fontWeight: "bold", color: "#111827" }}>{item.price}</p>
              <button style={{ width: "100%", padding: "9px", background: "#111827", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Camera / Upload Modal (Pop-up) */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", maxWidth: "500px", width: "90%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            
            <button 
              onClick={closeModal}
              style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#6b7280" }}
            >
              ✖
            </button>

            <h3 style={{ margin: "0 0 6px", fontSize: "1.3rem" }}>AI Face & Style Match</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#6b7280" }}>Live photo lijiye taaki aapke complexion ke hisab se clothes recommend ho sakein.</p>

            {isCameraActive && !capturedImage && (
              <div>
                <div style={{ borderRadius: "12px", overflow: "hidden", background: "#000", maxWidth: "420px", margin: "0 auto" }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    style={{ width: "100%", display: "block" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "center" }}>
                  <button 
                    onClick={capturePhoto}
                    style={{ background: "#2563eb", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                  >
                    📸 Click Photo
                  </button>
                  <label style={{ background: "#4b5563", color: "#fff", padding: "10px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" }}>
                    📁 Upload
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            )}

            {capturedImage && (
              <div style={{ textAlign: "center" }}>
                <img src={capturedImage} alt="Captured preview" style={{ width: "160px", height: "160px", borderRadius: "50%", objectFit: "cover", border: "3px solid #2563eb" }} />
                
                {analyzing ? (
                  <p style={{ marginTop: "14px", color: "#2563eb", fontWeight: "600" }}>Analyzing tone & matching outfits...</p>
                ) : (
                  analysisResult && (
                    <div style={{ marginTop: "16px", textAlign: "left", background: "#eff6ff", padding: "12px 16px", borderRadius: "10px" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1e40af" }}>Tone: {analysisResult.undertone}</p>
                      <p style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#374151" }}>{analysisResult.description}</p>
                      <button 
                        onClick={closeModal}
                        style={{ width: "100%", padding: "9px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                      >
                        See Recommended Clothes
                      </button>
                    </div>
                  )
                )}

                <div style={{ marginTop: "12px" }}>
                  <button 
                    onClick={() => { setCapturedImage(null); setIsCameraActive(true); }}
                    style={{ background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}