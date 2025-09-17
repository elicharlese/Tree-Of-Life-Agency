// API Client utility for consistent API calls across the application

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (requireAuth) {
      Object.assign(requestHeaders, this.getAuthHeaders());
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Clear invalid token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
          // Redirect to login if we're in the browser
          if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
        }

        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      requireAuth: false,
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    invitationToken: string;
  }) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: userData,
      requireAuth: false,
    });
  }

  async logout() {
    const result = await this.makeRequest('/auth/logout', {
      method: 'POST',
    });
    
    // Clear local storage regardless of API response
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    
    return result;
  }

  async forgotPassword(email: string) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      requireAuth: false,
    });
  }

  async resetPassword(token: string, password: string) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      requireAuth: false,
    });
  }

  // User management
  async getCurrentUser() {
    return this.makeRequest('/auth/me');
  }

  async getUsers(params?: { role?: string; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getUser(id: string) {
    return this.makeRequest(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id: string) {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Invitation management
  async getInvitations(params?: { status?: string; role?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.role) queryParams.append('role', params.role);
    
    const endpoint = `/invitations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async createInvitation(invitationData: { email: string; role: string }) {
    return this.makeRequest('/invitations', {
      method: 'POST',
      body: invitationData,
    });
  }

  async deleteInvitation(id: string) {
    return this.makeRequest(`/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  async resendInvitation(id: string) {
    return this.makeRequest(`/invitations/${id}/resend`, {
      method: 'POST',
    });
  }

  // Customer management
  async getCustomers(params?: { status?: string; assignedTo?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getCustomer(id: string) {
    return this.makeRequest(`/customers/${id}`);
  }

  async createCustomer(customerData: any) {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: customerData,
    });
  }

  async updateCustomer(id: string, customerData: any) {
    return this.makeRequest(`/customers/${id}`, {
      method: 'PUT',
      body: customerData,
    });
  }

  async deleteCustomer(id: string) {
    return this.makeRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Project management
  async getProjects(params?: { status?: string; customerId?: string; assignedTo?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    
    const endpoint = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getProject(id: string) {
    return this.makeRequest(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.makeRequest('/projects', {
      method: 'POST',
      body: projectData,
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.makeRequest(`/projects/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  }

  async deleteProject(id: string) {
    return this.makeRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Service management
  async getServices(params?: { category?: string; isActive?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const endpoint = `/services${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint, { requireAuth: false });
  }

  async getService(id: string) {
    return this.makeRequest(`/services/${id}`, { requireAuth: false });
  }

  async createService(serviceData: any) {
    return this.makeRequest('/services', {
      method: 'POST',
      body: serviceData,
    });
  }

  async updateService(id: string, serviceData: any) {
    return this.makeRequest(`/services/${id}`, {
      method: 'PUT',
      body: serviceData,
    });
  }

  async deleteService(id: string) {
    return this.makeRequest(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  // Lead management
  async getLeads(params?: { status?: string; source?: string; assignedTo?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    
    const endpoint = `/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getLead(id: string) {
    return this.makeRequest(`/leads/${id}`);
  }

  async createLead(leadData: any) {
    return this.makeRequest('/leads', {
      method: 'POST',
      body: leadData,
      requireAuth: false, // Allow public lead creation
    });
  }

  async updateLead(id: string, leadData: any) {
    return this.makeRequest(`/leads/${id}`, {
      method: 'PUT',
      body: leadData,
    });
  }

  async deleteLead(id: string) {
    return this.makeRequest(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Activity management
  async getActivities(params?: { entityType?: string; entityId?: string; userId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.entityId) queryParams.append('entityId', params.entityId);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const endpoint = `/activities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Order management
  async getOrders(params?: { status?: string; customerId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    
    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getOrder(id: string) {
    return this.makeRequest(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  async updateOrder(id: string, orderData: any) {
    return this.makeRequest(`/orders/${id}`, {
      method: 'PUT',
      body: orderData,
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health', { requireAuth: false });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };

// Export types for use in components
export type { ApiResponse, ApiRequestOptions };
