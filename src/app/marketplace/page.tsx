'use client';

import { useState, useEffect, useCallback } from 'react';
import NextLink from 'next/link';
import { ethers } from 'ethers';
import { getMarketplaceNFTs } from '@/utils/contractInteraction';
import PromptCard, { PromptCardProps } from '@/components/PromptCard';
import { SearchFilter } from '@/components/SearchFilter';
import { Button } from '@/components/ui/button';

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MY_PINATA_GATEWAY = 'https://blush-causal-felidae-159.mypinata.cloud/ipfs/';
const BESU_RPC_URL = 'http://localhost:8545';

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

interface MarketplaceNftDisplayData extends PromptCardProps {
  fetchError: string | null;
  tokenURI: string;
}

export default function MarketplacePage() {
  const [listedNfts, setListedNfts] = useState<MarketplaceNftDisplayData[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<MarketplaceNftDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window.ethereum !== 'undefined') {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      try {
        setProvider(new ethers.JsonRpcProvider(BESU_RPC_URL));
      } catch (e) {
        console.error('No provider available');
      }
    }
  }, []);

  const fetchListedNfts = useCallback(async () => {
    setLoading(true);
    setError('');
    setListedNfts([]);
    setFilteredNfts([]);

    try {
      console.log('Fetching tokens listed for sale...');
      const rawNfts = await getMarketplaceNFTs();
      console.log(`Found ${rawNfts.length} tokens for sale`);

      if (rawNfts.length === 0) {
        setLoading(false);
        return;
      }

      const nftsDataPromises = rawNfts.map(async (nft: any): Promise<MarketplaceNftDisplayData> => {
        let nftCardData: MarketplaceNftDisplayData = {
          id: nft.tokenId,
          title: nft.title || `Prompt #${nft.tokenId}`,
          preview: nft.description || 'Loading details...',
          image: undefined,
          price: nft.price || '0.00',
          creator: {
            address: nft.seller,
            name: undefined,
          },
          fetchError: null,
          tokenURI: nft.tokenURI,
        };

        if (nftCardData.tokenURI && nftCardData.tokenURI.startsWith('ipfs://')) {
          const metadataHttpUrl = resolveIpfsUrl(nftCardData.tokenURI);
          if (metadataHttpUrl) {
            try {
              const metadataResponse = await fetch(metadataHttpUrl);
              if (metadataResponse.ok) {
                const fetchedMetadata = await metadataResponse.json();
                nftCardData.title = fetchedMetadata.name || nftCardData.title;
                nftCardData.preview = fetchedMetadata.description || 'No description available.';
                if (fetchedMetadata.image) {
                  nftCardData.image = resolveIpfsUrl(fetchedMetadata.image) || undefined;
                }
              } else {
                nftCardData.fetchError = `Metadata fetch failed (Status: ${metadataResponse.status})`;
                nftCardData.preview = 'Could not load prompt details.';
              }
            } catch (e) {
              nftCardData.fetchError = 'Metadata fetch error';
            }
          } else {
            nftCardData.fetchError = 'Could not resolve IPFS URI for metadata.';
            nftCardData.preview = 'Invalid metadata link.';
          }
        } else {
          nftCardData.fetchError = 'Invalid or non-IPFS Token URI from contract.';
          nftCardData.preview = 'Invalid data link from contract.';
        }
        return nftCardData;
      });

      const resolvedNftsData = await Promise.all(nftsDataPromises);
      setListedNfts(resolvedNftsData);
      setFilteredNfts(resolvedNftsData);
    } catch (e: any) {
      console.error('Error fetching listed NFTs:', e);
      setError(`Failed to fetch listed NFTs: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchListedNfts();
    }
  }, [isClient, fetchListedNfts]);

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...listedNfts];

    // 1. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (nft) =>
          nft.title.toLowerCase().includes(term) ||
          nft.preview.toLowerCase().includes(term) ||
          nft.creator.address.toLowerCase().includes(term)
      );
    }

    // 2. Platform Filter
    if (selectedPlatform && selectedPlatform !== 'all') {
      // In a real app, ensure platform is part of the NFT data structure
      // result = result.filter(nft => nft.platform === selectedPlatform);
    }

    // 3. Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'oldest':
        result.sort((a, b) => Number(a.id) - Number(b.id));
        break;
      case 'price_low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
    }

    setFilteredNfts(result);
  }, [listedNfts, searchTerm, selectedPlatform, sortBy]);

  if (!isClient) {
    return <div className="py-10 text-center text-muted-foreground">Loading Marketplace...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="gradient-text mb-2 text-4xl font-bold">Marketplace</h1>
        <p className="text-lg text-muted-foreground">Browse and purchase unique AI Prompt NFTs.</p>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {error && (
        <p className="my-4 rounded-md bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </p>
      )}
      {loading && (
        <p className="my-4 text-center text-muted-foreground">Loading prompts for sale...</p>
      )}

      {!loading && filteredNfts.length === 0 && !error && (
        <div className="my-8 text-center text-muted-foreground">
          <p className="text-lg">No NFTs found matching your criteria.</p>
          {(searchTerm || selectedPlatform) && (
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm('');
                setSelectedPlatform('');
              }}
            >
              Clear Filters
            </Button>
          )}
          {listedNfts.length === 0 && !searchTerm && !selectedPlatform && (
            <NextLink href="/create" className="ml-2 text-primary hover:underline">
              Be the first to mint and list one!
            </NextLink>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-8">
        {filteredNfts.map((nft) => (
          <PromptCard key={nft.id} {...nft} />
        ))}
      </div>
    </div>
  );
}
