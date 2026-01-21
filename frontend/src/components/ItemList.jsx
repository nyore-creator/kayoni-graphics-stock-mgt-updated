import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ItemList({ refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/items`);
        setItems(res.data);
      } catch (err) {
        console.error('Failed to fetch items:', err);
        setError('❌ Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [refreshTrigger, API_BASE_URL]);

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-xl font-bold mb-4">📦 Current Stock & Totals</h2>
      {loading && <p className="text-gray-500">Loading items...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-gray-600">No items recorded yet.</p>
      )}
      {!loading && !error && items.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-right">Stock</th>
              <th className="border p-2 text-right">Bought (Ksh)</th>
              <th className="border p-2 text-right">Sold (Ksh)</th>
              <th className="border p-2 text-right">Profit (Ksh)</th>
              <th className="border p-2 text-right">Last Transaction</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const lastTx = item.transactions[item.transactions.length - 1];
              return (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-right">{item.currentStock}</td>
                  <td className="border p-2 text-right">{item.amountBoughtKsh?.toLocaleString() || 0}</td>
                  <td className="border p-2 text-right">{item.amountSoldKsh?.toLocaleString() || 0}</td>
                  <td className="border p-2 text-right">{item.profitKsh?.toLocaleString() || 0}</td>
                  <td className="border p-2 text-right">
                    {lastTx
                      ? `${lastTx.type} of ${lastTx.quantity} on ${new Date(lastTx.date).toLocaleDateString()}`
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
