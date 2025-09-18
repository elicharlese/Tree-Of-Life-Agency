'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '../../libs/shared-ui/components/Button';
import { Input } from '../../libs/shared-ui/components/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../libs/shared-ui/components/card';
import { Badge } from '../../libs/shared-ui/components/Badge';
import { Avatar } from '../../libs/shared-ui/components/Avatar';
import { useAuth } from '../../../libs/shared-ui/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';
  source: string;
  totalValue: number;
  assignedUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    projects: number;
    orders: number;
  };
  createdAt: string;
}

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  PROSPECT: 'warning',
  CHURNED: 'destructive',
} as const;

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/crm/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.data.customers);
      setPagination(prev => ({
        ...prev,
        total: data.data.pagination.total,
        totalPages: data.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, searchQuery, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">
            Manage your customer relationships and track interactions
          </p>
        </div>
        <Button href="/crm/customers/new" className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('ACTIVE')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'PROSPECT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('PROSPECT')}
              >
                Prospects
              </Button>
              <Button
                variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('INACTIVE')}
              >
                Inactive
              </Button>
              <Button
                variant={statusFilter === 'CHURNED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter('CHURNED')}
              >
                Churned
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      {customers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FunnelIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by adding your first customer.'
              }
            </p>
            {!searchQuery && !statusFilter && (
              <Button href="/crm/customers/new">Add Customer</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${customer.firstName}+${customer.lastName}&background=random`}
                      alt={`${customer.firstName} ${customer.lastName}`}
                      className="h-12 w-12"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <Badge variant={statusColors[customer.status]}>
                          {customer.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{customer.email}</p>
                        {customer.phone && <p>{customer.phone}</p>}
                        {customer.company && (
                          <p className="font-medium">{customer.company}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>Source: {customer.source}</span>
                        <span>•</span>
                        <span>{customer._count.projects} Projects</span>
                        <span>•</span>
                        <span>{customer._count.orders} Orders</span>
                        <span>•</span>
                        <span>Added {formatDate(customer.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {formatCurrency(customer.totalValue)}
                    </div>
                    <div className="text-sm text-gray-500">Total Value</div>
                    
                    {customer.assignedUser && (
                      <div className="text-xs text-gray-400 mt-2">
                        Assigned to {customer.assignedUser.firstName} {customer.assignedUser.lastName}
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        href={`/crm/customers/${customer.id}`}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        href={`/crm/customers/${customer.id}/edit`}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
