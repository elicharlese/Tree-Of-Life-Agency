import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PrismaClient } from '@prisma/client';
import { logger } from '../middleware/logging';

const prisma = new PrismaClient();

// Base API client class
abstract class BaseAPIClient {
  protected client: AxiosInstance;
  protected baseURL: string;
  protected apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'User-Agent': 'TreeOfLifeAgency/1.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.addAuthHeaders(config);
        logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('API Request Error', { error });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  protected abstract addAuthHeaders(config: AxiosRequestConfig): void;
}

// Stripe API Client
export class StripeAPIClient extends BaseAPIClient {
  constructor() {
    super('https://api.stripe.com/v1', process.env.STRIPE_SECRET_KEY || '');
  }

  protected addAuthHeaders(config: AxiosRequestConfig): void {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${this.apiKey}`;
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await this.client.post('/customers', data);
      return response.data;
    } catch (error) {
      logger.error('Stripe create customer error', { error, data });
      throw error;
    }
  }

  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customer: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await this.client.post('/payment_intents', data);
      return response.data;
    } catch (error) {
      logger.error('Stripe create payment intent error', { error, data });
      throw error;
    }
  }

  async createSubscription(data: {
    customer: string;
    items: Array<{ price: string; quantity?: number }>;
    metadata?: Record<string, string>;
  }) {
    try {
      const response = await this.client.post('/subscriptions', data);
      return response.data;
    } catch (error) {
      logger.error('Stripe create subscription error', { error, data });
      throw error;
    }
  }

  async retrieveCustomer(customerId: string) {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      logger.error('Stripe retrieve customer error', { error, customerId });
      throw error;
    }
  }
}

// HubSpot API Client
export class HubSpotAPIClient extends BaseAPIClient {
  constructor() {
    super('https://api.hubapi.com', process.env.HUBSPOT_API_KEY || '');
  }

  protected addAuthHeaders(config: AxiosRequestConfig): void {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${this.apiKey}`;
  }

  async createContact(data: {
    email: string;
    firstname: string;
    lastname: string;
    phone?: string;
    company?: string;
  }) {
    try {
      const payload = {
        properties: data,
      };
      const response = await this.client.post('/crm/v3/objects/contacts', payload);
      return response.data;
    } catch (error) {
      logger.error('HubSpot create contact error', { error, data });
      throw error;
    }
  }

  async updateContact(contactId: string, data: Record<string, any>) {
    try {
      const payload = {
        properties: data,
      };
      const response = await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, payload);
      return response.data;
    } catch (error) {
      logger.error('HubSpot update contact error', { error, contactId, data });
      throw error;
    }
  }

  async getContacts(limit = 100, after?: string) {
    try {
      const params: any = { limit };
      if (after) params.after = after;
      
      const response = await this.client.get('/crm/v3/objects/contacts', { params });
      return response.data;
    } catch (error) {
      logger.error('HubSpot get contacts error', { error });
      throw error;
    }
  }
}

// Salesforce API Client
export class SalesforceAPIClient extends BaseAPIClient {
  private instanceUrl: string;
  private accessToken: string | null = null;

  constructor() {
    super('https://login.salesforce.com', '');
    this.instanceUrl = process.env.SALESFORCE_INSTANCE_URL || '';
  }

  protected addAuthHeaders(config: AxiosRequestConfig): void {
    if (this.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }
  }

  async authenticate() {
    try {
      const data = {
        grant_type: 'client_credentials',
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      };

      const response = await this.client.post('/services/oauth2/token', data);
      this.accessToken = response.data.access_token;
      
      // Update client base URL to instance URL
      this.client.defaults.baseURL = `${this.instanceUrl}/services/data/v58.0`;
      
      return this.accessToken;
    } catch (error) {
      logger.error('Salesforce authentication error', { error });
      throw error;
    }
  }

  async createLead(data: {
    FirstName: string;
    LastName: string;
    Email: string;
    Company: string;
    Phone?: string;
    Status?: string;
  }) {
    try {
      if (!this.accessToken) await this.authenticate();
      
      const response = await this.client.post('/sobjects/Lead', data);
      return response.data;
    } catch (error) {
      logger.error('Salesforce create lead error', { error, data });
      throw error;
    }
  }

  async updateLead(leadId: string, data: Record<string, any>) {
    try {
      if (!this.accessToken) await this.authenticate();
      
      const response = await this.client.patch(`/sobjects/Lead/${leadId}`, data);
      return response.data;
    } catch (error) {
      logger.error('Salesforce update lead error', { error, leadId, data });
      throw error;
    }
  }
}

// Zoom API Client
export class ZoomAPIClient extends BaseAPIClient {
  constructor() {
    super('https://api.zoom.us/v2', process.env.ZOOM_JWT_TOKEN || '');
  }

  protected addAuthHeaders(config: AxiosRequestConfig): void {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${this.apiKey}`;
  }

  async createMeeting(data: {
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    agenda?: string;
    settings?: {
      host_video?: boolean;
      participant_video?: boolean;
      join_before_host?: boolean;
      mute_upon_entry?: boolean;
      waiting_room?: boolean;
    };
  }) {
    try {
      const userId = 'me'; // Use 'me' for the authenticated user
      const response = await this.client.post(`/users/${userId}/meetings`, data);
      return response.data;
    } catch (error) {
      logger.error('Zoom create meeting error', { error, data });
      throw error;
    }
  }

  async getMeetings(userId = 'me', type = 'scheduled') {
    try {
      const response = await this.client.get(`/users/${userId}/meetings`, {
        params: { type },
      });
      return response.data;
    } catch (error) {
      logger.error('Zoom get meetings error', { error, userId, type });
      throw error;
    }
  }

  async deleteMeeting(meetingId: string) {
    try {
      const response = await this.client.delete(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      logger.error('Zoom delete meeting error', { error, meetingId });
      throw error;
    }
  }
}

// Slack API Client
export class SlackAPIClient extends BaseAPIClient {
  constructor() {
    super('https://slack.com/api', process.env.SLACK_BOT_TOKEN || '');
  }

  protected addAuthHeaders(config: AxiosRequestConfig): void {
    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Bearer ${this.apiKey}`;
  }

  async postMessage(data: {
    channel: string;
    text: string;
    blocks?: any[];
    attachments?: any[];
  }) {
    try {
      const response = await this.client.post('/chat.postMessage', data);
      return response.data;
    } catch (error) {
      logger.error('Slack post message error', { error, data });
      throw error;
    }
  }

  async getChannels() {
    try {
      const response = await this.client.get('/conversations.list');
      return response.data;
    } catch (error) {
      logger.error('Slack get channels error', { error });
      throw error;
    }
  }

  async getUserInfo(userId: string) {
    try {
      const response = await this.client.get('/users.info', {
        params: { user: userId },
      });
      return response.data;
    } catch (error) {
      logger.error('Slack get user info error', { error, userId });
      throw error;
    }
  }
}

// Integration service to manage all third-party integrations
export class IntegrationService {
  private stripe = new StripeAPIClient();
  private hubspot = new HubSpotAPIClient();
  private salesforce = new SalesforceAPIClient();
  private zoom = new ZoomAPIClient();
  private slack = new SlackAPIClient();

  // Sync customer to HubSpot
  async syncCustomerToHubSpot(customerId: string): Promise<void> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const hubspotContact = await this.hubspot.createContact({
        email: customer.email,
        firstname: customer.firstName,
        lastname: customer.lastName,
        phone: customer.phone || '',
        company: customer.company || '',
      });

      // Store HubSpot contact ID
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          integrationIds: {
            ...customer.integrationIds as any,
            hubspotContactId: hubspotContact.id,
          },
        },
      });

      logger.info('Customer synced to HubSpot', { 
        customerId, 
        hubspotContactId: hubspotContact.id 
      });
    } catch (error) {
      logger.error('HubSpot customer sync error', { error, customerId });
      throw error;
    }
  }

  // Sync lead to Salesforce
  async syncLeadToSalesforce(leadId: string): Promise<void> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      const salesforceLead = await this.salesforce.createLead({
        FirstName: lead.firstName,
        LastName: lead.lastName,
        Email: lead.email,
        Company: lead.company || 'Unknown',
        Phone: lead.phone || '',
        Status: 'New',
      });

      // Store Salesforce lead ID
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          integrationIds: {
            ...lead.integrationIds as any,
            salesforceLeadId: salesforceLead.id,
          },
        },
      });

      logger.info('Lead synced to Salesforce', { 
        leadId, 
        salesforceLeadId: salesforceLead.id 
      });
    } catch (error) {
      logger.error('Salesforce lead sync error', { error, leadId });
      throw error;
    }
  }

  // Create Stripe customer for payment processing
  async createStripeCustomer(customerId: string): Promise<string> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const stripeCustomer = await this.stripe.createCustomer({
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone || '',
        metadata: {
          crmCustomerId: customerId,
        },
      });

      // Store Stripe customer ID
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          integrationIds: {
            ...customer.integrationIds as any,
            stripeCustomerId: stripeCustomer.id,
          },
        },
      });

      logger.info('Stripe customer created', { 
        customerId, 
        stripeCustomerId: stripeCustomer.id 
      });

      return stripeCustomer.id;
    } catch (error) {
      logger.error('Stripe customer creation error', { error, customerId });
      throw error;
    }
  }

  // Schedule Zoom meeting
  async scheduleZoomMeeting(data: {
    topic: string;
    start_time: string;
    duration: number;
    agenda?: string;
  }): Promise<any> {
    try {
      const meeting = await this.zoom.createMeeting({
        ...data,
        type: 2, // Scheduled meeting
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        },
      });

      logger.info('Zoom meeting scheduled', { 
        meetingId: meeting.id,
        topic: data.topic 
      });

      return meeting;
    } catch (error) {
      logger.error('Zoom meeting scheduling error', { error, data });
      throw error;
    }
  }

  // Send Slack notification
  async sendSlackNotification(channel: string, message: string): Promise<void> {
    try {
      await this.slack.postMessage({
        channel,
        text: message,
      });

      logger.info('Slack notification sent', { channel, message });
    } catch (error) {
      logger.error('Slack notification error', { error, channel, message });
      throw error;
    }
  }

  // Get all available integrations and their status
  async getIntegrationStatus(): Promise<Record<string, boolean>> {
    const integrations = {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      hubspot: !!process.env.HUBSPOT_API_KEY,
      salesforce: !!(process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET),
      zoom: !!process.env.ZOOM_JWT_TOKEN,
      slack: !!process.env.SLACK_BOT_TOKEN,
    };

    return integrations;
  }
}

export const integrationService = new IntegrationService();
