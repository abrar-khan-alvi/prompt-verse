import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, User, ExternalLink, Copy, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  getNetworkId,
  formatAddress,
  listenForAccountChanges,
  listenForNetworkChanges,
} from '@/utils/web3';

const NETWORK_NAMES: { [key: string]: string } = {
  '1': 'Ethereum Mainnet',
  '5': 'Goerli Testnet',
  '11155111': 'Sepolia Testnet',
  '137': 'Polygon Mainnet',
  '80001': 'Mumbai Testnet',
  '31337': 'Localhost',
};

const WalletButton = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = async () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        // Check if already connected
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);

            // Get network information
            const currentNetworkId = await getNetworkId();
            setNetworkId(currentNetworkId);
          }
        } catch (error) {
          console.error('Failed to get accounts', error);
        }
      }
    };

    checkMetaMask();

    // Set up listeners for account and network changes
    const accountChangesCleanup = listenForAccountChanges((accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(accounts[0]);
      }
    });

    const networkChangesCleanup = listenForNetworkChanges((newNetworkId) => {
      setNetworkId(newNetworkId);
    });

    // Clean up listeners on component unmount
    return () => {
      if (accountChangesCleanup) accountChangesCleanup();
      if (networkChangesCleanup) networkChangesCleanup();
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to use this feature');
      return;
    }

    setIsConnecting(true);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      // Get network information
      const currentNetworkId = await getNetworkId();
      setNetworkId(currentNetworkId);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('User rejected the request', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (!account) return;

    navigator.clipboard.writeText(account);
    setHasCopied(true);
    toast.success('Address copied to clipboard!');

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  const openEtherscan = () => {
    if (!account) return;

    // Use the appropriate Etherscan URL based on network
    let etherscanBaseUrl = 'https://etherscan.io'; // Default to Ethereum mainnet

    if (networkId === '5') {
      etherscanBaseUrl = 'https://goerli.etherscan.io';
    } else if (networkId === '11155111') {
      etherscanBaseUrl = 'https://sepolia.etherscan.io';
    } else if (networkId === '137') {
      etherscanBaseUrl = 'https://polygonscan.com';
    } else if (networkId === '80001') {
      etherscanBaseUrl = 'https://mumbai.polygonscan.com';
    }

    window.open(`${etherscanBaseUrl}/address/${account}`, '_blank');
  };

  // Generate avatar image from address
  const generateAvatarUrl = (address: string) => {
    return `https://avatars.dicebear.com/api/identicon/${address}.svg`;
  };

  const getNetworkName = (id: string | null) => {
    if (!id) return 'Unknown Network';
    return NETWORK_NAMES[id] || `Chain ID: ${id}`;
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary/70">
              <Avatar className="h-6 w-6">
                <AvatarImage src={generateAvatarUrl(account)} alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{formatAddress(account)}</span>
                <span className="text-xs text-muted-foreground">{getNetworkName(networkId)}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Connected as</p>
              <p className="truncate font-mono text-sm">{account}</p>
            </div>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Network</p>
              <p className="text-sm">{getNetworkName(networkId)}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddressToClipboard}>
              {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openEtherscan}>
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>View on Etherscan</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 transition-all hover:from-purple-700 hover:to-blue-700"
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
};

export default WalletButton;
