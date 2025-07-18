import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, AlertCircle, CheckCircle, Palette, Plus, Trash2, Package } from 'lucide-react';
import { mixDataSchema, colorOptions, interlockTypes, boardsTiirTypes, type MixDataFormInput } from '../../lib/validation';
import { useCreateMixData } from '../../hooks/useMixData';

const MixEntryForm: React.FC = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const createMixData = useCreateMixData();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    trigger,
    formState: { errors, isValid },
  } = useForm<MixDataFormInput>({
    resolver: zodResolver(mixDataSchema),
    mode: 'onChange',
    defaultValues: {
      mixType: 'interlock',
      cement: 0,
      aggregate: 0,
      sand: 0,
      water: 0,
      plastizer: 0,
      colorType: '', // Default to empty string
      colorQuantity: 0,
      products: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const mixType = watch('mixType');
  const watchedProducts = watch('products') || [];

  // Reset color type and products when mix type changes
  React.useEffect(() => {
    setValue('colorType', '');
    setValue('products', []);
    setAttemptedSubmit(false);
  }, [mixType, setValue]);

  const onSubmit = async (data: MixDataFormInput) => {
    setAttemptedSubmit(true);
    
    // Trigger validation for all fields
    const isFormValid = await trigger();
    
    if (!isFormValid) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields correctly (highlighted in red)',
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      // Transform empty colorType to "No Color" before submitting
      const transformedData = {
        ...data,
        colorType: data.colorType || 'No Color'
      };
      
      await createMixData.mutateAsync(transformedData);
      setNotification({
        type: 'success',
        message: 'Mix data saved successfully!',
      });
      reset();
      setAttemptedSubmit(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save mix data',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const addProduct = (type: string) => {
    if (mixType === 'interlock') {
      // For interlock, add with empty type to be selected
      append({ type: '', quantity: 0 });
    } else {
      // For boards/tiir, add with specific type
      append({ type, quantity: 0 });
    }
  };

  // Get available interlock types (excluding already selected ones)
  const getAvailableInterlockTypes = () => {
    const selectedTypes = watchedProducts.map(p => p.type).filter(Boolean);
    return interlockTypes.filter(type => !selectedTypes.includes(type));
  };

  // Check if a boards/tiir type is already selected
  const isBoardsTiirTypeSelected = (type: string) => {
    return watchedProducts.some(p => p.type === type);
  };

  const inputFields = [
    { name: 'cement', label: 'Cement', unit: 'kg' },
    { name: 'aggregate', label: 'Aggregate', unit: 'kg' },
    { name: 'sand', label: 'Sand', unit: 'kg' },
    { name: 'water', label: 'Water', unit: 'L' },
  ];

  // Helper function to get input border class
  const getInputBorderClass = (fieldName: string, hasError: boolean) => {
    if (attemptedSubmit && hasError) {
      return 'border-red-500 focus:ring-red-500 focus:border-red-500';
    }
    return 'border-gray-300 focus:ring-[#090040] focus:border-[#090040]';
  };

  return (
    <div className="max-w-2xl mx-auto">
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Mix Type Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mix Type</h3>
          <div className="grid grid-cols-2 gap-4">
            {(['interlock', 'boards/tiir'] as const).map((type) => (
              <label key={type} className="relative cursor-pointer">
                <input
                  type="radio"
                  value={type}
                  {...register('mixType')}
                  className="sr-only"
                />
                <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  mixType === type
                    ? 'border-[#090040] bg-[#090040] bg-opacity-5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      mixType === type ? 'text-[#090040]' : 'text-gray-700'
                    }`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Palette className="h-5 w-5 text-[#090040]" />
            <span>Color Configuration</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Type
              </label>
              <select
                {...register('colorType')}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  getInputBorderClass('colorType', !!errors.colorType)
                }`}
              >
                <option value="">No Color (Default)</option>
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              {errors.colorType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.colorType.message}
                </p>
              )}
            </div>

            {/* Color Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register('colorQuantity', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 pr-12 border rounded-lg transition-colors ${
                    getInputBorderClass('colorQuantity', !!errors.colorQuantity)
                  }`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">kg</span>
                </div>
              </div>
              {errors.colorQuantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.colorQuantity.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Measurements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    {...register(field.name as keyof MixDataFormInput, {
                      valueAsNumber: true,
                    })}
                    className={`w-full px-3 py-2 pr-12 border rounded-lg transition-colors ${
                      getInputBorderClass(field.name, !!errors[field.name as keyof MixDataFormInput])
                    }`}
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">{field.unit}</span>
                  </div>
                </div>
                {errors[field.name as keyof MixDataFormInput] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name as keyof MixDataFormInput]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Plastizer field - full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plastizer
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register('plastizer', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 pr-12 border rounded-lg transition-colors ${
                    getInputBorderClass('plastizer', !!errors.plastizer)
                  }`}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">L</span>
                </div>
              </div>
              {errors.plastizer && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.plastizer.message}
                </p>
              )}
            </div>

            {/* Birta field - only show for boards/tiir */}
            {mixType === 'boards/tiir' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birta
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    {...register('birta', { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      getInputBorderClass('birta', !!errors.birta)
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.birta && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.birta.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Types Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#090040]" />
              <span>Total Products</span>
            </h3>
            <div className="flex space-x-2">
              {mixType === 'interlock' ? (
                <button
                  type="button"
                  onClick={() => addProduct('')}
                  disabled={getAvailableInterlockTypes().length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Interlock Type</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => addProduct('Tiir')}
                    disabled={isBoardsTiirTypeSelected('Tiir')}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tiir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addProduct('Boards')}
                    disabled={isBoardsTiirTypeSelected('Boards')}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Boards</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No products added yet</p>
              <p className="text-sm">
                {mixType === 'interlock' 
                  ? 'Click "Add Interlock Type" to get started'
                  : 'Click "Add Tiir" or "Add Boards" to get started'
                }
              </p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mixType === 'interlock' ? 'Interlock Type' : 'Product Type'}
                  </label>
                  {mixType === 'interlock' ? (
                    <select
                      {...register(`products.${index}.type`)}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        attemptedSubmit && !watchedProducts[index]?.type
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#090040] focus:border-[#090040]'
                      }`}
                    >
                      <option value="">Select interlock type</option>
                      {interlockTypes.map((type) => {
                        const isSelected = watchedProducts.some((p, i) => i !== index && p.type === type);
                        return (
                          <option key={type} value={type} disabled={isSelected}>
                            {type} {isSelected ? '(Already selected)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      {...register(`products.${index}.type`)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                  )}
                  {attemptedSubmit && !watchedProducts[index]?.type && (
                    <p className="mt-1 text-sm text-red-600">
                      Product type is required
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="1"
                    {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      getInputBorderClass(`products.${index}.quantity`, !!errors.products?.[index]?.quantity)
                    }`}
                    placeholder="0"
                  />
                  {errors.products?.[index]?.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.products[index]?.quantity?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Products validation error */}
          {attemptedSubmit && fields.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              At least one product is required
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 transition-colors duration-200"
          >
            <Save className="h-5 w-5" />
            <span>
              {createMixData.isPending ? 'Saving...' : 'Save Mix Data'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MixEntryForm;