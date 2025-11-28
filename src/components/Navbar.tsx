// src/components/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react'; // npm install lucide-react
// Placeholder for WalletButton - create this component separately later
const WalletButtonPlaceholder = ({ connectedAccount, connectWallet }) => {
  if (!connectedAccount) {
    return (
      <button
        onClick={connectWallet}
        className="rounded-md bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 font-semibold text-primary-foreground transition-all hover:from-purple-600 hover:to-blue-600"
      >
        Connect Wallet
      </button>
    );
  }
  return (
    <div className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground">
      {`${connectedAccount.substring(0, 6)}...${connectedAccount.substring(
        connectedAccount.length - 4
      )}`}
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Now we know we are on the client
    const fetchAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
          window.ethereum.on('accountsChanged', handleAccountsChanged);
        } catch (err) {
          console.error('Error fetching initial accounts:', err);
        }
      }
    };
    fetchAccount();
    return () => {
      if (window.ethereum?.removeListener) {
        // Check if removeListener exists
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setConnectedAccount(accounts[0]);
    } else {
      setConnectedAccount('');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        handleAccountsChanged(accounts);
      } catch (err) {
        console.error('Error connecting wallet:', err);
        alert('Failed to connect wallet. See console for details.');
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask!');
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Create', path: '/create' }, // Update path to your minting page
    { name: 'Profile', path: '/profile' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-border bg-background/80 px-6 py-4 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <img src="/logo.png" alt="PromptVerse Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="gradient-text text-2xl font-bold">PromptVerse</h1>
        </Link>

        <div className="hidden items-center space-x-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
          {isClient && (
            <WalletButtonPlaceholder
              connectedAccount={connectedAccount}
              connectWallet={connectWallet}
            />
          )}
          {!isClient && (
            <div className="rounded-md bg-primary/50 px-4 py-2 text-primary-foreground opacity-50">
              Loading...
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isClient && isMenuOpen && (
        <div className="absolute left-0 right-0 top-full flex flex-col space-y-4 border-b border-border bg-card px-6 py-4 shadow-xl md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="block py-2 text-center text-lg text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-2 flex justify-center py-2">
            <WalletButtonPlaceholder
              connectedAccount={connectedAccount}
              connectWallet={connectWallet}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
