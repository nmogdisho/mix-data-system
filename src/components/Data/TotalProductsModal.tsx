import React from 'react';
import { X, Package } from 'lucide-react';
import { useMixData } from '../../hooks/useMixData';
import type { MixData } from '../../types';

interface TotalProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TotalProductsModal: React.FC<TotalProductsModalProps> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useMixData(1, 1000); // Get all data for totals

  if (!isOpen) return null;

  // Calculate totals for all product types
  const calculateTotals = () => {
    if (!data?.data) return { interlockTotals: {}, boardsTiirTotals: {} };

    const interlockTotals: Record<string, number> = {};
    const boardsTiirTotals: Record<string, number> = {};

    data.data.forEach((mix: MixData) => {
      if (mix.measurements.products) {
        mix.measurements.products.forEach(product => {
          if (mix.mixType === 'interlock') {
            interlockTotals[product.type] = (interlockTotals[product.type] || 0) + product.quantity;
          } else if (mix.mixType === 'boards/tiir') {
            boardsTiirTotals[product.type] = (boardsTiirTotals[product.type] || 0) + product.quantity;
          }
        });
      }
    });

    return { interlockTotals, boardsTiirTotals };
  };

  const { interlockTotals, boardsTiirTotals } = calculateTotals();

  const getTotalQuantity = (totals: Record<string, number>) => {
    return Object.values(totals).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-[#090040]" />
            <h2 className="text-xl font-semibold text-gray-900">Total Products Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#090040]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interlock Products */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Interlock Products</span>
                </h3>
                {Object.keys(interlockTotals).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(interlockTotals).map(([type, quantity]) => (
                      <div key={type} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-900">{type}</span>
                        <span className="text-lg font-bold text-blue-600">{quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-blue-200 pt-3 mt-3">
                      <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                        <span className="font-bold text-blue-900">Total Interlock</span>
                        <span className="text-xl font-bold text-blue-700">
                          {getTotalQuantity(interlockTotals)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-blue-700 text-center py-4">No interlock products recorded</p>
                )}
              </div>

              {/* Boards/Tiir Products */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Boards/Tiir Products</span>
                </h3>
                {Object.keys(boardsTiirTotals).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(boardsTiirTotals).map(([type, quantity]) => (
                      <div key={type} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <span className="font-medium text-gray-900">{type}</span>
                        <span className="text-lg font-bold text-green-600">{quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-green-200 pt-3 mt-3">
                      <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg">
                        <span className="font-bold text-green-900">Total Boards/Tiir</span>
                        <span className="text-xl font-bold text-green-700">
                          {getTotalQuantity(boardsTiirTotals)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-green-700 text-center py-4">No boards/tiir products recorded</p>
                )}
              </div>

              {/* Grand Total */}
              <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Grand Total (All Products)</span>
                  <span className="text-2xl font-bold text-[#090040]">
                    {getTotalQuantity(interlockTotals) + getTotalQuantity(boardsTiirTotals)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TotalProductsModal;