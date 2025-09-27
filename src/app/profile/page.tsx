// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AIPromptNFTAbiFile from '@/lib/abis/AIPromptNFT.json';
import PromptCard, { PromptCardProps } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MY_PINATA_GATEWAY = "https://blush-causal-felidae-159.mypinata.cloud/ipfs/";
const BESU_RPC_URL = "http://localhost:8545";

function resolveIpfsUrl(ipfsUri: string | null | undefined): string | null {
  if (!ipfsUri || typeof ipfsUri !== 'string' || !ipfsUri.startsWith('ipfs://')) {
    if (ipfsUri && (ipfsUri.startsWith('http://') || ipfsUri.startsWith('https://'))) {
        return ipfsUri;
    }
    return null;
  }
  const cid = ipfsUri.substring(7);
  return `${MY_PINATA_GATEWAY}${cid}`;
}

function formatAddress(addr: string | undefined | null) {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [createdPrompts, setCreatedPrompts] = useState<PromptCardProps[]>([]);
  const [ownedPrompts, setOwnedPrompts] = useState<PromptCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkName, setNetworkName] = useState<string>('Unknown Network');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bio, setBio] = useState<string>('Blockchain enthusiast and prompt creator');
  const [error, setError] = useState('');

  // Dummy transaction data (replace with real events if you want)
  const [transactions, setTransactions] = useState<any[]>([]);

  // Network mapping for display
  const getNetworkName = (id: string | null) => {
    if (!id) return 'Unknown Network';
    const networks: {[key: string]: string} = {
      '1': 'Ethereum Mainnet',
      '5': 'Goerli Testnet',
      '11155111': 'Sepolia Testnet',
      '137': 'Polygon Mainnet',
      '80001': 'Mumbai Testnet',
    };
    return networks[id] || `Chain ID: ${id}`;
  };

  // Connect Wallet Logic (MetaMask)
  useEffect(() => {
    async function init() {
      setLoading(true);
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request?.({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          setProfileImage(`https://avatars.dicebear.com/api/identicon/${accounts[0]}.svg`);
          // Get network
          const network = await provider.getNetwork();
          setNetworkName(getNetworkName(network.chainId?.toString() ?? null));
          await loadPrompts(accounts[0], provider);
        }
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setConnectedAccount(newAccounts[0]);
            setProfileImage(`https://avatars.dicebear.com/api/identicon/${newAccounts[0]}.svg`);
            loadPrompts(newAccounts[0], provider);
          } else {
            setConnectedAccount(null);
            setProfileImage(null);
            setCreatedPrompts([]);
            setOwnedPrompts([]);
          }
        });
      } else {
        setConnectedAccount(null);
        setProfileImage(null);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Load Created and Owned Prompts
  const loadPrompts = useCallback(async (account: string, provider: ethers.Provider) => {
    setLoading(true);
    setError('');
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);

      // Fetch created prompts: getTokensByCreator, fallback: empty array if function missing
      let createdTokenIds: string[] = [];
      try {
        createdTokenIds = (await contract.getTokensByCreator(account)).map((x: any) => x.toString());
      } catch { createdTokenIds = []; }

      // Fetch owned prompts: getTokensByOwner
      let ownedTokenIds: string[] = [];
      try {
        ownedTokenIds = (await contract.getTokensByOwner(account)).map((x: any) => x.toString());
      } catch { ownedTokenIds = []; }

      // Helper to fetch PromptCard data for a given tokenId
      const fetchPromptData = async (tokenId: string): Promise<PromptCardProps> => {
        const [tokenURI, saleData, promptData] = await Promise.all([
          contract.tokenURI(tokenId),
          contract.getSaleData(tokenId),
          contract.getPromptData(tokenId),
        ]);
        let card: PromptCardProps = {
          id: tokenId,
          title: promptData.title || `Prompt #${tokenId}`,
          preview: promptData.description || "No description.",
          image: undefined,
          price: saleData.isForSale && saleData.price > 0 ? ethers.formatEther(saleData.price) : "Not for Sale",
          creator: {
            address: promptData.creator,
            name: formatAddress(promptData.creator),
          },
        };
        if (tokenURI && tokenURI.startsWith("ipfs://")) {
          const url = resolveIpfsUrl(tokenURI);
          if (url) {
            const res = await fetch(url);
            if (res.ok) {
              const meta = await res.json();
              card.title = meta.name || card.title;
              card.preview = meta.description || card.preview;
              if (meta.image) card.image = resolveIpfsUrl(meta.image);
            }
          }
        }
        return card;
      };

      // Fetch Created Prompts
      const createdPromptCards = await Promise.all(createdTokenIds.map(fetchPromptData));
      setCreatedPrompts(createdPromptCards);

      // Fetch Owned Prompts (may overlap with created)
      const ownedPromptCards = await Promise.all(ownedTokenIds.map(fetchPromptData));
      setOwnedPrompts(ownedPromptCards);

      // (Optional) Fetch user bio from somewhere if you store on chain/IPFS

      // (Optional) Fetch transactions/events and setTransactions([...])

    } catch (err: any) {
      setError("Failed to fetch your prompts: " + (err?.message || "Unknown error"));
    }
    setLoading(false);
  }, []);

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Detected",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive"
      });
      return;
    }
    try {
      const accounts = await window.ethereum.request?.({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        setProfileImage(`https://avatars.dicebear.com/api/identicon/${accounts[0]}.svg`);
        const provider = new ethers.BrowserProvider(window.ethereum);
        await loadPrompts(accounts[0], provider);
        const network = await provider.getNetwork();
        setNetworkName(getNetworkName(network.chainId?.toString() ?? null));
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="pt-24 pb-16 px-4 container mx-auto text-center">
          <div className="flex items-center justify-center h-48">
            <div className="animate-pulse-glow h-12 w-12 rounded-full bg-purple-600/30"></div>
          </div>
        </main>
      </div>
    );
  }
  if (!connectedAccount) {
    return (
      <div className="min-h-screen">
        <main className="pt-24 pb-16 px-4 container mx-auto text-center">
          <div className="glass max-w-md mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6 gradient-text">Connect Your Wallet</h1>
            <p className="text-gray-300 mb-8">
              Connect your Ethereum wallet to view your profile, created prompts, and transaction history.
            </p>
            <Button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Connect Wallet
            </Button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="glass p-6 rounded-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {formatAddress(connectedAccount).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl font-bold mb-1">
                  {`User ${formatAddress(connectedAccount)}`}
                </h1>
                <p className="text-sm text-purple-400 mb-2">
                  {formatAddress(connectedAccount)}
                </p>
                <p className="text-gray-300 mb-3">{bio}</p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Network:</span>
                    <span className="ml-2">{networkName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">{createdPrompts.length} prompts</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owned:</span>
                    <span className="ml-2">{ownedPrompts.length} prompts</span>
                  </div>
                </div>
              </div>
              <div className="md:self-start">
                <Button variant="outline" className="border-purple-500 hover:bg-purple-500/20">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="w-full bg-muted border-border mb-6">
              <TabsTrigger value="created" className="flex-1">Created ({createdPrompts.length})</TabsTrigger>
              <TabsTrigger value="owned" className="flex-1">Owned ({ownedPrompts.length})</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="created">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdPrompts.length > 0 ? (
                  createdPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} {...prompt} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground mb-4">You haven't created any prompts yet.</p>
                    <Button asChild>
                      <a href="/create">Create Your First Prompt</a>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="owned">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedPrompts.length > 0 ? (
                  ownedPrompts.map((prompt) => (
                    <PromptCard key={prompt.id} {...prompt} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground mb-4">You don't own any prompts yet.</p>
                    <Button asChild>
                      <a href="/marketplace">Browse Marketplace</a>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="transactions">
              <Card className="glass">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium">Event</th>
                          <th className="text-left py-3 px-4 font-medium">Prompt</th>
                          <th className="text-left py-3 px-4 font-medium">From/To</th>
                          <th className="text-left py-3 px-4 font-medium">Price</th>
                          <th className="text-left py-3 px-4 font-medium">Date</th>
                          <th className="text-left py-3 px-4 font-medium">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((tx, index) => (
                            <tr key={index} className="border-b border-border">
                              <td className="py-3 px-4">
                                <span className={
                                  tx.type === 'Purchase' ? 'text-blue-400' :
                                  tx.type === 'Sale' ? 'text-green-400' :
                                  tx.type === 'Mint' ? 'text-purple-400' : 'text-yellow-400'
                                }>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <a href={`/prompt/${tx.promptId}`} className="hover:text-purple-400 transition-colors">
                                  {tx.promptTitle}
                                </a>
                              </td>
                              <td className="py-3 px-4">
                                {tx.type === 'Purchase' && tx.from && (
                                  <span>From: {formatAddress(tx.from)}</span>
                                )}
                                {tx.type === 'Sale' && tx.to && (
                                  <span>To: {formatAddress(tx.to)}</span>
                                )}
                                {tx.type === 'Royalty' && tx.to && (
                                  <span>From: {formatAddress(tx.from || '')}</span>
                                )}
                                {tx.type === 'Mint' && (<span>-</span>)}
                              </td>
                              <td className="py-3 px-4">
                                {tx.price === '-' ? '-' : `${tx.price} ETH`}
                              </td>
                              <td className="py-3 px-4">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <a
                                  href={`https://etherscan.io/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {`${tx.txHash.substring(0, 6)}...${tx.txHash.substring(tx.txHash.length - 4)}`}
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
