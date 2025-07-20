import React from 'react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/Layout/Header';
import MixEntryForm from '../components/Forms/MixEntryForm';
import AddProductModal from '../components/Inventory/AddProductModal';

const MixEntryPage: React.FC = () => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mix Entry</h1>
            <p className="mt-2 text-gray-600">
              Enter concrete mix data with precise measurements and specifications.
            </p>
          </div>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add One Product</span>
          </button>
        </div>
        <MixEntryForm />
        
        <AddProductModal 
          isOpen={showAddProductModal} 
          onClose={() => setShowAddProductModal(false)} 
        />
      </main>
    </div>
  );
};

export default MixEntryPage;