// frontend/src/pages/WorkerView.jsx
import React from 'react';
import ItemForm from '../components/ItemForm';

export default function WorkerView() {
  const handleItemAdded = (item) => {
    console.log('New item recorded:', item);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Kayoni Graphics — Worker Portal</h1>
        <p className="text-gray-600">Record purchases & sales</p>
      </header>
      <ItemForm onItemAdded={handleItemAdded} />
      <div className="mt-6 text-sm text-gray-500 text-center">
        💡 Tip: Use "Purchase" for new stock, "Sale" for items already in system.
      </div>
    </div>
  );
}