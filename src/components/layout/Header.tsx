import { useState } from 'react';
import { ChevronDown, User, LogOut, Download } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">CASHBOOK</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-[calc(100vw-2rem)]">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user?.full_name || 'User'}
                    </div>
                    <div className="text-sm text-blue-600 cursor-pointer hover:underline">
                      Your Profile →
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Mobile App</div>
                <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                  <Download className="w-4 h-4" />
                  <span>Download App</span>
                </button>
              </div>

              <div className="p-4 border-t border-gray-100 text-xs text-gray-500">
                © CashBook • Version 3.18.0
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Backdrop for mobile dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}