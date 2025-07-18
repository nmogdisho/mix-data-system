import React, { useState } from 'react';
import { X, Package, Palette, Grid } from 'lucide-react';
import { useMixData } from '../../hooks/useMixData';
import type { MixData } from '../../types';

interface FilteredProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilteredProductsModal: React.FC<FilteredProductsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'color' | 'product'>('color');
  const { data, isLoading } = useMixData(1, 1000); // Get all data for totals

  if (!isOpen) return null;

  // Color mapping for visual representation
  const colorMap: Record<string, string> = {
    'Red': '#ef4444',
    'Pure Red': '#dc2626',
    'White': '#f8fafc',
    'Black': '#1f2937',
    'Yellow': '#eab308',
    'No Color': '#9ca3af',
  };

  // Calculate totals grouped by color
  const calculateColorTotals = () => {
    if (!data?.data) return {};

    const groupedData: Record<string, Record<string, Record<string, number>>> = {};

    data.data.forEach((mix: MixData) => {
      const color = mix.measurements.colorType || 'No Color';
      const mixType = mix.mixType;

      if (!groupedData[color]) {
        groupedData[color] = {};
      }
      if (!groupedData[color][mixType]) {
        groupedData[color][mixType] = {};
      }

      if (mix.measurements.products) {
        mix.measurements.products.forEach(product => {
          const key = `${product.type}`;
          groupedData[color][mixType][key] = (groupedData[color][mixType][key] || 0) + product.quantity;
        });
      }
    });

    return groupedData;
  };

  // Calculate totals grouped by product type
  const calculateProductTotals = () => {
    if (!data?.data) return {};

    const groupedData: Record<string, Record<string, number>> = {};

    data.data.forEach((mix: MixData) => {
      const color = mix.measurements.colorType || 'No Color';

      if (mix.measurements.products) {
        mix.measurements.products.forEach(product => {
          const productType = product.type;
          
          if (!groupedData[productType]) {
            groupedData[productType] = {};
          }
          
          groupedData[productType][color] = (groupedData[productType][color] || 0) + product.quantity;
        });
      }
    });

    return groupedData;
  };

  const colorGroupedData = calculateColorTotals();
  const productGroupedData = calculateProductTotals();

  const getTotalForColorAndType = (colorData: Record<string, Record<string, number>>, mixType: string) => {
    if (!colorData[mixType]) return 0;
    return Object.values(colorData[mixType]).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalForColor = (colorData: Record<string, Record<string, number>>) => {
    let total = 0;
    Object.values(colorData).forEach(mixTypeData => {
      total += Object.values(mixTypeData).reduce((sum, qty) => sum + qty, 0);
    });
    return total;
  };

  const getTotalForProduct = (productData: Record<string, number>) => {
    return Object.values(productData).reduce((sum, qty) => sum + qty, 0);
  };

  const formatMixType = (mixType: string) => {
    if (mixType === 'interlock') return 'Interlock';
    if (mixType === 'boards/tiir') return 'Boards/Tiir';
    return mixType;
  };

  const renderColorTab = () => (
    <div className="space-y-6">
      {Object.keys(colorGroupedData).length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No products recorded yet</p>
        </div>
      ) : (
        Object.entries(colorGroupedData).map(([color, colorData]) => (
          <div key={color} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {/* Color Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ 
                  backgroundColor: colorMap[color] || '#9ca3af',
                  border: color === 'White' ? '2px solid #d1d5db' : '2px solid transparent'
                }}
              ></div>
              <h3 className="text-xl font-bold text-gray-900">{color.toUpperCase()}</h3>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                Total: {getTotalForColor(colorData)} products
              </span>
            </div>

            {/* All products under this color */}
            <div className="space-y-4">
              {Object.entries(colorData).map(([mixType, products]) => (
                <div key={mixType}>
                  <h4 className={`text-lg font-semibold mb-3 ${
                    mixType === 'interlock' ? 'text-blue-700' : 'text-green-700'
                  }`}>
                    {formatMixType(mixType)} ({getTotalForColorAndType(colorData, mixType)} total)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                    {Object.entries(products).map(([productType, quantity]) => (
                      <div key={productType} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full border shadow-sm"
                            style={{ 
                              backgroundColor: colorMap[color] || '#9ca3af',
                              border: color === 'White' ? '1px solid #d1d5db' : '1px solid transparent'
                            }}
                          ></div>
                          <span className="font-medium text-gray-900">{productType}</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderProductTab = () => (
    <div className="space-y-6">
      {Object.keys(productGroupedData).length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">No products recorded yet</p>
        </div>
      ) : (
        Object.entries(productGroupedData).map(([productType, colorData]) => (
          <div key={productType} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {/* Product Type Header */}
            <div className="flex items-center space-x-3 mb-6">
              <Package className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">{productType.toUpperCase()}</h3>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                Total: {getTotalForProduct(colorData)} products
              </span>
            </div>

            {/* All colors for this product type */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(colorData).map(([color, quantity]) => (
                <div key={color} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-5 h-5 rounded-full border shadow-sm"
                      style={{ 
                        backgroundColor: colorMap[color] || '#9ca3af',
                        border: color === 'White' ? '2px solid #d1d5db' : '2px solid transparent'
                      }}
                    ></div>
                    <span className="font-medium text-gray-900">{productType} {color}</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-600">
                    {quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  const getGrandTotal = () => {
    if (activeTab === 'color') {
      return Object.values(colorGroupedData).reduce((total, colorData) => 
        total + getTotalForColor(colorData), 0
      );
    } else {
      return Object.values(productGroupedData).reduce((total, productData) => 
        total + getTotalForProduct(productData), 0
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Total Products by Filter</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('color')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'color'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Filter by Color</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('product')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'product'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>Filter by Product Type</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'color' ? renderColorTab() : renderProductTab()}

              {/* Grand Total Summary */}
              {getGrandTotal() > 0 && (
                <div className={`mt-8 bg-gradient-to-r p-6 rounded-lg border ${
                  activeTab === 'color' 
                    ? 'from-purple-50 to-pink-50 border-purple-200' 
                    : 'from-indigo-50 to-blue-50 border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {activeTab === 'color' ? (
                        <Palette className="h-6 w-6 text-purple-600" />
                      ) : (
                        <Grid className="h-6 w-6 text-indigo-600" />
                      )}
                      <span className="text-xl font-bold text-gray-900">
                        Grand Total (All {activeTab === 'color' ? 'Colors' : 'Product Types'})
                      </span>
                    </div>
                    <span className={`text-3xl font-bold ${
                      activeTab === 'color' ? 'text-purple-600' : 'text-indigo-600'
                    }`}>
                      {getGrandTotal()}
                    </span>
                  </div>
                </div>
              )}
            </>
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

export default FilteredProductsModal;