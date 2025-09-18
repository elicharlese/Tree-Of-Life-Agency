'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../../libs/shared-utils/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '../../libs/shared-ui/components/Card';
import { Button } from '../../libs/shared-ui/components/Button';
import { Alert } from '../../libs/shared-ui/components/Alert';
import {
  Users,
  UserPlus,
  Briefcase,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  invitations: {
    pending: number;
    accepted: number;
    expired: number;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    inProgress: number;
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data based on user role
      const promises = [];

      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'DEVELOPER') {
        promises.push(
          apiClient.getUsers(),
          apiClient.getInvitations(),
          apiClient.getCustomers(),
          apiClient.getProjects(),
          apiClient.getLeads(),
          apiClient.getOrders(),
          apiClient.getActivities()
        );
      } else if (user?.role === 'AGENT') {
        promises.push(
          apiClient.getCustomers({ assignedTo: user.id }),
          apiClient.getProjects({ assignedTo: user.id }),
          apiClient.getLeads({ assignedTo: user.id }),
          apiClient.getActivities({ userId: user.id })
        );
      } else if (user?.role === 'CLIENT') {
        promises.push(
          apiClient.getProjects(),
          apiClient.getOrders(),
          apiClient.getServices()
        );
      }

      const results = await Promise.allSettled(promises);
      
      // Process results and build stats
      const dashboardStats: DashboardStats = {
        users: { total: 0, active: 0, newThisMonth: 0 },
        invitations: { pending: 0, accepted: 0, expired: 0 },
        customers: { total: 0, active: 0, newThisMonth: 0 },
        projects: { total: 0, active: 0, completed: 0, inProgress: 0 },
        leads: { total: 0, new: 0, qualified: 0, converted: 0 },
        orders: { total: 0, pending: 0, completed: 0, revenue: 0 },
      };

      // Process each result
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          const data = result.value.data;
          
          // Map results based on user role and index
          if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'DEVELOPER') {
            switch (index) {
              case 0: // Users
                if (Array.isArray(data)) {
                  dashboardStats.users.total = data.length;
                  dashboardStats.users.active = data.filter((u: any) => u.isActive).length;
                  dashboardStats.users.newThisMonth = data.filter((u: any) => 
                    new Date(u.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length;
                }
                break;
              case 1: // Invitations
                if (Array.isArray(data)) {
                  dashboardStats.invitations.pending = data.filter((i: any) => i.status === 'PENDING').length;
                  dashboardStats.invitations.accepted = data.filter((i: any) => i.status === 'ACCEPTED').length;
                  dashboardStats.invitations.expired = data.filter((i: any) => i.status === 'EXPIRED').length;
                }
                break;
              case 2: // Customers
                if (Array.isArray(data)) {
                  dashboardStats.customers.total = data.length;
                  dashboardStats.customers.active = data.filter((c: any) => c.status === 'ACTIVE').length;
                  dashboardStats.customers.newThisMonth = data.filter((c: any) => 
                    new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length;
                }
                break;
              case 3: // Projects
                if (Array.isArray(data)) {
                  dashboardStats.projects.total = data.length;
                  dashboardStats.projects.active = data.filter((p: any) => p.status === 'ACTIVE').length;
                  dashboardStats.projects.completed = data.filter((p: any) => p.status === 'COMPLETED').length;
                  dashboardStats.projects.inProgress = data.filter((p: any) => p.status === 'IN_PROGRESS').length;
                }
                break;
              case 4: // Leads
                if (Array.isArray(data)) {
                  dashboardStats.leads.total = data.length;
                  dashboardStats.leads.new = data.filter((l: any) => l.status === 'NEW').length;
                  dashboardStats.leads.qualified = data.filter((l: any) => l.status === 'QUALIFIED').length;
                  dashboardStats.leads.converted = data.filter((l: any) => l.status === 'WON').length;
                }
                break;
              case 5: // Orders
                if (Array.isArray(data)) {
                  dashboardStats.orders.total = data.length;
                  dashboardStats.orders.pending = data.filter((o: any) => o.status === 'PENDING').length;
                  dashboardStats.orders.completed = data.filter((o: any) => o.status === 'COMPLETED').length;
                  dashboardStats.orders.revenue = data.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
                }
                break;
              case 6: // Activities
                if (Array.isArray(data)) {
                  setRecentActivity(data.slice(0, 10));
                }
                break;
            }
          }
        }
      });

      setStats(dashboardStats);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user.firstName}!`;
  };

  const getRoleDashboard = () => {
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'DEVELOPER') {
      return (
        <>
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.users.total || 0}</p>
                  <p className="text-xs text-green-600">+{stats?.users.newThisMonth || 0} this month</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.invitations.pending || 0}</p>
                  <p className="text-xs text-blue-600">{stats?.invitations.accepted || 0} accepted</p>
                </div>
                <UserPlus className="h-8 w-8 text-blue-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.projects.active || 0}</p>
                  <p className="text-xs text-purple-600">{stats?.projects.total || 0} total</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.orders.revenue || 0)}</p>
                  <p className="text-xs text-green-600">{stats?.orders.completed || 0} orders</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Project Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-sm font-medium">{stats?.projects.active || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-sm font-medium">{stats?.projects.inProgress || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-medium">{stats?.projects.completed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Lead Pipeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Leads</span>
                    <span className="text-sm font-medium">{stats?.leads.new || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Qualified</span>
                    <span className="text-sm font-medium">{stats?.leads.qualified || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Converted</span>
                    <span className="text-sm font-medium">{stats?.leads.converted || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      );
    }

    if (user.role === 'AGENT') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">My Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.customers.total || 0}</p>
                <p className="text-xs text-green-600">{stats?.customers.active || 0} active</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">My Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.projects.total || 0}</p>
                <p className="text-xs text-blue-600">{stats?.projects.active || 0} active</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">My Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.leads.total || 0}</p>
                <p className="text-xs text-purple-600">{stats?.leads.new || 0} new</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>
      );
    }

    if (user.role === 'CLIENT') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">My Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.projects.total || 0}</p>
                <p className="text-xs text-blue-600">{stats?.projects.active || 0} active</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">My Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.orders.total || 0}</p>
                <p className="text-xs text-green-600">{formatCurrency(stats?.orders.revenue || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your {user.role.toLowerCase()} account today.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Role-specific Dashboard */}
        {getRoleDashboard()}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-indigo-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        by {activity.user.firstName} {activity.user.lastName} • {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'DEVELOPER') && (
                  <>
                    <Button className="justify-start" leftIcon={<UserPlus className="h-4 w-4" />}>
                      Send Invitation
                    </Button>
                    <Button variant="outline" className="justify-start" leftIcon={<Users className="h-4 w-4" />}>
                      Manage Users
                    </Button>
                  </>
                )}
                {(user.role === 'AGENT' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'DEVELOPER') && (
                  <>
                    <Button variant="outline" className="justify-start" leftIcon={<Briefcase className="h-4 w-4" />}>
                      New Project
                    </Button>
                    <Button variant="outline" className="justify-start" leftIcon={<Mail className="h-4 w-4" />}>
                      Contact Lead
                    </Button>
                  </>
                )}
                {user.role === 'CLIENT' && (
                  <>
                    <Button className="justify-start" leftIcon={<Briefcase className="h-4 w-4" />}>
                      View Services
                    </Button>
                    <Button variant="outline" className="justify-start" leftIcon={<Phone className="h-4 w-4" />}>
                      Contact Support
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
