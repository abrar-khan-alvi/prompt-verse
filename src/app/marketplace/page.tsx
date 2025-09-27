// src/app/marketplace/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import NextLink from 'next/link';
import AIPromptNFTAbiFile from '@/lib/abis/AIPromptNFT.json';
import PromptCard, { PromptCardProps } from '@/components/PromptCard'; // Import your existing PromptCard
import { Button } from '@/components/ui/button'; // Assuming for "View More" or future filters

// --- CONFIGURATION ---
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const MY_PINATA_GATEWAY = "https://blush-causal-felidae-159.mypinata.cloud/ipfs/";
const BESU_RPC_URL = "http://localhost:8545";
const EVENT_QUERY_BATCH_SIZE = 5000; // Not used here, getTokensForSale is direct
const CONTRACT_DEPLOYMENT_BLOCK = 0; // Not directly used here
// ---------------------

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

// This interface will be the structure of objects in our listedNfts state
// It directly matches PromptCardProps, with an optional seller if you want to distinguish
interface MarketplaceNftDisplayData extends PromptCardProps {
  // PromptCardProps already includes: id, title, preview, image, price, creator
  // We can add seller if we want to be explicit, or map seller to creator for PromptCard
  fetchError?: string | null;
  tokenURI?: string | null; // For debugging or linking
}

export default function MarketplacePage() {
  const [listedNfts, setListedNfts] = useState<MarketplaceNftDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window.ethereum !== 'undefined') {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    } else {
      try {
        setProvider(new ethers.JsonRpcProvider(BESU_RPC_URL));
      } catch (e) {
        console.error("Failed to initialize JsonRpcProvider for Marketplace:", e);
        setError("Could not connect to blockchain provider.");
      }
    }
  }, []);

  const fetchListedNfts = useCallback(async () => {
    if (!provider || !CONTRACT_ADDRESS) {
      if (isClient && !provider) setError("Blockchain provider not available.");
      return;
    }
    setLoading(true);
    setError('');
    setListedNfts([]);

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AIPromptNFTAbiFile.abi, provider);
      console.log("Fetching tokens listed for sale from contract...");
      const tokenIdsForSale: ethers.BigNumberish[] = await contract.getTokensForSale();
      console.log(`Found ${tokenIdsForSale.length} token IDs for sale:`, tokenIdsForSale.map(id => id.toString()));

      if (tokenIdsForSale.length === 0) {
        setLoading(false);
        return;
      }

      const nftsDataPromises = tokenIdsForSale.map(async (tokenIdBigNum): Promise<MarketplaceNftDisplayData> => {
        const tokenIdStr = tokenIdBigNum.toString();
        const tokenIdNum = ethers.getBigInt(tokenIdBigNum); // For contract calls

        try {
          console.log(`Fetching details for sale token ID: ${tokenIdStr}`);
          const saleData = await contract.getSaleData(tokenIdNum);
          const tokenURIFromContract = await contract.tokenURI(tokenIdNum);
          // Optional: Fetch original creator if needed for display differentiation
          // const promptChainData = await contract.getPromptData(tokenIdNum);
          // const originalCreatorAddress = promptChainData.creator;

          let nftCardData: MarketplaceNftDisplayData = {
            id: tokenIdStr,
            title: `Prompt #${tokenIdStr}`, // Default title, to be overridden by metadata
            preview: "Loading details...",
            image: undefined, // Start with undefined
            price: saleData.price ? ethers.formatEther(saleData.price) : "0.00",
            creator: { // For PromptCard, this 'creator' will be the current seller
              address: saleData.seller.toString(),
              name: undefined, // Will attempt to set from metadata if available, or use formatted address
            },
            fetchError: null,
            tokenURI: tokenURIFromContract?.toString()
          };

          if (nftCardData.tokenURI && nftCardData.tokenURI.startsWith('ipfs://')) {
            const metadataHttpUrl = resolveIpfsUrl(nftCardData.tokenURI);
            if (metadataHttpUrl) {
              const metadataResponse = await fetch(metadataHttpUrl);
              if (metadataResponse.ok) {
                const fetchedMetadata = await metadataResponse.json();
                nftCardData.title = fetchedMetadata.name || nftCardData.title;
                nftCardData.preview = fetchedMetadata.description || "No description available.";
                if (fetchedMetadata.image) {
                  nftCardData.image = resolveIpfsUrl(fetchedMetadata.image) || undefined;
                }
                // If metadata contains a 'creatorName' or similar for the original creator:
                // if (fetchedMetadata.originalCreatorName) {
                //    nftCardData.creator.name = fetchedMetadata.originalCreatorName;
                // }
                // If your PromptCard needs to show original creator AND seller, you'd adjust PromptCardProps
              } else {
                nftCardData.fetchError = `Metadata fetch failed (Status: ${metadataResponse.status})`;
                nftCardData.preview = "Could not load prompt details.";
              }
            } else { 
              nftCardData.fetchError = "Could not resolve IPFS URI for metadata.";
              nftCardData.preview = "Invalid metadata link.";
            }
          } else {
            nftCardData.fetchError = "Invalid or non-IPFS Token URI from contract.";
            nftCardData.preview = "Invalid data link from contract.";
          }
          return nftCardData;
        } catch (itemError: any) {
            console.error(`Error processing token ID ${tokenIdStr}:`, itemError);
            return {
                id: tokenIdStr, title: `NFT #${tokenIdStr} (Error)`, preview: "Error loading details.",
                price: "N/A", creator: { address: ethers.ZeroAddress },
                fetchError: itemError.message || "Unknown error processing this item.", tokenURI: null
            };
        }
      });

      const resolvedNftsData = await Promise.all(nftsDataPromises);
      setListedNfts(resolvedNftsData); // Already sorted by contract if getTokensForSale returns them in order
    } catch (e: any) {
      console.error("Error fetching listed NFTs:", e);
      setError(`Failed to fetch listed NFTs: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [provider, isClient]); // Dependencies for useCallback

  useEffect(() => {
    if (isClient && provider) {
      fetchListedNfts();
    }
  }, [isClient, provider, fetchListedNfts]); // fetchListedNfts is now stable due to useCallback


  if (!isClient) {
    return <div className="text-center py-10 text-muted-foreground">Loading Marketplace...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 gradient-text">Marketplace</h1>
        <p className="text-lg text-muted-foreground">
          Browse and purchase unique AI Prompt NFTs.
        </p>
      </div>

      {/* You can add filter UI here later, which would modify 'filteredNfts' */}
      {/* <div className="flex flex-wrap justify-center gap-2 mb-10"> ... categories ... </div> */}

      {error && <p className="text-center text-destructive my-4 p-4 bg-destructive/10 rounded-md">{error}</p>}
      {loading && <p className="text-center text-muted-foreground my-4">Loading prompts for sale...</p>}

      {!loading && listedNfts.length === 0 && !error && (
        <p className="text-center text-muted-foreground my-4">
          No NFTs are currently listed for sale.
          <NextLink href="/create" className="text-primary hover:underline ml-2">
            Be the first to mint and list one!
          </NextLink>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {listedNfts.map(nft => (
          // Spread the nft object as props to PromptCard
          // This assumes MarketplaceNftDisplayData is compatible with PromptCardProps
          <PromptCard key={nft.id} {...nft} />
        ))}
      </div>
    </div>
  );
}