import React, { useState } from 'react';

export default function AddProduct({ onProductAdded }) {
  const [formData, setFormData] = useState({
    title: '', category: 'Streetwear', price: '', originalPrice: '', image: '', badge: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, price: Number(formData.price), originalPrice: Number(formData.originalPrice) })
      });
      if (res.ok) {
        alert('Product added successfully!');
        setFormData({ title: '', category: 'Streetwear', price: '', originalPrice: '', image: '', badge: '' });
        if (onProductAdded) onProductAdded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Add New Clothing Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Title (e.g. Oversized Tee)" value={formData.title} required className="w-full p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, title: e.target.value})} />
        <input type="text" placeholder="Category" value={formData.category} required className="w-full p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, category: e.target.value})} />
        <div className="flex gap-2">
          <input type="number" placeholder="Price (₹)" value={formData.price} required className="w-1/2 p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, price: e.target.value})} />
          <input type="number" placeholder="Original Price" value={formData.originalPrice} className="w-1/2 p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
        </div>
        <input type="url" placeholder="Image URL" value={formData.image} required className="w-full p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, image: e.target.value})} />
        <input type="text" placeholder="Badge (e.g. NEW DROP)" value={formData.badge} className="w-full p-2 bg-slate-800 rounded border border-slate-700" onChange={e => setFormData({...formData, badge: e.target.value})} />
        <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded font-bold transition">Add Product</button>
      </form>
    </div>
  );
}