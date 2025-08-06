import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useBusinesses } from '../../hooks/useBusinesses';
import { Business } from '../../types';
import { businessCategories, businessTypes } from '../../lib/supabase';

interface EditBusinessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export function EditBusinessProfileModal({ isOpen, onClose, business }: EditBusinessProfileModalProps) {
  const { updateBusiness } = useBusinesses();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessSubcategory, setBusinessSubcategory] = useState('');
  const [registrationType, setRegistrationType] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  // Initialize form with business data
  useEffect(() => {
    if (business) {
      setBusinessName(business.name);
      setSelectedCategories(business.category || []);
      setSelectedType(business.type);
      // Initialize other fields with empty values since they're not in the current schema
      setBusinessAddress('');
      setGstNumber('');
      setBusinessSubcategory('');
      setRegistrationType('');
      setMobileNumber('');
      setBusinessEmail('');
    }
  }, [business]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!businessName.trim()) {
      setError('Business name is required');
      setLoading(false);
      return;
    }

    try {
      await updateBusiness(business.id, {
        name: businessName.trim(),
        category: selectedCategories,
        type: selectedType
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update business');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return businessCategories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getTypeName = (typeId: string) => {
    return businessTypes.find(type => type.id === typeId)?.name || typeId;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Business Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Basics
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium"
            >
              Business Info
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium"
            >
              Communication
            </button>
          </div>

          {/* Basics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              placeholder="Enter business name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
              <textarea
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                placeholder="Enter business address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <Input
              label="GST Code"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="Enter GST number"
            />
          </div>

          {/* Business Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Business Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {businessCategories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                label="Business Subcategory"
                value={businessSubcategory}
                onChange={(e) => setBusinessSubcategory(e.target.value)}
                placeholder="Enter subcategory"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Business Registration Type"
                value={registrationType}
                onChange={(e) => setRegistrationType(e.target.value)}
                placeholder="e.g., Private Limited, Partnership"
              />
            </div>
          </div>

          {/* Communication Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Communication</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Business Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter mobile number"
              />

              <Input
                label="Business Email"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="Enter business email"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}