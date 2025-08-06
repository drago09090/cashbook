import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../layout/Header';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function WelcomePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [businessName, setBusinessName] = useState(user?.business_name || '');
  const [skipBusiness, setSkipBusiness] = useState(user?.skip_business || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!skipBusiness && !businessName.trim()) {
      setError('Business name is required');
      setLoading(false);
      return;
    }

    try {
      await updateProfile({
        full_name: fullName.trim(),
        business_name: skipBusiness ? '' : businessName.trim(),
        skip_business: skipBusiness,
      });

      if (skipBusiness) {
        navigate('/dashboard');
      } else {
        navigate('/business/category');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to CashBook</h1>
            <p className="text-gray-600">Add your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Your Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Azmat Mustafa"
              required
            />

            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business Name"
              disabled={skipBusiness}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="skip-business"
                checked={skipBusiness}
                onChange={(e) => {
                  setSkipBusiness(e.target.checked);
                  if (e.target.checked) {
                    setBusinessName('');
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="skip-business" className="text-sm text-gray-600">
                I don't own a business. Skip this.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Get Started'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}