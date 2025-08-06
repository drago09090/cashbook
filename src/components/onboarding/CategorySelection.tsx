import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { businessCategories } from '../../lib/supabase';

export function CategorySelection() {
  const { updateProfile } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = async () => {
    if (selectedCategories.length === 0) return;
    
    setLoading(true);
    try {
      await updateProfile({ business_category: selectedCategories });
      navigate('/business/type');
    } catch (error) {
      console.error('Failed to update categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/business/type');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/welcome')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Select Business Category <span className="text-gray-400 text-base">(test)</span>
              </h1>
              <p className="text-gray-600">This will help us personalize your app experience</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Business Setup: <span className="font-medium">Step 1/2</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {businessCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                selectedCategories.includes(category.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                  <span className="text-lg">{category.icon}</span>
                </div>
                <span className="font-medium text-gray-900">{category.name}</span>
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
            disabled={selectedCategories.length === 0 || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}