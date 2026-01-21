// frontend/src/pages/WorkerView.jsx
import React, { useState } from 'react';
import ItemForm from '../components/ItemForm';
import ItemList from '../components/ItemList';

export default function WorkerView() {
  const [lastAdded, setLastAdded] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleItemAdded = (item) => {
    setLastAdded(item);
    setRefreshTrigger((prev) => prev + 1); // refresh ItemList
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-700">
          Kayoni Graphics — Worker Portal
        </h1>
        <p className="text-gray-600">Record purchases & sales</p>
      </header>

      {/* Item Form */}
      <div className="bg-white p-4 rounded shadow">
        <ItemForm onItemAdded={handleItemAdded} />
      </div>

      {/* Success feedback */}
      {lastAdded && (
        <div className="mt-4 text-green-600 text-center font-medium">
          ✅ Recorded {lastAdded.type} of {lastAdded.quantity} {lastAdded.name}
        </div>
      )}

      {/* Current Stock (read-only) */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-2">📦 Current Stock</h2>
        <ItemList key={refreshTrigger} />
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        💡 Tip: Use <span className="font-semibold">Purchase</span> for new stock,
        <span className="font-semibold"> Sale</span> for items already in system.
      </div>
    </div>
  );
}
