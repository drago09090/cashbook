import { X, Crown, Check, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface OwnerPermissionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OwnerPermissionsPanel({ isOpen, onClose }: OwnerPermissionsPanelProps) {
  const { user } = useAuth();

  const ownerPermissions = [
    'Full access to all books of this business',
    'Full access to business settings',
    'Add/remove members in business',
    'Create and manage invoices',
    'Access all reports and analytics',
    'Manage business profile and details',
    'Transfer ownership to partners',
    'Delete business permanently'
  ];

  const ownerPrivileges = [
    'Cannot be removed from business by anyone',
    'Has ultimate authority over all business decisions',
    'Can override any team member permissions',
    'Receives all important business notifications'
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
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">Owner Permissions</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Owner Info */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Owner</h3>
                    <p className="text-sm text-gray-600">{user?.full_name || 'You'}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Owner Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">What is a Business Owner?</h4>
                    <p className="text-sm text-blue-800">
                      The business owner has complete control over the business and all its data. 
                      There can only be one owner per business, and they have unrestricted access to all features.
                    </p>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Owner Permissions</span>
                </h4>
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

              {/* Special Privileges */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span>Special Privileges</span>
                </h4>
                <div className="space-y-3">
                  {ownerPrivileges.map((privilege, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                        <Crown className="w-3 h-3 text-yellow-600" />
                      </div>
                      <span className="text-sm text-gray-700">{privilege}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transfer Ownership Note */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h5 className="font-medium text-orange-900 mb-2">Transfer Ownership</h5>
                <p className="text-sm text-orange-800">
                  As the owner, you can transfer ownership to a business partner. 
                  Once transferred, you will lose owner privileges and the new owner will have complete control.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <Button 
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}