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
    <div className="max-w-3xl mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-700">Kayoni Graphics — Worker Portal</h1>
        <p className="text-gray-600">Record purchases & sales</p>
      </header>

      {/* Item Form */}
      <ItemForm onItemAdded={handleItemAdded} />

      {/* Success feedback */}
      {lastAdded && (
        <div className="mt-4 text-green-600 text-center">
          ✅ Recorded {lastAdded.type} of {lastAdded.quantity} {lastAdded.name}
        </div>
      )}

      {/* Current Stock (read-only) */}
      <ItemList refreshTrigger={refreshTrigger} />

      <div className="mt-6 text-sm text-gray-500 text-center">
        💡 Tip: Use "Purchase" for new stock, "Sale" for items already in system.
      </div>
    </div>
  );
}
