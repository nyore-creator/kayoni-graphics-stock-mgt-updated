// frontend/src/components/ItemForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ItemSelector from './ItemSelector';

export default function ItemForm({ onItemAdded }) {
  const [form, setForm] = useState({
    name: '',
    type: 'purchase', // 'purchase' or 'sale'
    quantity: 0,
    unitPriceKsh: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/items`, form);
      if (onItemAdded) onItemAdded(res.data);
      setForm({ name: '', type: 'purchase', quantity: 0, unitPriceKsh: 0 });
    } catch (err) {
      console.error('Failed to add item:', err);
      setError('❌ Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">➕ Add Item Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <ItemSelector
          onSelect={(item) => setForm({ ...form, name: item.name })}
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-2 border rounded"
        >
          <option value="purchase">Purchase</option>
          <option value="sale">Sale</option>
        </select>
        <input
          type="number"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
          placeholder="Quantity"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={form.unitPriceKsh}
          onChange={(e) => setForm({ ...form, unitPriceKsh: Number(e.target.value) })}
          placeholder="Unit Price (Ksh)"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '⏳ Saving...' : 'Save Transaction'}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}
