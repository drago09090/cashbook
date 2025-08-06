import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Book,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface Cashbook {
  id: string;
  name: string;
  user_id: string;
  business_id?: string;
  business_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner?: {
    full_name?: string;
    email: string;
  };
  business?: {
    name: string;
  };
  entries_count?: number;
  total_cash_in?: number;
  total_cash_out?: number;
}

export function CashbooksManagement() {
  const [cashbooks, setCashbooks] = useState<Cashbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCashbooks, setSelectedCashbooks] = useState<string[]>([]);
  const [showCashbookModal, setShowCashbookModal] = useState(false);
  const [selectedCashbook, setSelectedCashbook] = useState<Cashbook | null>(null);

  useEffect(() => {
    fetchCashbooks();
  }, []);

  const fetchCashbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          owner:users!books_user_id_fkey (
            full_name,
            email
          ),
          business:businesses!books_business_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch entries count and totals for each cashbook
      const cashbooksWithStats = await Promise.all(
        (data || []).map(async (book) => {
          const { count: entriesCount } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', book.id);

          const { data: entriesData } = await supabase
            .from('entries')
            .select('type, amount')
            .eq('book_id', book.id);

          const totalCashIn = entriesData?.filter(e => e.type === 'cash_in').reduce((sum, e) => sum + Number(e.amount), 0) || 0;
          const totalCashOut = entriesData?.filter(e => e.type === 'cash_out').reduce((sum, e) => sum + Number(e.amount), 0) || 0;

          return {
            ...book,
            entries_count: entriesCount || 0,
            total_cash_in: totalCashIn,
            total_cash_out: totalCashOut
          };
        })
      );

      setCashbooks(cashbooksWithStats);
    } catch (error) {
      console.error('Error fetching cashbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCashbooks = cashbooks.filter(cashbook => {
    const matchesSearch = cashbook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cashbook.owner?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cashbook.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cashbook.business?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cashbook.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectCashbook = (cashbookId: string) => {
    setSelectedCashbooks(prev => 
      prev.includes(cashbookId) 
        ? prev.filter(id => id !== cashbookId)
        : [...prev, cashbookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCashbooks.length === filteredCashbooks.length) {
      setSelectedCashbooks([]);
    } else {
      setSelectedCashbooks(filteredCashbooks.map(cashbook => cashbook.id));
    }
  };

  const handleDeleteCashbook = async (cashbookId: string) => {
    if (!window.confirm('Are you sure you want to delete this cashbook? This will also delete all associated entries.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', cashbookId);

      if (error) throw error;
      
      setCashbooks(prev => prev.filter(cashbook => cashbook.id !== cashbookId));
      setSelectedCashbooks(prev => prev.filter(id => id !== cashbookId));
    } catch (error) {
      console.error('Error deleting cashbook:', error);
    }
  };

  const exportCashbooks = () => {
    const csvContent = [
      ['Cashbook Name', 'Owner Name', 'Owner Email', 'Business', 'Status', 'Entries Count', 'Cash In', 'Cash Out', 'Balance', 'Created At'].join(','),
      ...filteredCashbooks.map(cashbook => [
        cashbook.name,
        cashbook.owner?.full_name || '',
        cashbook.owner?.email || '',
        cashbook.business?.name || cashbook.business_name || '',
        cashbook.status,
        cashbook.entries_count || 0,
        cashbook.total_cash_in || 0,
        cashbook.total_cash_out || 0,
        (cashbook.total_cash_in || 0) - (cashbook.total_cash_out || 0),
        new Date(cashbook.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cashbooks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Cashbooks Management</h1>
          <p className="text-gray-600 mt-1">Manage all cashbooks across the platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchCashbooks} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={exportCashbooks} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Cashbooks</p>
          <p className="text-2xl font-bold text-gray-900">{cashbooks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{cashbooks.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Entries</p>
          <p className="text-2xl font-bold text-blue-600">{cashbooks.reduce((sum, c) => sum + (c.entries_count || 0), 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(cashbooks.reduce((sum, c) => sum + ((c.total_cash_in || 0) - (c.total_cash_out || 0)), 0))}
          </p>
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
                placeholder="Search cashbooks by name, owner, or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Cashbooks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCashbooks.length === filteredCashbooks.length && filteredCashbooks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Cashbook
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Business
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Entries
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCashbooks.map((cashbook) => (
                <tr key={cashbook.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCashbooks.includes(cashbook.id)}
                      onChange={() => handleSelectCashbook(cashbook.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Book className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{cashbook.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(cashbook.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-900">{cashbook.owner?.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-500">{cashbook.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-900">{cashbook.business?.name || cashbook.business_name || 'No Business'}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-900">{cashbook.entries_count || 0} entries</p>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="text-sm">
                      <p className="text-green-600">+{formatCurrency(cashbook.total_cash_in || 0)}</p>
                      <p className="text-red-600">-{formatCurrency(cashbook.total_cash_out || 0)}</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency((cashbook.total_cash_in || 0) - (cashbook.total_cash_out || 0))}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(cashbook.status)}`}>
                      {cashbook.status.charAt(0).toUpperCase() + cashbook.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCashbook(cashbook);
                          setShowCashbookModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCashbook(cashbook.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Cashbook"
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

        {filteredCashbooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No cashbooks found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Cashbook Details Modal */}
      {showCashbookModal && selectedCashbook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Cashbook Details</h2>
              <button
                onClick={() => setShowCashbookModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Book className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedCashbook.name}</h3>
                  <p className="text-gray-600">{selectedCashbook.business?.name || selectedCashbook.business_name || 'No Business'}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(selectedCashbook.status)}`}>
                    {selectedCashbook.status.charAt(0).toUpperCase() + selectedCashbook.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cashbook Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="text-sm text-gray-900">{selectedCashbook.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <p className="text-sm text-gray-900">{selectedCashbook.status}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Entries:</span>
                      <p className="text-sm text-gray-900">{selectedCashbook.entries_count || 0}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedCashbook.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedCashbook.updated_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Total Cash In:</span>
                      <p className="text-sm text-green-600 font-medium">+{formatCurrency(selectedCashbook.total_cash_in || 0)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Cash Out:</span>
                      <p className="text-sm text-red-600 font-medium">-{formatCurrency(selectedCashbook.total_cash_out || 0)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Current Balance:</span>
                      <p className="text-sm text-gray-900 font-bold">
                        {formatCurrency((selectedCashbook.total_cash_in || 0) - (selectedCashbook.total_cash_out || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Owner Information</h5>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">{selectedCashbook.owner?.full_name || 'No Name'}</p>
                      <p className="text-xs text-gray-500">{selectedCashbook.owner?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowCashbookModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDeleteCashbook(selectedCashbook.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Cashbook
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}