// frontend/src/components/ItemSelector.jsx
import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance"; // ✅ use central axios instance

export default function ItemSelector({ onSelect }) {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/items"); // ✅ token auto-attached
        setItems(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch items:", err);
        setError("❌ Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }
    const results = items.filter((item) =>
      item.name?.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(results);
  }, [query, items]);

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.name);
    setFiltered([]); // hide dropdown after selection
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type item name..."
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
        autoComplete="off"
      />

      {loading && <p className="text-sm text-gray-500 mt-1">Loading items...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

      {query && filtered.length > 0 && (
        <ul
          className="absolute z-10 w-full bg-white border mt-1 max-h-48 overflow-auto rounded shadow-lg"
          role="listbox"
        >
          {filtered.map((item) => (
            <li
              key={item._id}
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              role="option"
            >
              {item.name} ({parseFloat(item.currentStock).toFixed(2)} in stock)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
