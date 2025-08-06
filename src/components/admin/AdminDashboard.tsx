import { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  Book, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Activity,
  Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalCashbooks: number;
  totalInvoices: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  recentActivities: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalCashbooks: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch businesses count
      const { count: businessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      // Fetch cashbooks count
      const { count: cashbooksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      // Fetch invoices count
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Fetch active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Fetch new users this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch total revenue from invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid');

      const totalRevenue = invoicesData?.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0) || 0;

      // Fetch recent activities (recent users, businesses, etc.)
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersCount || 0,
        totalBusinesses: businessesCount || 0,
        totalCashbooks: cashbooksCount || 0,
        totalInvoices: invoicesCount || 0,
        totalRevenue,
        activeUsers: activeUsersCount || 0,
        newUsersThisMonth: newUsersCount || 0,
        recentActivities: recentUsers || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the CashBook Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats.newUsersThisMonth}</span>
            <span className="text-gray-600 ml-2">new this month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBusinesses.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-blue-600 font-medium">{stats.activeUsers}</span>
            <span className="text-gray-600 ml-2">active users</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cashbooks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCashbooks.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Book className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">Growing</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">{stats.totalInvoices} invoices</span>
          </div>
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            </div>
          </div>
          <div className="p-6">
            {stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || 'New User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-xs text-gray-500">View and edit users</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Building className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Businesses</p>
                <p className="text-xs text-gray-500">Monitor businesses</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Book className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Cashbooks</p>
                <p className="text-xs text-gray-500">View all cashbooks</p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="w-6 h-6 text-yellow-600 mb-2" />
                <p className="font-medium text-gray-900">Invoices</p>
                <p className="text-xs text-gray-500">Manage invoices</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}