import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { businessTypes } from '../../lib/supabase';

export function TypeSelection() {
  const { updateProfile } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!selectedType) return;
    
    setLoading(true);
    try {
      await updateProfile({ business_type: selectedType });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update business type:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/business/category')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Select Business Type <span className="text-gray-400 text-base">(test)</span>
              </h1>
              <p className="text-gray-600">This will help us personalize your app experience</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Business Setup: <span className="font-medium">Step 2/2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {businessTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-6 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                  <span className="text-xl">{type.icon}</span>
                </div>
                <span className="font-medium text-gray-900">{type.name}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedType || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}