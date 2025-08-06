import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Settings, Users, Download, ChevronDown, RefreshCw } from 'lucide-react';
import { Header } from '../layout/Header';
import { Sidebar } from '../dashboard/Sidebar';
import { Button } from '../ui/Button';
import { CashEntryPanel } from './CashEntryPanel';
import { EntryTable } from './EntryTable';
import { EditEntryModal } from './EditEntryModal';
import { ReportModal } from '../reports/ReportModal';
import { BulkImportModal } from './BulkImportModal';
import { useBooks } from '../../hooks/useBooks';
import { useEntries } from '../../hooks/useEntries';
import { useAuth } from '../../hooks/useAuth';
import { Entry } from '../../types';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function FilterDropdown({ label, value, options, onChange, isOpen, onToggle }: FilterDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm text-gray-700">{label}: {value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-3">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={label}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
            <button
              onClick={() => onChange('All')}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BookDetail() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { books, loading: booksLoading } = useBooks(null); // Get all books for this user
  const { entries, loading: entriesLoading, deleteEntry, refetch: refetchEntries } = useEntries(bookId || '');

  // Filter states
  const [duration, setDuration] = useState('All Time');
  const [types, setTypes] = useState('All');
  const [contacts, setContacts] = useState('All');
  const [members, setMembers] = useState('All');
  const [paymentModes, setPaymentModes] = useState('All');
  const [categories, setCategories] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Modal states
  const [showCashInPanel, setShowCashInPanel] = useState(false);
  const [showCashOutPanel, setShowCashOutPanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const book = books.find(b => b.id === bookId);
  
  // Show loading while books are being fetched
  if (booksLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Loading book details...</div>
        </div>
      </div>
    );
  }
  
  // Filter options
  const durationOptions = [
    { value: 'All Time', label: 'All Time' },
    { value: 'Today', label: 'Today' },
    { value: 'Yesterday', label: 'Yesterday' },
    { value: 'This Month', label: 'This Month' },
    { value: 'Last Month', label: 'Last Month' },
    { value: 'Custom', label: 'Custom' },
  ];
  
  const typeOptions = [
    { value: 'All', label: 'All' },
    { value: 'Cash In', label: 'Cash In' },
    { value: 'Cash Out', label: 'Cash Out' },
  ];
  
  const contactOptions = [
    { value: 'All', label: 'All' },
  ];
  
  const memberOptions = [
    { value: 'All', label: 'All' },
  ];
  
  const paymentModeOptions = [
    { value: 'All', label: 'All' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Online', label: 'Online' },
  ];
  
  const categoryOptions = [
    { value: 'All', label: 'All' },
  ];

  if (!booksLoading && !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId);
      } catch (error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingEntry(null);
    setShowEditModal(false);
  };

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchEntries();
    } catch (error) {
      console.error('Failed to refresh entries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Book header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{book.name}</h1>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
                  <Users className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  <span className="sm:hidden">↻</span>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  onClick={() => setShowBulkImportModal(true)}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Bulk Entries</span>
                  <span className="sm:hidden">Bulk</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                  onClick={() => setShowReportModal(true)}
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Reports</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2 overflow-x-auto">
              <FilterDropdown
                label="Duration"
                value={duration}
                options={durationOptions}
                onChange={setDuration}
                isOpen={openDropdown === 'duration'}
                onToggle={() => handleDropdownToggle('duration')}
              />
              
              <FilterDropdown
                label="Types"
                value={types}
                options={typeOptions}
                onChange={setTypes}
                isOpen={openDropdown === 'types'}
                onToggle={() => handleDropdownToggle('types')}
              />
              
              <FilterDropdown
                label="Contacts"
                value={contacts}
                options={contactOptions}
                onChange={setContacts}
                isOpen={openDropdown === 'contacts'}
                onToggle={() => handleDropdownToggle('contacts')}
              />
              
              <FilterDropdown
                label="Members"
                value={members}
                options={memberOptions}
                onChange={setMembers}
                isOpen={openDropdown === 'members'}
                onToggle={() => handleDropdownToggle('members')}
              />
              
              <FilterDropdown
                label="Payment Modes"
                value={paymentModes}
                options={paymentModeOptions}
                onChange={setPaymentModes}
                isOpen={openDropdown === 'paymentModes'}
                onToggle={() => handleDropdownToggle('paymentModes')}
              />
              
              <FilterDropdown
                label="Categories"
                value={categories}
                options={categoryOptions}
                onChange={setCategories}
                isOpen={openDropdown === 'categories'}
                onToggle={() => handleDropdownToggle('categories')}
              />
            </div>
          </div>

          {/* Search and action buttons */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs sm:max-w-md">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by remark or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3 ml-4">
                <Button 
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                  onClick={() => setShowCashInPanel(true)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Cash In</span>
                  <span className="sm:hidden">In</span>
                </Button>
                <Button 
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                  onClick={() => setShowCashOutPanel(true)}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Cash Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            {entriesLoading ? (
              <div className="text-center py-16">
                <div className="text-gray-600">Loading entries...</div>
              </div>
            ) : (
              <EntryTable
                entries={entries}
                selectedEntries={selectedEntries}
                onSelectionChange={setSelectedEntries}
                onDeleteEntry={handleDeleteEntry}
                onEditEntry={handleEditEntry}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Cash Entry Panels */}
      <CashEntryPanel
        isOpen={showCashInPanel}
        onClose={() => setShowCashInPanel(false)}
        type="cash-in"
        bookId={bookId || ''}
      />
      <CashEntryPanel
        isOpen={showCashOutPanel}
        onClose={() => setShowCashOutPanel(false)}
        type="cash-out"
        bookId={bookId || ''}
      />
      
      {/* Edit Entry Modal */}
      <EditEntryModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        entry={editingEntry}
        bookId={bookId || ''}
      />
      
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        entries={entries}
        selectedEntries={selectedEntries}
        bookName={book.name}
      />
      
      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        bookId={bookId || ''}
        bookName={book.name}
      />
    </div>
  );
}