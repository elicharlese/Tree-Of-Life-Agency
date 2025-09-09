'use client';

import { useState } from 'react';
import { useAddress, useWallet } from '@thirdweb-dev/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'react-hot-toast';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({ 
  orderId, 
  amount, 
  currency = 'usd',
  onSuccess,
  onError 
}: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const address = useAddress();
  const wallet = useWallet();

  const handleCardPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Create payment intent
      const response = await fetch('/api/v1/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          description: `Payment for order ${orderId}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // In a real implementation, you would integrate with Stripe Elements here
      toast.success('Payment intent created successfully');
      onSuccess?.(data.data.paymentIntentId);
      
    } catch (error: unknown) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!address || !wallet) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);

      // Sign a message to verify wallet ownership
      const message = `Authenticate payment for order ${orderId} - Amount: ${amount} ${currency.toUpperCase()}`;
      
      // Note: ThirdWeb v4 doesn't have direct sign method
      // This would need to be implemented with proper wallet signing
      const signature = 'placeholder-signature'; // TODO: Implement proper wallet signing

      // Send wallet authentication to backend
      const response = await fetch('/api/v1/auth/connect-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          signature,
          message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wallet authentication failed');
      }

      toast.success('Wallet payment processed successfully');
      onSuccess?.(data.data.paymentIntentId);
      
    } catch (error: unknown) {
      console.error('Wallet payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Wallet payment failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Order ID: {orderId}</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="w-full"
              >
                Credit Card
              </Button>
              <Button
                variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('wallet')}
                className="w-full"
                disabled={!address}
              >
                Crypto Wallet
              </Button>
            </div>
          </div>

          {/* Payment Forms */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="1234 5678 9012 3456"
                  disabled={isProcessing}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY"
                    disabled={isProcessing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input 
                    id="cvc" 
                    placeholder="123"
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCardPayment}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Pay with Card'}
              </Button>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="space-y-4">
              {address ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please connect your wallet to continue
                  </p>
                </div>
              )}
              <Button 
                onClick={handleWalletPayment}
                disabled={isProcessing || !address}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Pay with Wallet'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
