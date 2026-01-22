// frontend/src/components/ItemForm.jsx
import React, { useState } from "react";
import api from "../utils/axiosInstance"; // ✅ use central axios instance
import ItemSelector from "./ItemSelector";

export default function ItemForm({ onItemAdded }) {
  const [mode, setMode] = useState("purchase"); // 'purchase' or 'sale'
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0.01,
    unitCostKsh: "",
    unitPriceKsh: "",
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData((prev) => ({
      ...prev,
      name: item.name,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    const payload = {
      name: formData.name,
      type: mode, // 'purchase' or 'sale'
      quantity: parseFloat(formData.quantity),
      unitCostKsh: mode === "purchase" ? parseFloat(formData.unitCostKsh) : 0,
      unitPriceKsh: mode === "sale" ? parseFloat(formData.unitPriceKsh) : 0,
    };

    try {
      const res = await api.post("/items", payload); // ✅ token auto-attached
      setMessage({
        text: `✅ ${mode === "purchase" ? "Purchase" : "Sale"} recorded!`,
        type: "success",
      });
      if (onItemAdded) onItemAdded(res.data);

      // Reset form
      setSelectedItem(null);
      setFormData({
        name: "",
        quantity: 0.01,
        unitCostKsh: "",
        unitPriceKsh: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "❌ Operation failed";
      setMessage({ text: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        {mode === "purchase" ? "➕ Add Purchase" : "💰 Record Sale"}
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("purchase")}
          className={`px-4 py-2 rounded ${
            mode === "purchase" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Purchase
        </button>
        <button
          type="button"
          onClick={() => setMode("sale")}
          className={`px-4 py-2 rounded ${
            mode === "sale" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
        >
          Sale
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "purchase" ? (
          <div>
            <label className="block mb-1">Item Name (new or existing)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., A4 Paper, T-Shirt, Sticker Roll"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-1">Select Existing Item</label>
            <ItemSelector onSelect={handleSelectItem} />
            {selectedItem && (
              <p className="text-sm text-gray-600 mt-1">
                📦 Current stock: <strong>{selectedItem.currentStock}</strong>
              </p>
            )}
            <input type="hidden" name="name" value={formData.name} required />
          </div>
        )}

        <div>
          <label className="block mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            min="0.01"
            step="0.01"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        {mode === "purchase" ? (
          <div>
            <label className="block mb-1">Unit Cost (Ksh)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="unitCostKsh"
              value={formData.unitCostKsh}
              onChange={handleChange}
              placeholder="Cost per unit"
              required
              className="w-full p-2 border rounded"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-1">Selling Price per Unit (Ksh)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="unitPriceKsh"
              value={formData.unitPriceKsh}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            mode === "purchase" ? "bg-blue-600" : "bg-green-600"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading
            ? "⏳ Processing..."
            : mode === "purchase"
            ? "➕ Add Purchase"
            : "💰 Record Sale"}
        </button>

        {message.text && (
          <div
            className={`p-2 rounded text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
