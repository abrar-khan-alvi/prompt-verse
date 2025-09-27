
// Type definitions for Ethereum window object
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      chainId?: string;
      networkVersion?: string;
    };
  }
}

// Connect to MetaMask wallet
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

// Get current connected account
export const getCurrentAccount = async () => {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
};

// Get current network ID
export const getNetworkId = async () => {
  if (!window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16).toString();
  } catch (error) {
    console.error("Error getting network ID:", error);
    return null;
  }
};

// Check if the user is connected to the correct network (Ethereum Mainnet or specific testnet)
export const checkNetwork = async (requiredNetworkId: string = '1') => {
  const networkId = await getNetworkId();
  return networkId === requiredNetworkId;
};

// Switch to a specific network
export const switchNetwork = async (networkId: string) => {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${parseInt(networkId).toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      // For simplicity, we're not implementing network addition here
      throw new Error("Network not available in your MetaMask, please add it manually.");
    }
    throw error;
  }
};

// Format ETH value for display
export const formatEth = (value: string | number) => {
  return parseFloat(value.toString()).toFixed(4);
};

// Format address for display
export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Listen for account changes
export const listenForAccountChanges = (callback: (accounts: string[]) => void) => {
  if (!window.ethereum) return;
  
  window.ethereum.on('accountsChanged', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('accountsChanged', callback);
  };
};

// Listen for network changes
export const listenForNetworkChanges = (callback: (networkId: string) => void) => {
  if (!window.ethereum) return;
  
  const handleChainChanged = (chainId: string) => {
    const networkId = parseInt(chainId, 16).toString();
    callback(networkId);
  };
  
  window.ethereum.on('chainChanged', handleChainChanged);
  
  // Return cleanup function
  return () => {
    window.ethereum?.removeListener('chainChanged', handleChainChanged);
  };
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return window.ethereum && window.ethereum.isMetaMask;
};

// Sign a message with the connected wallet (for authentication)
export const signMessage = async (message: string): Promise<string> => {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error("No account connected. Please connect your wallet first.");
    }

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });

    return signature;
  } catch (error) {
    console.error("Failed to sign message:", error);
    throw error;
  }
};

// Mock function to mint a prompt NFT (will be replaced with actual contract call)
export const mintPromptNFT = async (promptData: any) => {
  // This is a placeholder - in a real implementation, this would:
  // 1. Upload prompt data/image to IPFS
  // 2. Get the IPFS CID
  // 3. Call the smart contract's mint function
  
  console.log("Minting prompt:", promptData);
  return {
    success: true,
    tokenId: Math.floor(Math.random() * 10000).toString(),
    transactionHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
};

export default {
  connectWallet,
  getCurrentAccount,
  getNetworkId,
  checkNetwork,
  switchNetwork,
  formatEth,
  formatAddress,
  listenForAccountChanges,
  listenForNetworkChanges,
  isMetaMaskInstalled,
  signMessage,
  mintPromptNFT
};
