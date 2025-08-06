import { useState, useEffect } from 'react';
import { Plus, Search, Grid, Users, RefreshCw } from 'lucide-react';
import { Header } from '../layout/Header';
import { Sidebar } from './Sidebar';
import { Button } from '../ui/Button';
import { AddBookModal } from '../books/AddBookModal';
import { BookCard } from '../books/BookCard';
import { BusinessDropdown } from './BusinessDropdown';
import { OwnerPermissionsPanel } from './OwnerPermissionsPanel';
import { useBooks } from '../../hooks/useBooks';
import { useBusinesses } from '../../hooks/useBusinesses';
import { useAuth } from '../../hooks/useAuth';
import { Business } from '../../types';

export function Dashboard() {
  const { user } = useAuth();
  const { businesses } = useBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const { books, loading, refetch: refetchBooks } = useBooks(selectedBusiness?.id);
  const [sortBy, setSortBy] = useState('Last Updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOwnerPermissions, setShowOwnerPermissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set first business as selected when businesses load
  useEffect(() => {
    if (businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(businesses[0]);
    }
  }, [businesses, selectedBusiness]);

  // Update selected business when businesses change (e.g., new business created)
  useEffect(() => {
    if (selectedBusiness) {
      const updatedBusiness = businesses.find(b => b.id === selectedBusiness.id);
      if (updatedBusiness && updatedBusiness !== selectedBusiness) {
        setSelectedBusiness(updatedBusiness);
      }
    }
  }, [businesses, selectedBusiness]);
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickAddBooks = ['July Expenses', 'Cash Journal', 'Home Expense', 'Staff Salary'];

  const handleBusinessChange = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchBooks();
    } catch (error) {
      console.error('Failed to refresh books:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Header with business selection */}
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <BusinessDropdown
              selectedBusiness={selectedBusiness}
              onBusinessChange={handleBusinessChange}
            />
          </div>

          {/* Main content area */}
          <div className="space-y-4 sm:space-y-6">
            {/* Role notification */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">i</span>
                </div>
                <span className="text-green-800 font-medium text-sm sm:text-base">Your Role: Owner</span>
                <button 
                  onClick={() => setShowOwnerPermissions(true)}
                  className="text-green-600 hover:underline text-xs sm:text-sm"
                >
                  View
                </button>
              </div>
            </div>

            {/* Video tutorial */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white">▶</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">How to use CashBook?</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Learn to use CashBook in a video</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Watch Video →
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
              </div>
            </div>

            {/* Search and add book section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by book name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
                  />
                </div>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option>Last Updated</option>
                  <option>Name</option>
                  <option>Created Date</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing || !selectedBusiness}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  onClick={() => setShowAddModal(true)}
                  disabled={!selectedBusiness}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Book
                </Button>
              </div>
            </div>

            {/* Books list */}
            <div className="space-y-4">
              {!selectedBusiness ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm sm:text-base">Please select a business to view books.</div>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600 text-sm sm:text-base">Loading books...</div>
                </div>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    {searchQuery ? 'No books found matching your search.' : 'No books yet. Create your first book!'}
                  </div>
                </div>
              )}

              {/* Quick add books */}
              {!searchQuery && selectedBusiness && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Add New Book</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Click to quickly add books for</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {quickAddBooks.map((bookName) => (
                      <button
                        key={bookName}
                        onClick={() => setShowAddModal(true)}
                        className="px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm hover:bg-blue-100 transition-colors text-center"
                      >
                        {bookName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help widget */}
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 w-72 sm:w-80 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">💬</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Need help in business setup?</h4>
                <p className="text-xs sm:text-sm text-gray-600">Our support team will help you</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
              Contact Us →
            </button>
          </div>
        </div>
      </div>
    </div>
    
      <AddBookModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        selectedBusiness={selectedBusiness}
      />
      
      <OwnerPermissionsPanel
        isOpen={showOwnerPermissions}
        onClose={() => setShowOwnerPermissions(false)}
      />
    </>
  );
}