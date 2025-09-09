'use client';

import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Ethereum, Polygon } from '@thirdweb-dev/chains';

const activeChains = [Ethereum, Polygon];

interface ThirdWebProviderProps {
  children: React.ReactNode;
}

export default function ThirdWebProvider({ children }: ThirdWebProviderProps) {
  return (
    <ThirdwebProvider
      activeChain={Ethereum}
      supportedChains={activeChains}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      secretKey={process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY}
    >
      {children}
    </ThirdwebProvider>
  );
}
