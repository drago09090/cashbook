import { useState } from 'react';
import { X, ArrowLeft, Crown, Info, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Business } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface ChangeOwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
}

export function ChangeOwnerPanel({ isOpen, onClose, business }: ChangeOwnerPanelProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Change Owner, 2: Choose New Owner

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleTransferOwnership = () => {
    // Here you would implement the actual ownership transfer logic
    console.log('Transferring ownership...');
    handleClose();
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
            <div className="flex items-center space-x-3">
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 1 ? 'Change Owner' : 'Choose New Owner'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Current Owner Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Current Owner</h3>
                      <p className="text-sm text-gray-600">{user?.full_name || 'You'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">Important Notice</h4>
                    <p className="text-sm text-orange-800">
                      Once you transfer ownership, you will lose admin access to this business. 
                      The new owner will have full control over the business settings and data.
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Requirements to Change Owner</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-xs">1</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        The new owner must be a partner in your business team
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-xs">2</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        They must accept the ownership transfer request
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-blue-600 text-xs">3</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        All pending transactions must be completed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Business: {business.name}</h4>
                  <p className="text-sm text-gray-600">
                    This action will transfer complete ownership of this business and all its data.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* No Partners Found */}
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No business partners found!
                  </h3>
                  <p className="text-gray-600 text-center mb-6">
                    Add partner from business team page & then you can transfer ownership to them
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">1</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Add 'Partner' from business team page
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">2</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Alternately you can change the role of existing staff member to partner
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 text-xs">3</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Once you have partner in your team, then you can transfer ownership to them
                    </p>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <button className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center space-x-3">
                      <Info className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        How to transfer ownership?
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            {step === 1 ? (
              <Button 
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleTransferOwnership}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled
              >
                Transfer Ownership
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}