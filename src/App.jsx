const fetchProducts = async () => {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error("API offline");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setProducts(data);
      return;
    }
    throw new Error("No data");
  } catch (err) {
    console.log("Using fallback catalog data");
    // Fallback data jab backend live connect na ho
    setProducts(INITIAL_PRODUCTS);
  }
};