import React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/Layout/Header';
import DataTable from '../components/Data/DataTable';
import AddProductModal from '../components/Inventory/AddProductModal';
import InventoryProductsTable from '../components/Inventory/InventoryProductsTable';

const DataViewPage: React.FC = () => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data View</h1>
            <p className="mt-2 text-gray-600">
              View, filter, and manage your concrete mix data records.
            </p>
          </div>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
        <DataTable />
        
        <div className="mt-8">
          <InventoryProductsTable />
        </div>
        
        <AddProductModal 
          isOpen={showAddProductModal} 
          onClose={() => setShowAddProductModal(false)} 
        />
      </main>
    </div>
  );
};

export default DataViewPage;