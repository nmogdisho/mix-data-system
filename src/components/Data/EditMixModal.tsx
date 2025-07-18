import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, AlertCircle, CheckCircle, Palette, Plus, Trash2, Package } from 'lucide-react';
import { mixDataSchema, colorOptions, interlockTypes, boardsTiirTypes, type MixDataFormInput } from '../../lib/validation';
import { useUpdateMixData } from '../../hooks/useMixData';
import type { MixData } from '../../types';

interface EditMixModalProps {
  isOpen: boolean;
  onClose: () => void;
  mixData: MixData | null;
}

const EditMixModal: React.FC<EditMixModalProps> = ({ isOpen, onClose, mixData }) => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const updateMixData = useUpdateMixData();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<MixDataFormInput>({
    resolver: zodResolver(mixDataSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  });

  const mixType = watch('mixType');
  const watchedProducts = watch('products') || [];

  // Initialize form with existing data
  useEffect(() => {
    if (mixData && isOpen) {
      const formData = {
        mixType: mixData.mixType,
        cement: mixData.measurements.cement,
        aggregate: mixData.measurements.aggregate,
        sand: mixData.measurements.sand,
        water: mixData.measurements.water,
        plastizer: mixData.measurements.plastizer,
        colorType: mixData.measurements.colorType === 'No Color' ? '' : mixData.measurements.colorType,
        colorQuantity: mixData.measurements.colorQuantity,
        products: mixData.measurements.products || [],
        ...(mixData.mixType === 'boards/tiir' && mixData.measurements.birta !== undefined && {
          birta: mixData.measurements.birta
        }),
      };
      reset(formData);
      setAttemptedSubmit(false);
      setNotification(null);
    }
  }, [mixData, isOpen, reset]);

  // Reset color type and products when mix type changes
  useEffect(() => {
    if (mixData && mixType !== mixData.mixType) {
      setValue('colorType', '');
      setValue('products', []);
      setAttemptedSubmit(false);
    }
  }, [mixType, setValue, mixData]);

  const onSubmit = async (data: MixDataFormInput) => {
    if (!mixData) return;
    
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
      
      await updateMixData.mutateAsync({ id: mixData.id, formData: transformedData });
      setNotification({
        type: 'success',
        message: 'Mix data updated successfully!',
      });
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 2000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update mix data',
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

  if (!isOpen || !mixData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-[#090040]" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Mix Data</h2>
              <p className="text-sm text-gray-500">
                Created: {new Date(mixData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
            {/* Hidden Mix Type Field */}
            <input type="hidden" {...register('mixType')} />

            {/* Color Selection */}
            <div className="bg-gray-50 p-6 rounded-xl">
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
            <div className="bg-gray-50 p-6 rounded-xl">
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
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
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
                  <div key={field.id} className="flex items-end space-x-4 p-4 bg-white rounded-lg border border-gray-200">
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
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={updateMixData.isPending}
            className="flex items-center space-x-2 px-6 py-2 bg-[#090040] text-white rounded-lg hover:bg-[#090040]/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>
              {updateMixData.isPending ? 'Updating...' : 'Update Mix Data'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMixModal;