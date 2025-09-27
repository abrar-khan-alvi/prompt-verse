// src/components/Navbar.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // npm install lucide-react
// Placeholder for WalletButton - create this component separately later
const WalletButtonPlaceholder = ({ connectedAccount, connectWallet }) => {
  if (!connectedAccount) {
    return (
      <button
        onClick={connectWallet}
        className="px-4 py-2 rounded-md bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-primary-foreground font-semibold transition-all"
      >
        Connect Wallet
      </button>
    );
  }
  return (
    <div className="px-3 py-2 bg-secondary text-sm text-secondary-foreground rounded-md">
      {`${connectedAccount.substring(0, 6)}...${connectedAccount.substring(
        connectedAccount.length - 4
      )}`}
    </div>
  );
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Now we know we are on the client
    const fetchAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
          window.ethereum.on("accountsChanged", handleAccountsChanged);
        } catch (err) {
          console.error("Error fetching initial accounts:", err);
        }
      }
    };
    fetchAccount();
    return () => {
      if (window.ethereum?.removeListener) {
        // Check if removeListener exists
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setConnectedAccount(accounts[0]);
    } else {
      setConnectedAccount("");
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        handleAccountsChanged(accounts);
      } catch (err) {
        console.error("Error connecting wallet:", err);
        alert("Failed to connect wallet. See console for details.");
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask!");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Create", path: "/create" }, // Update path to your minting page
    { name: "Profile", path: "/profile" },
    { name: 'Marketplace', path: '/marketplace' },
  ];

  return (
    <nav className="w-full py-4 px-6 border-b border-border backdrop-blur-lg fixed top-0 left-0 right-0 z-50 bg-background/80">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <h1 className="text-2xl font-bold gradient-text">PromptVerse</h1>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors"
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
            <div className="px-4 py-2 rounded-md bg-primary/50 text-primary-foreground opacity-50">
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
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border py-4 px-6 flex flex-col space-y-4 shadow-xl">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-muted-foreground hover:text-foreground transition-colors py-2 block text-center text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="py-2 mt-2 flex justify-center">
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
