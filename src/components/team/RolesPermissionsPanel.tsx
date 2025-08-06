import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface RolesPermissionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolesPermissionsPanel({ isOpen, onClose }: RolesPermissionsPanelProps) {
  const [activeRole, setActiveRole] = useState<'owner' | 'partner' | 'staff'>('owner');

  const ownerPermissions = [
    'Full access to all books of this business',
    'Full access to business settings',
    'Add/remove members in business'
  ];

  const partnerPermissions = [
    'Full access to all books of this business',
    'Full access to business settings',
    'Add/remove members in business'
  ];

  const partnerRestrictions = [
    "Can't delete business",
    "Can't remove owner from business"
  ];

  const staffPermissions = [
    'Limited access to selected books',
    'Owner/Partner can assign Admin, Viewer or Operator role to staff in any book'
  ];

  const staffRestrictions = [
    'No access to books they are not part of',
    'No access to business settings',
    'No option to delete books',
    "Can't view employee details"
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Business Roles & Permissions</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Role Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveRole('owner')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeRole === 'owner'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Owner (You)
              </button>
              <button
                onClick={() => setActiveRole('partner')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeRole === 'partner'
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Partner
              </button>
              <button
                onClick={() => setActiveRole('staff')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeRole === 'staff'
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Staff
              </button>
            </div>

            {/* Owner Role */}
            {activeRole === 'owner' && (
              <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-blue-800">Each business can have only one owner</span>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-3">
                    {ownerPermissions.map((permission, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Partner Role */}
            {activeRole === 'partner' && (
              <div className="space-y-6">
                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-3">
                    {partnerPermissions.map((permission, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Restrictions</h3>
                  <div className="space-y-3">
                    {partnerRestrictions.map((restriction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-sm text-gray-700">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Staff Role */}
            {activeRole === 'staff' && (
              <div className="space-y-6">
                {/* Permissions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-3">
                    {staffPermissions.map((permission, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Restrictions</h3>
                  <div className="space-y-3">
                    {staffRestrictions.map((restriction, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-sm text-gray-700">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <Button 
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Ok, Got it
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}