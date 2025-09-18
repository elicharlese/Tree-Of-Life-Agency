import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ApiService } from './ApiService';
import { store } from '../store';
import { 
  setCustomers, 
  setLeads, 
  setProjects, 
  setMessages,
  addOfflineAction,
  removeOfflineAction,
  updateSyncStatus 
} from '../store/slices';

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'customer' | 'lead' | 'project' | 'message' | 'communication';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface SyncStatus {
  lastSync: number;
  isActive: boolean;
  pendingOperations: number;
  failedOperations: number;
}

class SyncServiceClass {
  private syncQueue: SyncOperation[] = [];
  private isConnected = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private syncIntervalMs = 30000; // 30 seconds

  async initialize(): Promise<void> {
    try {
      // Load pending operations from storage
      await this.loadPendingOperations();

      // Set up network monitoring
      const unsubscribe = NetInfo.addEventListener(state => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected ?? false;

        // If connection restored, trigger sync
        if (!wasConnected && this.isConnected) {
          this.triggerFullSync();
        }
      });

      // Start periodic sync
      this.startPeriodicSync();

      console.log('Sync service initialized');
    } catch (error) {
      console.error('Sync service initialization error:', error);
    }
  }

  async triggerFullSync(): Promise<void> {
    if (!this.isConnected) {
      console.log('Skipping sync - no network connection');
      return;
    }

    try {
      store.dispatch(updateSyncStatus({ isActive: true }));

      // Process offline actions first
      await this.processOfflineActions();

      // Sync all entities
      await Promise.all([
        this.syncCustomers(),
        this.syncLeads(),
        this.syncProjects(),
        this.syncMessages(),
      ]);

      // Update last sync time
      const lastSync = Date.now();
      await AsyncStorage.setItem('@last_sync', lastSync.toString());
      
      store.dispatch(updateSyncStatus({ 
        lastSync, 
        isActive: false,
        pendingOperations: this.syncQueue.length 
      }));

      console.log('Full sync completed');
    } catch (error) {
      console.error('Full sync error:', error);
      store.dispatch(updateSyncStatus({ 
        isActive: false,
        failedOperations: this.syncQueue.length 
      }));
    }
  }

  async syncCustomers(): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTime();
      const params = lastSync ? `?since=${new Date(lastSync).toISOString()}` : '';
      
      const response = await ApiService.get(`/crm/customers${params}`);
      
      if (response.success) {
        store.dispatch(setCustomers(response.data.customers));
        await this.storeLocalData('customers', response.data.customers);
      }
    } catch (error) {
      console.error('Customer sync error:', error);
      // Load from local storage as fallback
      const localCustomers = await this.getLocalData('customers');
      if (localCustomers) {
        store.dispatch(setCustomers(localCustomers));
      }
    }
  }

  async syncLeads(): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTime();
      const params = lastSync ? `?since=${new Date(lastSync).toISOString()}` : '';
      
      const response = await ApiService.get(`/crm/leads${params}`);
      
      if (response.success) {
        store.dispatch(setLeads(response.data.leads));
        await this.storeLocalData('leads', response.data.leads);
      }
    } catch (error) {
      console.error('Lead sync error:', error);
      const localLeads = await this.getLocalData('leads');
      if (localLeads) {
        store.dispatch(setLeads(localLeads));
      }
    }
  }

  async syncProjects(): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTime();
      const params = lastSync ? `?since=${new Date(lastSync).toISOString()}` : '';
      
      const response = await ApiService.get(`/crm/projects${params}`);
      
      if (response.success) {
        store.dispatch(setProjects(response.data.projects));
        await this.storeLocalData('projects', response.data.projects);
      }
    } catch (error) {
      console.error('Project sync error:', error);
      const localProjects = await this.getLocalData('projects');
      if (localProjects) {
        store.dispatch(setProjects(localProjects));
      }
    }
  }

  async syncMessages(): Promise<void> {
    try {
      const lastSync = await this.getLastSyncTime();
      const params = lastSync ? `?since=${new Date(lastSync).toISOString()}` : '';
      
      const response = await ApiService.get(`/communication/messages${params}`);
      
      if (response.success) {
        store.dispatch(setMessages(response.data.messages));
        await this.storeLocalData('messages', response.data.messages);
      }
    } catch (error) {
      console.error('Message sync error:', error);
      const localMessages = await this.getLocalData('messages');
      if (localMessages) {
        store.dispatch(setMessages(localMessages));
      }
    }
  }

  async addOfflineOperation(
    type: SyncOperation['type'],
    entity: SyncOperation['entity'],
    data: any
  ): Promise<string> {
    const operation: SyncOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(operation);
    store.dispatch(addOfflineAction(operation));
    
    await this.storePendingOperations();

    // Try to process immediately if connected
    if (this.isConnected) {
      this.processOfflineActions();
    }

    return operation.id;
  }

  private async processOfflineActions(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    console.log(`Processing ${this.syncQueue.length} offline operations`);

    const operations = [...this.syncQueue];
    const processedIds: string[] = [];

    for (const operation of operations) {
      try {
        await this.processSingleOperation(operation);
        processedIds.push(operation.id);
        store.dispatch(removeOfflineAction(operation.id));
      } catch (error) {
        console.error(`Operation ${operation.id} failed:`, error);
        
        operation.retryCount++;
        if (operation.retryCount >= this.maxRetries) {
          console.error(`Operation ${operation.id} exceeded max retries, removing`);
          processedIds.push(operation.id);
          store.dispatch(removeOfflineAction(operation.id));
        }
      }
    }

    // Remove processed operations from queue
    this.syncQueue = this.syncQueue.filter(op => !processedIds.includes(op.id));
    await this.storePendingOperations();
  }

  private async processSingleOperation(operation: SyncOperation): Promise<void> {
    const { type, entity, data } = operation;
    const endpoint = this.getEndpoint(entity);

    switch (type) {
      case 'CREATE':
        await ApiService.post(endpoint, data);
        break;
      case 'UPDATE':
        await ApiService.put(`${endpoint}/${data.id}`, data);
        break;
      case 'DELETE':
        await ApiService.delete(`${endpoint}/${data.id}`);
        break;
    }
  }

  private getEndpoint(entity: SyncOperation['entity']): string {
    const endpoints = {
      customer: '/crm/customers',
      lead: '/crm/leads',
      project: '/crm/projects',
      message: '/communication/messages',
      communication: '/communication/logs',
    };
    return endpoints[entity];
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isConnected) {
        this.triggerFullSync();
      }
    }, this.syncIntervalMs);
  }

  private async getLastSyncTime(): Promise<number | null> {
    try {
      const lastSync = await AsyncStorage.getItem('@last_sync');
      return lastSync ? parseInt(lastSync, 10) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  private async storeLocalData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`@local_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing local ${key}:`, error);
    }
  }

  private async getLocalData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(`@local_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting local ${key}:`, error);
      return null;
    }
  }

  private async storePendingOperations(): Promise<void> {
    try {
      await AsyncStorage.setItem('@pending_operations', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error storing pending operations:', error);
    }
  }

  private async loadPendingOperations(): Promise<void> {
    try {
      const operations = await AsyncStorage.getItem('@pending_operations');
      if (operations) {
        this.syncQueue = JSON.parse(operations);
        console.log(`Loaded ${this.syncQueue.length} pending operations`);
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
    }
  }

  // Conflict resolution
  async resolveConflict(
    localData: any,
    serverData: any,
    strategy: 'server' | 'local' | 'merge' = 'server'
  ): Promise<any> {
    switch (strategy) {
      case 'server':
        return serverData;
      case 'local':
        return localData;
      case 'merge':
        return {
          ...serverData,
          ...localData,
          updatedAt: Math.max(
            new Date(localData.updatedAt).getTime(),
            new Date(serverData.updatedAt).getTime()
          ),
        };
      default:
        return serverData;
    }
  }

  // Clean up resources
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Get sync statistics
  getSyncStats(): SyncStatus {
    const state = store.getState();
    return {
      lastSync: state.sync.lastSync,
      isActive: state.sync.isActive,
      pendingOperations: this.syncQueue.length,
      failedOperations: this.syncQueue.filter(op => op.retryCount >= this.maxRetries).length,
    };
  }
}

export const SyncService = new SyncServiceClass();
