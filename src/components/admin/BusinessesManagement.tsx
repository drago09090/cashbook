import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Building,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface Business {
  id: string;
  name: string;
  owner_id: string;
  category: string[];
  type: string;
  created_at: string;
  updated_at: string;
  owner?: {
    full_name?: string;
    email: string;
  };
}

export function BusinessesManagement() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          owner:users!businesses_owner_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.owner?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || business.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleSelectBusiness = (businessId: string) => {
    setSelectedBusinesses(prev => 
      prev.includes(businessId) 
        ? prev.filter(id => id !== businessId)
        : [...prev, businessId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBusinesses.length === filteredBusinesses.length) {
      setSelectedBusinesses([]);
    } else {
      setSelectedBusinesses(filteredBusinesses.map(business => business.id));
    }
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!window.confirm('Are you sure you want to delete this business? This will also delete all associated cashbooks and data.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) throw error;
      
      setBusinesses(prev => prev.filter(business => business.id !== businessId));
      setSelectedBusinesses(prev => prev.filter(id => id !== businessId));
    } catch (error) {
      console.error('Error deleting business:', error);
    }
  };

  const exportBusinesses = () => {
    const csvContent = [
      ['Business Name', 'Owner Name', 'Owner Email', 'Type', 'Categories', 'Created At'].join(','),
      ...filteredBusinesses.map(business => [
        business.name,
        business.owner?.full_name || '',
        business.owner?.email || '',
        business.type,
        business.category.join('; '),
        new Date(business.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `businesses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const getTypeColor = (type: string) => {
    const colors = {
      retailer: 'bg-blue-100 text-blue-800',
      distributor: 'bg-green-100 text-green-800',
      manufacturer: 'bg-purple-100 text-purple-800',
      service: 'bg-orange-100 text-orange-800',
      trader: 'bg-emerald-100 text-emerald-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Businesses Management</h1>
          <p className="text-gray-600 mt-1">Manage all registered businesses</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchBusinesses} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={exportBusinesses} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Businesses</p>
          <p className="text-2xl font-bold text-gray-900">{businesses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Retailers</p>
          <p className="text-2xl font-bold text-blue-600">{businesses.filter(b => b.type === 'retailer').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Service Providers</p>
          <p className="text-2xl font-bold text-orange-600">{businesses.filter(b => b.type === 'service').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Manufacturers</p>
          <p className="text-2xl font-bold text-purple-600">{businesses.filter(b => b.type === 'manufacturer').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search businesses by name or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="retailer">Retailer</option>
            <option value="distributor">Distributor</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="service">Service Provider</option>
            <option value="trader">Trader</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBusinesses.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBusinesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedBusinesses.includes(business.id)}
                      onChange={() => handleSelectBusiness(business.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{business.name}</p>
                        <p className="text-sm text-gray-500">{business.category.join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-900">{business.owner?.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-500">{business.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(business.type)}`}>
                      {business.type.charAt(0).toUpperCase() + business.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 hidden lg:table-cell">
                    {formatDate(business.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBusiness(business);
                          setShowBusinessModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Business"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No businesses found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Business Details Modal */}
      {showBusinessModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
              <button
                onClick={() => setShowBusinessModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedBusiness.name}</h3>
                  <p className="text-gray-600">{selectedBusiness.category.join(', ')}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${getTypeColor(selectedBusiness.type)}`}>
                    {selectedBusiness.type.charAt(0).toUpperCase() + selectedBusiness.type.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Business Name:</span>
                      <p className="text-sm text-gray-900">{selectedBusiness.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Type:</span>
                      <p className="text-sm text-gray-900">{selectedBusiness.type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Categories:</span>
                      <p className="text-sm text-gray-900">{selectedBusiness.category.join(', ')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedBusiness.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedBusiness.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Owner Name:</span>
                      <p className="text-sm text-gray-900">{selectedBusiness.owner?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Owner Email:</span>
                      <p className="text-sm text-gray-900">{selectedBusiness.owner?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowBusinessModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDeleteBusiness(selectedBusiness.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Business
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}