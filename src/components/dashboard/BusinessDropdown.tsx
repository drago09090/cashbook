import { useState } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBusinesses } from '../../hooks/useBusinesses';
import { Business } from '../../types';
import { Button } from '../ui/Button';
import { AddBusinessPanel } from '../business/AddBusinessPanel';

interface BusinessDropdownProps {
  selectedBusiness: Business | null;
  onBusinessChange: (business: Business) => void;
}

export function BusinessDropdown({ selectedBusiness, onBusinessChange }: BusinessDropdownProps) {
  const { user } = useAuth();
  const { businesses } = useBusinesses();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBusinessPanel, setShowAddBusinessPanel] = useState(false);

  // Create businesses list - include user's personal business if they have one
  const businessesList = businesses;

  const filteredBusinesses = businessesList.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBusinessSelect = (business: Business) => {
    onBusinessChange(business);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddNewBusiness = () => {
    setIsOpen(false);
    setShowAddBusinessPanel(true);
  };

  const handleBusinessCreated = (business: Business) => {
    onBusinessChange(business);
  };

  return (
    <>
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center min-w-[160px] sm:min-w-[200px] bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
      >
        <span className="flex-1 truncate">{selectedBusiness?.name || 'Select Business'}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-[calc(100vw-2rem)]">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Business"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Business List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredBusinesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleBusinessSelect(business)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-900 truncate">{business.name}</span>
              </button>
            ))}
            {filteredBusinesses.length === 0 && (
              <div className="px-4 py-3 text-xs sm:text-sm text-gray-500 text-center">
                {searchQuery ? 'No businesses found' : 'No businesses yet'}
              </div>
            )}
          </div>

          {/* Add New Business Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleAddNewBusiness}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Business</span>
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>

    {/* Add Business Panel */}
    <AddBusinessPanel
      isOpen={showAddBusinessPanel}
      onClose={() => setShowAddBusinessPanel(false)}
      onBusinessCreated={handleBusinessCreated}
    />
    </>
  );
}