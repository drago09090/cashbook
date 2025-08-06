import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  book_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  owner?: {
    full_name?: string;
    email: string;
  };
  book?: {
    name: string;
  };
}

export function InvoicesManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          owner:users!invoices_user_id_fkey (
            full_name,
            email
          ),
          book:books!invoices_book_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.owner?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.owner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const exportInvoices = () => {
    const csvContent = [
      ['Invoice Number', 'Customer Name', 'Customer Email', 'Owner Name', 'Owner Email', 'Book', 'Status', 'Total Amount', 'Invoice Date', 'Due Date', 'Created At'].join(','),
      ...filteredInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.customer_name,
        invoice.customer_email,
        invoice.owner?.full_name || '',
        invoice.owner?.email || '',
        invoice.book?.name || '',
        invoice.status,
        invoice.total_amount,
        new Date(invoice.invoice_date).toLocaleDateString(),
        new Date(invoice.due_date).toLocaleDateString(),
        new Date(invoice.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
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
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices Management</h1>
          <p className="text-gray-600 mt-1">Manage all invoices across the platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchInvoices} variant="outline" className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button onClick={exportInvoices} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{invoices.filter(i => i.status === 'draft').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Sent</p>
          <p className="text-2xl font-bold text-blue-600">{invoices.filter(i => i.status === 'sent').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0))}
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
                placeholder="Search invoices by number, customer, or owner..."
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
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                  Due Date
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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">{invoice.book?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-900">{invoice.customer_name}</p>
                    <p className="text-xs text-gray-500">{invoice.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-900">{invoice.owner?.full_name || 'No Name'}</p>
                    <p className="text-xs text-gray-500">{invoice.owner?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total_amount)}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 hidden xl:table-cell">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowInvoiceModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Invoice"
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

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No invoices found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedInvoice.invoice_number}</h3>
                  <p className="text-gray-600">{selectedInvoice.customer_name}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Invoice Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Invoice Number:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Book:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.book?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Invoice Date:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedInvoice.invoice_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Due Date:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedInvoice.due_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Created:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedInvoice.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Customer Name:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.customer_email || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Phone:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.customer_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Address:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.customer_address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Owner Name:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.owner?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Owner Email:</span>
                      <p className="text-sm text-gray-900">{selectedInvoice.owner?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Financial Summary</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Subtotal:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Tax ({selectedInvoice.tax_rate}%):</span>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.tax_amount)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Discount:</span>
                      <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.discount_amount)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Total Amount:</span>
                      <p className="text-sm text-gray-900 font-bold">{formatCurrency(selectedInvoice.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowInvoiceModal(false)}
                variant="outline"
              >
                Close
              </Button>
              <Button
                onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}