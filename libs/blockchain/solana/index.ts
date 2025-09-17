// Solana Blockchain Integration Library
// Following Windsurf Global Rules for blockchain utilities

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Solana Configuration
export const SOLANA_NETWORKS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
  localhost: 'http://localhost:8899',
} as const;

export type SolanaNetwork = keyof typeof SOLANA_NETWORKS;

// Wallet Connection Interface
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}

// Solana Service Class
export class SolanaService {
  private connection: Connection;
  private network: SolanaNetwork;

  constructor(network: SolanaNetwork = 'devnet') {
    this.network = network;
    this.connection = new Connection(SOLANA_NETWORKS[network], 'confirmed');
  }

  // Get connection instance
  getConnection(): Connection {
    return this.connection;
  }

  // Get network info
  getNetwork(): SolanaNetwork {
    return this.network;
  }

  // Get account balance in SOL
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch account balance');
    }
  }

  // Get account info
  async getAccountInfo(publicKey: PublicKey) {
    try {
      return await this.connection.getAccountInfo(publicKey);
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw new Error('Failed to fetch account info');
    }
  }

  // Send SOL transaction
  async sendSol(
    fromWallet: WalletAdapter,
    toPublicKey: PublicKey,
    amount: number
  ): Promise<string> {
    if (!fromWallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromWallet.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await this.connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromWallet.publicKey;

      const signedTransaction = await fromWallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw new Error('Failed to send SOL transaction');
    }
  }

  // Get transaction details
  async getTransaction(signature: string) {
    try {
      return await this.connection.getTransaction(signature);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  // Get transaction history for an account
  async getTransactionHistory(publicKey: PublicKey, limit: number = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(sig => this.connection.getTransaction(sig.signature))
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  // Validate Solana address
  static isValidAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  // Convert lamports to SOL
  static lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  // Convert SOL to lamports
  static solToLamports(sol: number): number {
    return sol * LAMPORTS_PER_SOL;
  }

  // Format SOL amount for display
  static formatSol(amount: number, decimals: number = 4): string {
    return amount.toFixed(decimals) + ' SOL';
  }

  // Shorten address for display
  static shortenAddress(address: string, chars: number = 4): string {
    if (address.length <= chars * 2) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }
}

// Payment Processing for Services
export class SolanaPaymentProcessor {
  private solanaService: SolanaService;

  constructor(network: SolanaNetwork = 'devnet') {
    this.solanaService = new SolanaService(network);
  }

  // Process service payment
  async processServicePayment(
    customerWallet: WalletAdapter,
    serviceProviderAddress: string,
    amount: number,
    serviceId: string
  ): Promise<{
    signature: string;
    success: boolean;
    error?: string;
  }> {
    try {
      if (!SolanaService.isValidAddress(serviceProviderAddress)) {
        throw new Error('Invalid service provider address');
      }

      const providerPublicKey = new PublicKey(serviceProviderAddress);
      const signature = await this.solanaService.sendSol(
        customerWallet,
        providerPublicKey,
        amount
      );

      // Here you would typically also record the payment in your database
      // and update the order status

      return {
        signature,
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // Verify payment
  async verifyPayment(signature: string): Promise<boolean> {
    try {
      const transaction = await this.solanaService.getTransaction(signature);
      return transaction !== null;
    } catch {
      return false;
    }
  }

  // Get payment details
  async getPaymentDetails(signature: string) {
    try {
      return await this.solanaService.getTransaction(signature);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  }
}

// Escrow Service for Secure Payments
export class SolanaEscrowService {
  private solanaService: SolanaService;

  constructor(network: SolanaNetwork = 'devnet') {
    this.solanaService = new SolanaService(network);
  }

  // Create escrow account (simplified - in production you'd use a proper escrow program)
  async createEscrow(
    customerWallet: WalletAdapter,
    amount: number,
    serviceId: string
  ): Promise<{
    escrowAddress: string;
    signature: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // This is a simplified implementation
      // In production, you'd deploy and use a proper escrow smart contract
      
      // For now, we'll create a temporary account
      // In reality, this would be handled by an escrow program
      
      return {
        escrowAddress: 'temp_escrow_address',
        signature: 'temp_signature',
        success: true,
      };
    } catch (error) {
      return {
        escrowAddress: '',
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Escrow creation failed',
      };
    }
  }

  // Release escrow funds
  async releaseEscrow(
    escrowAddress: string,
    serviceProviderAddress: string
  ): Promise<{
    signature: string;
    success: boolean;
    error?: string;
  }> {
    try {
      // Implementation for releasing escrow funds
      // This would interact with the escrow program
      
      return {
        signature: 'release_signature',
        success: true,
      };
    } catch (error) {
      return {
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Escrow release failed',
      };
    }
  }
}

// Export main classes and utilities
export { SolanaService, SolanaPaymentProcessor, SolanaEscrowService };

// Export types
export type { WalletAdapter };

// Export constants
export { SOLANA_NETWORKS, LAMPORTS_PER_SOL };
