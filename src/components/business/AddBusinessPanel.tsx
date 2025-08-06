import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { businessCategories, businessTypes } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusinesses';

interface AddBusinessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessCreated: (business: any) => void;
}

export function AddBusinessPanel({ isOpen, onClose, onBusinessCreated }: AddBusinessPanelProps) {
  const { user } = useAuth();
  const { createBusiness } = useBusinesses();
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setShowTypeDropdown(false);
  };

  const resetForm = () => {
    setBusinessName('');
    setSelectedCategories([]);
    setSelectedType('');
    setShowCategoryDropdown(false);
    setShowTypeDropdown(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      setError('Business name is required');
      return;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one business category');
      return;
    }

    if (!selectedType) {
      setError('Please select a business type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newBusiness = await createBusiness({
        name: businessName.trim(),
        category: selectedCategories,
        type: selectedType
      });

      // Notify parent component about the new business
      onBusinessCreated(newBusiness);
      
      // Small delay to ensure the business is properly created
      setTimeout(() => {
        handleClose();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map(id => businessCategories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedTypeName = () => {
    return businessTypes.find(type => type.id === selectedType)?.name || '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Side Panel */}
      <div className={`fixed right-0 top-0 h-full w-[500px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Add New Business</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Add Business Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business Category
              </label>
              <p className="text-sm text-gray-500 mb-3">This will help us personalize your business</p>
              
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between bg-white"
                >
                  <span className={selectedCategories.length > 0 ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedCategories.length > 0 ? getSelectedCategoryNames() : 'Select Business Category'}
                  </span>
                  {showCategoryDropdown ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {businessCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
                            selectedCategories.includes(category.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                              <span className="text-lg">{category.icon}</span>
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{category.name}</span>
                          </div>
                          {selectedCategories.includes(category.id) && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Business Type
              </label>
              <p className="text-sm text-gray-500 mb-3">This will help us personalize your business</p>
              
              <div className="relative">
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between bg-white"
                >
                  <div className="flex items-center space-x-3">
                    {selectedType && (
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${businessTypes.find(t => t.id === selectedType)?.color}`}>
                        <span className="text-sm">{businessTypes.find(t => t.id === selectedType)?.icon}</span>
                      </div>
                    )}
                    <span className={selectedType ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedType ? getSelectedTypeName() : 'Select Business Type'}
                    </span>
                  </div>
                  {showTypeDropdown ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 grid grid-cols-2 gap-3">
                      {businessTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleTypeSelect(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedType === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.color}`}>
                              <span className="text-lg">{type.icon}</span>
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{type.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <Button 
              onClick={handleSubmit}
              disabled={loading || !businessName.trim() || selectedCategories.length === 0 || !selectedType}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating Business...' : 'Create Business'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}