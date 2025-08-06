import { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { Header } from '../layout/Header';
import { Sidebar } from '../dashboard/Sidebar';
import { Button } from '../ui/Button';
import { AddTeamMemberPanel } from './AddTeamMemberPanel';
import { RolesPermissionsPanel } from './RolesPermissionsPanel';
import { useAuth } from '../../hooks/useAuth';

export function TeamPage() {
  const { user } = useAuth();
  const [showAddMemberPanel, setShowAddMemberPanel] = useState(false);
  const [showRolesPanel, setShowRolesPanel] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {/* Business Team Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Business Team</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Add your business partners or staffs to this business and manage cashflow together
                </p>
              </div>
              <Button 
                onClick={() => setShowAddMemberPanel(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2 w-full sm:w-auto"
              >
                <Users className="w-4 h-4" />
                <span>Add team member</span>
              </Button>
            </div>

            {/* Total Members and View Roles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Total Members (1)</h2>
              <button 
                onClick={() => setShowRolesPanel(true)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <span>View roles & permissions</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Team Structure */}
          <div className="bg-white rounded-lg p-4 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Add members & Assign Roles</h3>
              <p className="text-sm sm:text-base text-gray-600">Give access to limited features & books</p>
            </div>

            {/* Team Hierarchy Diagram */}
            <div className="flex flex-col items-center space-y-6 sm:space-y-8">
              {/* Owner (You) */}
              <div className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">You (Owner)</div>
                </div>
              </div>

              {/* Connection Lines */}
              <div className="hidden sm:flex items-center space-x-32">
                {/* Left Line */}
                <div className="w-24 h-px bg-gray-300 relative">
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-2 border-gray-300 border-l-0 border-b-0 transform rotate-45"></div>
                </div>
                
                {/* Right Line */}
                <div className="w-24 h-px bg-gray-300 relative">
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-2 border-gray-300 border-r-0 border-b-0 transform -rotate-45"></div>
                </div>
              </div>

              {/* Business Partner and Staff Members */}
              <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-32">
                {/* Business Partner */}
                <div className="flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-3">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl">P</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Business Partner</div>
                    <div className="text-xs sm:text-sm text-gray-500">(Full access)</div>
                  </div>
                </div>

                {/* Staff Members */}
                <div className="flex flex-col items-center">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full flex items-center justify-center mb-3">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg sm:text-xl">S</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Staff Members</div>
                    <div className="text-xs sm:text-sm text-gray-500">(Limited access)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Team Member Panel */}
      <AddTeamMemberPanel
        isOpen={showAddMemberPanel}
        onClose={() => setShowAddMemberPanel(false)}
      />

      {/* Roles & Permissions Panel */}
      <RolesPermissionsPanel
        isOpen={showRolesPanel}
        onClose={() => setShowRolesPanel(false)}
      />
    </div>
  );
}