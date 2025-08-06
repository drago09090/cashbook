import { useState } from 'react';
import { X, ArrowLeft, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface AddTeamMemberPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserInfo {
  name: string;
  email: string;
  isExistingUser: boolean;
}

export function AddTeamMemberPanel({ isOpen, onClose }: AddTeamMemberPanelProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Add Email, 2: Choose Role
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'staff' | 'partner'>('staff');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!email.trim()) return;

    setLoading(true);
    
    // Simulate checking if user exists
    setTimeout(() => {
      // Mock user data - in real app, this would be an API call
      const mockUserInfo: UserInfo = {
        name: 'Azmat Mustafa',
        email: email.trim(),
        isExistingUser: true
      };
      
      setUserInfo(mockUserInfo);
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setUserInfo(null);
    setSelectedRole('staff');
    onClose();
  };

  const handleAddMember = () => {
    // Here you would implement the actual team member addition logic
    console.log('Adding member:', { userInfo, role: selectedRole });
    handleClose();
  };

  const getRolePermissions = (role: 'staff' | 'partner') => {
    if (role === 'staff') {
      return {
        permissions: [
          'Limited access to selected books',
          'Owner/Partner can assign Admin, Viewer or Operator role to staff in any book'
        ],
        restrictions: [
          'No access to books they are not part of',
          'No access to business settings',
          'No option to delete books',
          "Can't view employee details"
        ]
      };
    } else {
      return {
        permissions: [
          'Full access to all books of this business',
          'Full access to business settings',
          'Add/remove members in business'
        ],
        restrictions: [
          "Can't delete business",
          "Can't remove owner from business"
        ]
      };
    }
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
                {step === 1 ? 'Add team member' : 'Choose Role & Add'}
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
                <Input
                  label="Add Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. xyz123@gmail.com"
                  required
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info Message */}
                <div className="text-sm text-gray-600">
                  {userInfo?.name} is already using CashBook app. Choose their role in this business and add
                </div>

                {/* User Card */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {userInfo?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{userInfo?.name}</div>
                      <div className="text-sm text-gray-500">{userInfo?.email}</div>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    CashBook User
                  </span>
                </div>

                {/* Choose Role */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Choose Role</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedRole('staff')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedRole === 'staff'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Staff
                    </button>
                    <button
                      onClick={() => setSelectedRole('partner')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedRole === 'partner'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Partner
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {getRolePermissions(selectedRole).permissions.map((permission, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restrictions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Restrictions</h4>
                  <div className="space-y-2">
                    {getRolePermissions(selectedRole).restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <X className="w-2 h-2 text-red-500" />
                        </div>
                        <span className="text-sm text-gray-700">{restriction}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Change Note */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">i</span>
                  </div>
                  <span>You can change this role later</span>
                </div>

                {/* Partner Warning */}
                {selectedRole === 'partner' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start space-x-2">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span className="text-sm text-orange-800">
                      Partner will get full access to your business
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            {step === 1 ? (
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                >
                  Add With Mobile Number
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!email.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Checking...' : 'Next'}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex-1"
                >
                  Change Email
                </Button>
                <Button 
                  onClick={handleAddMember}
                  className={`flex items-center space-x-2 ${
                    selectedRole === 'staff' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add as {selectedRole}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}