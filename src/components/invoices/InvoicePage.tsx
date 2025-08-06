import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Send, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Header } from '../layout/Header';
import { Sidebar } from '../dashboard/Sidebar';
import { Button } from '../ui/Button';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { SendInvoiceModal } from './SendInvoiceModal';
import { useInvoices } from '../../hooks/useInvoices';
import { useBooks } from '../../hooks/useBooks';
import { Invoice } from '../../types';

export function InvoicePage() {
  const navigate = useNavigate();
  const { invoices, loading, deleteInvoice, sendInvoice } = useInvoices();
  const { books } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleSend = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowSendModal(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowCreateModal(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoice_number}?`)) {
      try {
        await deleteInvoice(invoice.id);
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage and send professional invoices</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedInvoice(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Invoices</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{invoices.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'paid').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'sent').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {invoices.filter(inv => inv.status === 'overdue').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-xs sm:max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
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
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="text-center py-16">
                <div className="text-gray-600">Loading invoices...</div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first invoice to get started'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Invoice</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Date</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Due Date</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Status</th>
                      <th className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4">
                          <div className="font-medium text-gray-900 text-sm">{invoice.invoice_number}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {books.find(b => b.id === invoice.book_id)?.name || 'Unknown Book'}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="font-medium text-gray-900 text-sm truncate">{invoice.customer_name}</div>
                          {invoice.customer_email && (
                            <div className="text-xs text-gray-500 truncate">{invoice.customer_email}</div>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                          {formatDate(invoice.invoice_date)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                          {formatDate(invoice.due_date)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                          {formatAmount(invoice.total_amount)}
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handlePreview(invoice)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(invoice)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleSend(invoice)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Send"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(invoice)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
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
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />

      <InvoicePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />

      <SendInvoiceModal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
}