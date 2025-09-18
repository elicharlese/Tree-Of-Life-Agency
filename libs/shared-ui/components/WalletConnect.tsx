'use client';

import { useState } from 'react';
import { useAddress } from '@thirdweb-dev/react';
// Simple button component inline
const Button = ({ children, onClick, disabled, className }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`px-4 py-2 rounded font-medium ${className || ''}`}
  >
    {children}
  </button>
);

export default function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const address = useAddress();
  // const connect = useConnect(); // Unused for now

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // ThirdWeb v4 connection would be handled differently
      console.log('Connect wallet clicked');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // ThirdWeb v4 disconnect would be handled differently
      console.log('Disconnect wallet clicked');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (address) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800">
            {formatAddress(address)}
          </span>
        </div>
        <Button 
          onClick={handleDisconnect}
          className="px-4 py-2 border border-gray-300 rounded text-sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
