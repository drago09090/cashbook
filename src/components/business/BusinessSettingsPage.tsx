import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Settings as SettingsIcon, Crown, Trash2 } from 'lucide-react';
import { Header } from '../layout/Header';
import { Sidebar } from '../dashboard/Sidebar';
import { Button } from '../ui/Button';
import { EditBusinessProfileModal } from './EditBusinessProfileModal';
import { ChangeOwnerPanel } from './ChangeOwnerPanel';
import { DeleteBusinessPanel } from './DeleteBusinessPanel';
import { useBusinesses } from '../../hooks/useBusinesses';
import { useAuth } from '../../hooks/useAuth';
import { Business } from '../../types';

export function BusinessSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businesses, loading: businessesLoading } = useBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangeOwnerPanel, setShowChangeOwnerPanel] = useState(false);
  const [showDeleteBusinessPanel, setShowDeleteBusinessPanel] = useState(false);

  // Set the first business as selected when businesses load
  useEffect(() => {
    if (businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    }
  }, [businesses, selectedBusiness]);

  // Get business category and type names
  const getCategoryName = (categoryId: string) => {
    const categories = {
      'agriculture': 'Agriculture',
      'construction': 'Construction',
      'education': 'Education',
      'electronics': 'Electronics',
      'financial': 'Financial Services',
      'food': 'Food/Restaurant',
      'fashion': 'Clothes/Fashion',
      'hardware': 'Hardware',
      'jewellery': 'Jewellery',
      'healthcare': 'Healthcare & Fitness',
      'grocery': 'Kirana/Grocery',
      'transport': 'Transport',
      'other': 'Other'
    };
    return categories[categoryId as keyof typeof categories] || categoryId;
  };

  const getTypeName = (typeId: string) => {
    const types = {
      'retailer': 'Retailer',
      'distributor': 'Distributor',
      'manufacturer': 'Manufacturer',
      'service': 'Service Provider',
      'trader': 'Trader',
      'other': 'Other'
    };
    return types[typeId as keyof typeof types] || typeId;
  };

  // Show loading state while businesses are being fetched
  if (businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="text-center py-16">
              <div className="text-gray-600">Loading business settings...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show no business found if no businesses exist
  if (!businessesLoading && businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Business Found</h2>
              <p className="text-gray-600 mb-6">Please create a business first to access settings.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if we have businesses but selectedBusiness is not set yet
  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 p-6">
            <div className="text-center py-16">
              <div className="text-gray-600">Loading business details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Business Settings <span className="text-gray-400 font-normal">({selectedBusiness.name})</span>
            </h1>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Business Profile Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Business Profile</h2>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Edit business details</p>

              {/* Business Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {selectedBusiness.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedBusiness.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-500">⚠️</span>
                      <span className="text-xs sm:text-sm text-orange-600">Incomplete business profile</span>
                    </div>
                  </div>
                </div>

                {/* Profile Strength */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm text-gray-600">Profile Strength</span>
                    <span className="text-xs sm:text-sm font-medium text-orange-600">Medium</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">65.5%</p>
                </div>

                {/* Completion Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-800">
                    6 out of 10 fields are incomplete. Fill these to complete your profile.
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-4 overflow-x-auto">
                <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap">
                  Basics
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap">
                  Business Info
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap">
                  Communication
                </button>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 mb-1">Business Name</label>
                  <div className="text-gray-900 font-medium text-sm sm:text-base truncate">{selectedBusiness.name}</div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 mb-1">Business Category</label>
                  <div className="text-gray-900 text-sm sm:text-base">
                    {selectedBusiness.category.map(cat => getCategoryName(cat)).join(', ')}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 mb-1">Business Type</label>
                  <div className="text-gray-900 text-sm sm:text-base">{getTypeName(selectedBusiness.type)}</div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-500 mb-1">Business Email</label>
                  <div className="text-blue-600 text-sm sm:text-base truncate">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SettingsIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Settings</h2>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Change owner or delete business</p>

              <div className="space-y-4">
                {/* Change Owner */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Change Owner</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Current owner: You</p>
                    </div>
                    <button
                      onClick={() => setShowChangeOwnerPanel(true)}
                      className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Change Owner</span>
                    </button>
                  </div>
                </div>

                {/* Delete Business */}
                <div className="border border-red-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Delete Business</h3>
                      <p className="text-xs sm:text-sm text-gray-600">This will delete your business permanently</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteBusinessPanel(true)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete business</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Panels */}
      <EditBusinessProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        business={selectedBusiness}
      />

      <ChangeOwnerPanel
        isOpen={showChangeOwnerPanel}
        onClose={() => setShowChangeOwnerPanel(false)}
        business={selectedBusiness}
      />

      <DeleteBusinessPanel
        isOpen={showDeleteBusinessPanel}
        onClose={() => setShowDeleteBusinessPanel(false)}
        business={selectedBusiness}
      />
    </div>
  );
}