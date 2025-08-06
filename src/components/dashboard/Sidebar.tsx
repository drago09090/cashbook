import { useState } from 'react';
import { ChevronDown, Book, Settings, Users, HelpCircle, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookKeepingOpen, setBookKeepingOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0 hidden lg:block">
      <div className="p-4">
        {/* Book Keeping Section */}
        <div className="mb-4">
          <button
            onClick={() => setBookKeepingOpen(!bookKeepingOpen)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Book Keeping
            <ChevronDown className={`w-4 h-4 transition-transform ${bookKeepingOpen ? 'rotate-180' : ''}`} />
          </button>
          {bookKeepingOpen && (
            <div className="mt-2 ml-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-lg mb-1 transition-colors ${
                  isActive('/dashboard') && !isActive('/invoices')
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Book className="w-4 h-4" />
                <span>Cashbooks</span>
              </button>
              <button 
                onClick={() => navigate('/invoices')}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/invoices')
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Invoices</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="mb-4">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Settings
            <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {settingsOpen && (
            <div className="mt-2 ml-2 space-y-1">
              <button 
                onClick={() => navigate('/team')}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/team')
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>
              <button 
                onClick={() => navigate('/business-settings')}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive('/business-settings')
                    ? 'text-white bg-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Business Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Others Section */}
        <div className="mb-4">
          <button
            onClick={() => setOthersOpen(!othersOpen)}
            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Others
            <ChevronDown className={`w-4 h-4 transition-transform ${othersOpen ? 'rotate-180' : ''}`} />
          </button>
          {othersOpen && (
            <div className="mt-2 ml-2">
              <button className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}