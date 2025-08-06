import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Mail, 
  Bell, 
  Users,
  Lock,
  Save
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export function AdminSettings() {
  const { admin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // General Settings
  const [siteName, setSiteName] = useState('CashBook Admin');
  const [siteDescription, setSiteDescription] = useState('Admin panel for CashBook application');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Email Settings
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [requireTwoFactor, setRequireTwoFactor] = useState(false);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserNotifications, setNewUserNotifications] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'database', name: 'Database', icon: Database },
  ];

  const handleSaveSettings = async () => {
    setLoading(true);
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-1">Configure system settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200">
            {success && (
              <div className="p-4 bg-green-50 border-b border-green-200">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            <div className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Site Name"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Enter site name"
                      />
                      <Input
                        label="Site Description"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        placeholder="Enter site description"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">System Status</h3>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="maintenance"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="maintenance" className="text-sm text-gray-700">
                        Enable maintenance mode
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, only administrators can access the system
                    </p>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Session Timeout (hours)"
                        type="number"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        placeholder="24"
                      />
                      <Input
                        label="Max Login Attempts"
                        type="number"
                        value={maxLoginAttempts}
                        onChange={(e) => setMaxLoginAttempts(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Authentication</h3>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="twoFactor"
                        checked={requireTwoFactor}
                        onChange={(e) => setRequireTwoFactor(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="twoFactor" className="text-sm text-gray-700">
                        Require two-factor authentication for all admins
                      </label>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Security Recommendations</h4>
                        <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                          <li>• Use strong passwords with at least 12 characters</li>
                          <li>• Enable two-factor authentication</li>
                          <li>• Regularly review admin access logs</li>
                          <li>• Keep session timeouts reasonable</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="SMTP Host"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                      <Input
                        label="SMTP Port"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(e.target.value)}
                        placeholder="587"
                      />
                      <Input
                        label="SMTP Username"
                        value={smtpUsername}
                        onChange={(e) => setSmtpUsername(e.target.value)}
                        placeholder="your-email@gmail.com"
                      />
                      <Input
                        label="SMTP Password"
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Your app password"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Email Setup Guide</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Configure SMTP settings to enable email notifications for user registrations, 
                          password resets, and system alerts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-xs text-gray-500">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">New User Registrations</h3>
                          <p className="text-xs text-gray-500">Get notified when new users register</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={newUserNotifications}
                          onChange={(e) => setNewUserNotifications(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">System Alerts</h3>
                          <p className="text-xs text-gray-500">Receive alerts about system issues</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={systemAlerts}
                          onChange={(e) => setSystemAlerts(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Settings */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Database Status</h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Connected</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Last Backup</h3>
                        <p className="text-sm text-gray-700">Never</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Database Actions</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full md:w-auto">
                        Create Backup
                      </Button>
                      <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-3">
                        Optimize Database
                      </Button>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Database className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Database Maintenance</h4>
                        <p className="text-sm text-red-800 mt-1">
                          Regular database maintenance is recommended to ensure optimal performance. 
                          Always create backups before performing maintenance operations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}