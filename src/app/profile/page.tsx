// src/app/profile/page.tsx
'use client';

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
import { fetchUserTransactions } from '@/utils/fetchUserTransactions';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useFollowing } from '@/contexts/FollowingContext';
import { resolveIpfsUrl } from '@/utils/ipfs';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

function formatAddress(addr: string | undefined | null) {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { favorites } = useFavorites();
  const { following } = useFollowing();

  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [createdPrompts, setCreatedPrompts] = useState<PromptCardProps[]>([]);
  const [ownedPrompts, setOwnedPrompts] = useState<PromptCardProps[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<PromptCardProps[]>([]);
  const [followingPrompts, setFollowingPrompts] = useState<PromptCardProps[]>([]);

  const [loading, setLoading] = useState(true);
  const [networkName, setNetworkName] = useState<string>('Unknown Network');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [totalRoyalties, setTotalRoyalties] = useState<string>('0');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Network mapping for display
  const getNetworkName = (id: string | null) => {
    if (!id) return 'Unknown Network';
    const networks: { [key: string]: string } = {
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
          // Get network
          const network = await provider.getNetwork();
          setNetworkName(getNetworkName(network.chainId?.toString() ?? null));
          // Get balance
          const balanceWei = await provider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balanceWei));
          await loadPrompts(accounts[0], provider);
        }
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setConnectedAccount(newAccounts[0]);
            loadPrompts(newAccounts[0], provider);
            // Update balance
            provider.getBalance(newAccounts[0]).then((bal) => {
              setBalance(ethers.formatEther(bal));
            });
          } else {
            setConnectedAccount(null);
            setCreatedPrompts([]);
            setOwnedPrompts([]);
            setFavoritePrompts([]);
            setFollowingPrompts([]);
            setBalance('0');
          }
        });
      } else {
        setConnectedAccount(null);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Load All Prompts Data
  const loadPrompts = useCallback(async (account: string, provider: ethers.Provider) => {
    setLoading(true);
    setError('');
    try {
      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not configured');
      }
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);

      // Helper to fetch PromptCard data for a given tokenId
      const fetchPromptData = async (tokenId: string): Promise<PromptCardProps> => {
        try {
          const [tokenURI, saleData, promptData] = await Promise.all([
            contract.tokenURI(tokenId),
            contract.getSaleData(tokenId),
            contract.getPromptData(tokenId),
          ]);
          let card: PromptCardProps = {
            id: tokenId,
            title: promptData.title || `Prompt #${tokenId}`,
            preview: promptData.description || 'No description.',
            image: undefined,
            price:
              saleData.isForSale && saleData.price > 0
                ? ethers.formatEther(saleData.price)
                : 'Not for Sale',
            creator: {
              address: promptData.creator,
              name: formatAddress(promptData.creator),
            },
          };
          if (tokenURI && tokenURI.startsWith('ipfs://')) {
            const url = resolveIpfsUrl(tokenURI);
            if (url) {
              const res = await fetch(url);
              if (res.ok) {
                const meta = await res.json();
                card.title = meta.name || card.title;
                card.preview = meta.description || card.preview;
                if (meta.image) {
                  const imageUrl = resolveIpfsUrl(meta.image);
                  if (imageUrl) card.image = imageUrl;
                }
              }
            }
          }
          return card;
        } catch (e) {
          console.error(`Error fetching data for token ${tokenId}`, e);
          return {
            id: tokenId,
            title: `Error #${tokenId}`,
            preview: 'Failed to load',
            price: '0',
            creator: { address: '0x000' }
          };
        }
      };

      // 1. Fetch Created Prompts
      let createdTokenIds: string[] = [];
      try {
        createdTokenIds = (await contract.getTokensByCreator(account)).map((x: any) => x.toString());
      } catch { createdTokenIds = []; }
      const createdCards = await Promise.all(createdTokenIds.map(fetchPromptData));
      setCreatedPrompts(createdCards);

      // 2. Fetch Owned Prompts
      let ownedTokenIds: string[] = [];
      try {
        ownedTokenIds = (await contract.getTokensByOwner(account)).map((x: any) => x.toString());
      } catch { ownedTokenIds = []; }
      const ownedCards = await Promise.all(ownedTokenIds.map(fetchPromptData));
      setOwnedPrompts(ownedCards);

      // 3. Fetch Favorites
      // favorites is an array of tokenIds from context
      if (favorites.length > 0) {
        const favCards = await Promise.all(favorites.map(fetchPromptData));
        setFavoritePrompts(favCards);
      } else {
        setFavoritePrompts([]);
      }

      // 4. Fetch Following Prompts
      // following is an array of creator addresses from context
      if (following.length > 0) {
        let allFollowingTokenIds: string[] = [];
        for (const creatorAddr of following) {
          try {
            const tokens = (await contract.getTokensByCreator(creatorAddr)).map((x: any) => x.toString());
            allFollowingTokenIds = [...allFollowingTokenIds, ...tokens];
          } catch (e) {
            console.error(`Failed to fetch tokens for creator ${creatorAddr}`, e);
          }
        }
        // Limit to recent 20 for performance if needed, or just fetch all
        const followingCards = await Promise.all(allFollowingTokenIds.map(fetchPromptData));
        setFollowingPrompts(followingCards);
      } else {
        setFollowingPrompts([]);
      }

      // 5. Fetch transactions
      const userTransactions = await fetchUserTransactions(contract, provider, account);
      setTransactions(userTransactions);

      // 6. Calculate royalties
      const royaltyTransactions = userTransactions.filter((tx) => tx.type === 'Royalty');
      const totalRoyaltiesReceived = royaltyTransactions.reduce((sum, tx) => {
        const amount = parseFloat(tx.price);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      setTotalRoyalties(totalRoyaltiesReceived.toFixed(4));

    } catch (err: any) {
      setError('Failed to fetch your prompts: ' + (err?.message || 'Unknown error'));
    }
    setLoading(false);
  }, [favorites, following]);

  // Re-fetch when favorites or following change
  useEffect(() => {
    if (connectedAccount && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      loadPrompts(connectedAccount, provider);
    }
  }, [favorites, following, connectedAccount, loadPrompts]);


  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask Not Detected',
        description: 'Please install MetaMask to use this feature.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const accounts = await window.ethereum.request?.({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(balanceWei));
        await loadPrompts(accounts[0], provider);
        const network = await provider.getNetwork();
        setNetworkName(getNetworkName(network.chainId?.toString() ?? null));
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect to your wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !connectedAccount) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 pb-16 pt-24 text-center">
          <div className="flex h-48 items-center justify-center">
            <div className="h-12 w-12 animate-pulse-glow rounded-full bg-purple-600/30"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!connectedAccount) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 pb-16 pt-24 text-center">
          <div className="glass mx-auto max-w-md p-8">
            <h1 className="gradient-text mb-6 text-3xl font-bold">Connect Your Wallet</h1>
            <p className="mb-8 text-gray-300">
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
      <main className="px-4 pb-16 pt-24">
        <div className="container mx-auto max-w-6xl">
          {/* Profile Header */}
          <div className="glass mb-8 rounded-lg p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-purple-500">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${connectedAccount}`}
                    alt="Profile Avatar"
                    className="h-full w-full bg-gradient-to-br from-purple-500 to-blue-500 object-cover"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <p className="mb-1 text-sm text-muted-foreground">Wallet Address</p>
                <h1 className="mb-4 font-mono text-xl font-semibold text-purple-400">
                  {formatAddress(connectedAccount)}
                </h1>
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">Balance</p>
                    <p className="text-lg font-bold text-green-400">
                      {parseFloat(balance).toFixed(4)} ETH
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">Royalties</p>
                    <p className="text-lg font-bold text-blue-400">{totalRoyalties} ETH</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">Created</p>
                    <p className="text-lg font-bold">{createdPrompts.length}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="mb-1 text-xs text-muted-foreground">Followers</p>
                    <p className="text-lg font-bold">-</p> {/* Follower count not tracked on-chain/local yet */}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Network:</span>
                    <span className="ml-2 text-purple-400">{networkName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2 border-border bg-muted p-1 sm:flex-nowrap">
              <TabsTrigger value="created" className="flex-1">Created ({createdPrompts.length})</TabsTrigger>
              <TabsTrigger value="owned" className="flex-1">Owned ({ownedPrompts.length})</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">Favorites ({favoritePrompts.length})</TabsTrigger>
              <TabsTrigger value="following" className="flex-1">Following ({followingPrompts.length})</TabsTrigger>
              <TabsTrigger value="transactions" className="flex-1">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="created">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {createdPrompts.length > 0 ? (
                  createdPrompts.map((prompt) => <PromptCard key={prompt.id} {...prompt} />)
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="mb-4 text-muted-foreground">You haven't created any prompts yet.</p>
                    <Button asChild><a href="/create">Create Your First Prompt</a></Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="owned">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ownedPrompts.length > 0 ? (
                  ownedPrompts.map((prompt) => <PromptCard key={prompt.id} {...prompt} />)
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="mb-4 text-muted-foreground">You don't own any prompts yet.</p>
                    <Button asChild><a href="/marketplace">Browse Marketplace</a></Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoritePrompts.length > 0 ? (
                  favoritePrompts.map((prompt) => <PromptCard key={prompt.id} {...prompt} />)
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="mb-4 text-muted-foreground">You haven't favorited any prompts yet.</p>
                    <Button asChild><a href="/marketplace">Browse Marketplace</a></Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="following">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {followingPrompts.length > 0 ? (
                  followingPrompts.map((prompt) => <PromptCard key={prompt.id} {...prompt} />)
                ) : (
                  <div className="col-span-full py-10 text-center">
                    <p className="mb-4 text-muted-foreground">
                      {following.length === 0 ? "You aren't following anyone yet." : "The creators you follow haven't created any prompts yet."}
                    </p>
                    <Button asChild><a href="/marketplace">Find Creators</a></Button>
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
                          <th className="px-4 py-3 text-left font-medium">Event</th>
                          <th className="px-4 py-3 text-left font-medium">Prompt</th>
                          <th className="px-4 py-3 text-left font-medium">From/To</th>
                          <th className="px-4 py-3 text-left font-medium">Price</th>
                          <th className="px-4 py-3 text-left font-medium">Date</th>
                          <th className="px-4 py-3 text-left font-medium">Tx Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((tx, index) => (
                            <tr key={index} className="border-b border-border">
                              <td className="px-4 py-3">
                                <span className={
                                  tx.type === 'Purchase' ? 'text-blue-400' :
                                    tx.type === 'Sale' ? 'text-green-400' :
                                      tx.type === 'Mint' ? 'text-purple-400' : 'text-yellow-400'
                                }>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <a href={`/prompt/${tx.promptId}`} className="transition-colors hover:text-purple-400">
                                  {tx.promptTitle}
                                </a>
                              </td>
                              <td className="px-4 py-3">
                                {tx.type === 'Purchase' && tx.from && <span>From: {formatAddress(tx.from)}</span>}
                                {tx.type === 'Sale' && tx.to && <span>To: {formatAddress(tx.to)}</span>}
                                {tx.type === 'Royalty' && tx.to && <span>From: {formatAddress(tx.from || '')}</span>}
                                {tx.type === 'Mint' && <span>-</span>}
                              </td>
                              <td className="px-4 py-3">{tx.price === '-' ? '-' : `${tx.price} ETH`}</td>
                              <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                  {`${tx.txHash.substring(0, 6)}...${tx.txHash.substring(tx.txHash.length - 4)}`}
                                </a>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">No transactions found</td>
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
