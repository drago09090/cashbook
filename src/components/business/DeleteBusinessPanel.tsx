import { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useBusinesses } from '../../hooks/useBusinesses';
import { Business } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface DeleteBusinessPanelProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export function DeleteBusinessPanel({ isOpen, onClose, business }: DeleteBusinessPanelProps) {
  const { user } = useAuth();
  const { deleteBusiness } = useBusinesses();
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const expectedText = `DELETE ${business.name}`;
  const isConfirmationValid = confirmationText === expectedText;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setError('Please type the exact confirmation text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteBusiness(business.id);
      onClose();
      // Redirect to dashboard or show success message
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to delete business');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setError('');
    onClose();
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
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Delete Business</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Warning Icon */}
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Business Permanently
                </h3>
                <p className="text-gray-600">
                  This action cannot be undone. This will permanently delete your business and all associated data.
                </p>
              </div>

              {/* Business Info */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{business.name}</h4>
                    <p className="text-sm text-gray-600">Owner: {user?.full_name || 'You'}</p>
                  </div>
                </div>
              </div>

              {/* What will be deleted */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">What will be deleted:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">All cashbooks and entries</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">All invoices and customer data</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">All team members and permissions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">All business settings and configurations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700">All reports and analytics data</span>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono bg-gray-100 px-1 rounded">{expectedText}</span> to confirm:
                </label>
                <Input
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={expectedText}
                  className={`font-mono ${
                    confirmationText && !isConfirmationValid ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-sm text-red-600 mt-1">
                    Text doesn't match. Please type exactly: {expectedText}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Final Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-900 mb-1">Final Warning</h5>
                  <p className="text-sm text-yellow-800">
                    This action is irreversible. All data will be permanently lost and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={!isConfirmationValid || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Deleting...' : 'Delete Business'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}