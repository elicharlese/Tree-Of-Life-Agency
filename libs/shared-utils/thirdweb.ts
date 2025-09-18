import { createThirdwebClient } from "thirdweb";
import { createWallet } from "thirdweb/wallets";

if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required");
}

// Create the ThirdWeb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

// Wallet configuration
export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
];

// Chain configurations (you can add more chains as needed)
export const supportedChains = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    rpc: "https://ethereum-rpc.publicnode.com",
  },
  polygon: {
    id: 137,
    name: "Polygon",
    rpc: "https://polygon-rpc.com",
  },
  base: {
    id: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
  },
  // Add more chains as needed
};

// ThirdWeb configuration object
export const thirdwebConfig = {
  client,
  wallets,
  supportedChains,
  theme: "dark" as const,
  modalSize: "wide" as const,
};

// Helper function to get client ID
export const getClientId = () => process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
