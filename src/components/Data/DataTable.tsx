import React, { useState } from 'react';
import { Filter, Download, Edit2, Trash2, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useMixData, useDeleteMixData } from '../../hooks/useMixData';
import TotalProductsModal from './TotalProductsModal';
import FilteredProductsModal from './FilteredProductsModal';
import EditMixModal from './EditMixModal';
import type { MixData } from '../../types';

const DataTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    mixType: '',
  });
  const [showTotalProducts, setShowTotalProducts] = useState(false);
  const [showFilteredProducts, setShowFilteredProducts] = useState(false);
  const [editingMix, setEditingMix] = useState<MixData | null>(null);

  const { data, isLoading, error } = useMixData(page, 25, filters);
  const deleteMixData = useDeleteMixData();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mix data?')) {
      try {
        await deleteMixData.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting mix data:', error);
      }
    }
  };

  const handleExport = () => {
    if (!data?.data) return;

    const csvContent = [
      ['ID', 'Timestamp', 'Mix Type', 'Color Type', 'Color Quantity', 'Cement', 'Aggregate', 'Sand', 'Water', 'Plastizer', 'Birta'],
      ...data.data.map(mix => [
        mix.id,
        new Date(mix.timestamp).toLocaleString(),
        mix.mixType,
        mix.measurements.colorType,
        mix.measurements.colorQuantity,
        mix.measurements.cement,
        mix.measurements.aggregate,
        mix.measurements.sand,
        mix.measurements.water,
        mix.measurements.plastizer,
        mix.measurements.birta || '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mix-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper function to capitalize mix type display
  const formatMixType = (mixType: string) => {
    if (mixType === 'interlock') return 'Interlock';
    if (mixType === 'boards/tiir') return 'Boards/Tiir';
    return mixType;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#090040]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Mix Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={filters.mixType}
                onChange={(e) => setFilters({ ...filters, mixType: e.target.value })}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#090040] focus:border-[#090040] transition-colors appearance-none"
              >
                <option value="">All Types</option>
                <option value="interlock">Interlock</option>
                <option value="boards/tiir">Boards/Tiir</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowTotalProducts(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>See Total Products</span>
            </button>
            <button
              onClick={() => setShowFilteredProducts(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              <span>See Total Products by Filter</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mix Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color Qty (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cement (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aggregate (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sand (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Water (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plastizer (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Birta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data?.map((mix: MixData) => (
                <tr key={mix.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mix.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mix.mixType === 'interlock' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {formatMixType(mix.mixType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {mix.measurements.colorType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.colorQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.cement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.aggregate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.sand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.water}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.plastizer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mix.measurements.birta || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      <button 
                        onClick={() => setEditingMix(mix)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mix.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= (data?.totalPages || 1)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((page - 1) * 25) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * 25, data?.count || 0)}
                </span> of{' '}
                <span className="font-medium">{data?.count || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {page} of {data?.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= (data?.totalPages || 1)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Total Products Modal */}
      <TotalProductsModal 
        isOpen={showTotalProducts} 
        onClose={() => setShowTotalProducts(false)} 
      />

      {/* Filtered Products Modal */}
      <FilteredProductsModal 
        isOpen={showFilteredProducts} 
        onClose={() => setShowFilteredProducts(false)} 
      />

      {/* Edit Modal */}
      <EditMixModal 
        isOpen={!!editingMix} 
        onClose={() => setEditingMix(null)} 
        mixData={editingMix}
      />
    </div>
  );
};

export default DataTable;