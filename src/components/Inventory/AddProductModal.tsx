import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useCreateInventoryProduct } from '../../hooks/useInventoryProducts';
import { useProducts, useColors } from '../../hooks/useValidationData';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form validation schema
const addProductSchema = z.object({
  productType: z.string().min(1, 'Product type is required'),
  color: z.string().min(1, 'Color is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(9999, 'Quantity too large'),
});

type AddProductFormData = z.infer<typeof addProductSchema>;

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch products and colors from database
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { data: colors, isLoading: colorsLoading, error: colorsError } = useColors();

  // Debug logging
  React.useEffect(() => {
    console.log('Products data:', products);
    console.log('Colors data:', colors);
    console.log('Products loading:', productsLoading);
    console.log('Colors loading:', colorsLoading);
    console.log('Products error:', productsError);
    console.log('Colors error:', colorsError);
  }, [products, colors, productsLoading, colorsLoading, productsError, colorsError]);

  const createInventoryProduct = useCreateInventoryProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      productType: '',
      color: '',
      quantity: 1,
    },
  });

  const onSubmit = async (data: AddProductFormData) => {
    try {
      await createInventoryProduct.mutateAsync(data);
      setNotification({
        type: 'success',
        message: 'Product added successfully!',
      });
      reset();
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add product',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleClose = () => {
    reset();
    setNotification(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-[#090040]" />
            <h2 className="text-xl font-semibold text-gray-900">Add Product</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Loading State */}
          {(productsLoading || colorsLoading) && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#090040]"></div>
              <span className="ml-3 text-gray-600">Loading products and colors...</span>
            </div>
          )}

          {/* Error State */}
          {(productsError || colorsError) && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Failed to load products or colors from database
                </span>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              notification.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.message}
              </span>
            </div>
          )}

          {/* Only show form when data is loaded */}
          {!productsLoading && !colorsLoading && products && colors && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                {...register('productType')}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  errors.productType
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[#090040] focus:border-[#090040]'
                }`}
              >
                <option value="">Select product type</option>
                {products.map((product) => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.productType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.productType.message}
                </p>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select
                {...register('color')}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  errors.color
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[#090040] focus:border-[#090040]'
                }`}
              >
                <option value="">Select color</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.color.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                step="1"
                {...register('quantity', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  errors.quantity
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-[#090040] focus:border-[#090040]'
                }`}
                placeholder="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={createInventoryProduct.isPending || productsLoading || colorsLoading || !products || !colors}            className="flex items-center space-x-2 px-6 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>
              {createInventoryProduct.isPending 
                ? 'Adding...' 
                : (productsLoading || colorsLoading) 
                  ? 'Loading...' 
                  : 'Add Product'
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;